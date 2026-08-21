import { app, BrowserWindow, ipcMain, dialog, nativeImage } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

// Extended PATH resolution for macOS, Windows & Linux
function getSearchPaths(): string[] {
  if (isWin) {
    return [
      process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs') : '',
      process.env.APPDATA ? path.join(process.env.APPDATA, 'npm') : '',
      process.env.USERPROFILE ? path.join(process.env.USERPROFILE, '.local', 'bin') : '',
      process.env.USERPROFILE ? path.join(process.env.USERPROFILE, '.cargo', 'bin') : '',
      process.env.ProgramFiles || 'C:\\Program Files',
      process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
      ...(process.env.PATH || '').split(';'),
    ].filter(Boolean);
  } else {
    return [
      path.join(os.homedir(), '.local/bin'),
      path.join(os.homedir(), '.cargo/bin'),
      path.join(os.homedir(), '.nvm/versions/node/current/bin'),
      '/opt/homebrew/bin',
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      ...(process.env.PATH || '').split(':'),
    ].filter(Boolean);
  }
}

function findBinary(name: string): string | null {
  const paths = getSearchPaths();
  const extensions = isWin ? ['.exe', '.cmd', '.bat', ''] : [''];

  for (const base of paths) {
    for (const ext of extensions) {
      const full = path.join(base, `${name}${ext}`);
      try {
        if (fs.existsSync(full)) return full;
      } catch {}

      if (isWin) {
        const subfolder = path.join(base, name, `${name}${ext}`);
        try {
          if (fs.existsSync(subfolder)) return subfolder;
        } catch {}
      }
    }
  }
  return null;
}

function hasApp(appName: string): boolean {
  if (isMac) {
    return (
      fs.existsSync(`/Applications/${appName}.app`) ||
      fs.existsSync(path.join(os.homedir(), `Applications/${appName}.app`))
    );
  }
  if (isWin) {
    const localApp = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', appName, `${appName}.exe`) : '';
    const progFiles = process.env.ProgramFiles ? path.join(process.env.ProgramFiles, appName, `${appName}.exe`) : '';
    const progFiles86 = process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], appName, `${appName}.exe`) : '';
    return (localApp && fs.existsSync(localApp)) || (progFiles && fs.existsSync(progFiles)) || (progFiles86 && fs.existsSync(progFiles86)) || !!findBinary(appName.toLowerCase());
  }
  return !!findBinary(appName.toLowerCase());
}

function createWindow() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  if (isMac && app.dock && !icon.isEmpty()) {
    app.dock.setIcon(icon);
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    backgroundColor: '#09090b',
    icon: icon,
    trafficLightPosition: isMac ? { x: 16, y: 16 } : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.on('did-fail-load', () => {
      setTimeout(() => {
        mainWindow?.loadURL('http://localhost:5173');
      }, 1200);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('dialog:saveFile', async (_, options) => {
    if (!mainWindow) return null;
    return await dialog.showSaveDialog(mainWindow, options);
  });

  // Cross-Platform detection
  ipcMain.handle('cli:detect', async () => {
    return {
      chatgpt: true,
      claude_code: !!findBinary('claude') || fs.existsSync(path.join(os.homedir(), '.local/bin/claude')),
      gemini_cli: !!findBinary('gemini') || fs.existsSync('/usr/local/bin/gemini'),
      ollama: hasApp('Ollama') || !!findBinary('ollama') || fs.existsSync('/usr/local/bin/ollama'),
      opencode: true,
    };
  });

  // Execution via Local CLI / stdin piping
  ipcMain.handle('cli:execute', async (_, { cliType, prompt, model }) => {
    return new Promise((resolve, reject) => {
      let binName = 'claude';
      let args: string[] = ['-p'];

      if (cliType === 'chatgpt' || cliType === 'codex_cli' || cliType === 'codex') {
        const chatgptBin = findBinary('chatgpt') || findBinary('openai') || findBinary('claude');
        binName = chatgptBin || 'claude';
        args = ['-p'];
      } else if (cliType === 'claude_code' || cliType === 'claude') {
        binName = findBinary('claude') || 'claude';
        args = ['-p'];
      } else if (cliType === 'gemini_cli' || cliType === 'gemini') {
        binName = findBinary('gemini') || 'gemini';
        args = ['-p'];
      } else if (cliType === 'ollama') {
        binName = findBinary('ollama') || 'ollama';
        args = ['run', model && model !== 'default' ? model : 'llama3.2'];
      }

      const binaryPath = findBinary(binName) || binName;
      const paths = getSearchPaths();
      const delimiter = isWin ? ';' : ':';

      const proc = spawn(binaryPath, args, {
        env: {
          ...process.env,
          PATH: `${paths.join(delimiter)}${delimiter}${process.env.PATH || ''}`,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdoutData = '';
      let stderrData = '';

      proc.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      proc.on('close', (code) => {
        if (stdoutData.trim().length > 0) {
          resolve(stdoutData.trim());
        } else {
          // If CLI is not logged in or failed, provide clear error message
          reject(new Error(stderrData.trim() || `CLI [${binName}] завершился с кодом ${code}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Не удалось запустить [${binName}]: ${err.message}`));
      });

      // Write prompt via stdin and close stream immediately
      try {
        proc.stdin.write(prompt, 'utf8');
        proc.stdin.end();
      } catch (err: any) {
        reject(new Error(`Ошибка записи в stdin [${binName}]: ${err.message}`));
      }
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
