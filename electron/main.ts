import { app, BrowserWindow, ipcMain, dialog, nativeImage, shell } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';

import { compareSemver } from './semver';

let mainWindow: BrowserWindow | null = null;
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

import { getSearchPaths, findBinary, hasApp } from './cli-discovery';

function createWindow() {
  let iconPath = path.join(__dirname, '../public/icon.png');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '../dist/icon.png');
  }
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(process.resourcesPath, 'icon.png');
  }
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();

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
    },
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

  mainWindow.webContents.on('console-message', (_, level, message, line, sourceId) => {
    console.log(`[Renderer Log lvl=${level}]: ${message} (source: ${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron Load Error ${errorCode}]: ${errorDescription} URL: ${validatedURL}`);
    if (isDev) {
      setTimeout(() => {
        mainWindow?.loadURL('http://127.0.0.1:5174');
      }, 1000);
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5174');
    // mainWindow.webContents.openDevTools(); // Оставляем закомментированным по просьбе
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

  ipcMain.handle('updater:getVersion', async () => {
    return app.getVersion();
  });

  ipcMain.handle('shell:openExternal', async (_, url: string) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url);
    }
  });

  ipcMain.handle('updater:check', async () => {
    const currentVersion = app.getVersion();
    try {
      const res = await fetch('https://api.github.com/repos/darmat1/marlex/releases/latest', {
        headers: {
          'User-Agent': `Marlex-App/${currentVersion}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        return {
          hasUpdate: false,
          currentVersion,
          latestVersion: currentVersion,
          releaseName: '',
        };
      }

      const release: any = await res.json();
      const latestTag = release.tag_name || release.name || '';
      const cleanLatest = latestTag.replace(/^v/, '');
      const hasUpdate = compareSemver(cleanLatest, currentVersion) > 0;

      // Find appropriate asset for current platform
      let downloadUrl = release.html_url;
      const isArm = process.arch === 'arm64';
      if (Array.isArray(release.assets)) {
        if (isMac) {
          const dmgAsset = release.assets.find((a: any) =>
            isArm ? a.name.includes('arm64.dmg') : a.name.endsWith('.dmg') && !a.name.includes('arm64')
          ) || release.assets.find((a: any) => a.name.endsWith('.dmg'));
          if (dmgAsset?.browser_download_url) downloadUrl = dmgAsset.browser_download_url;
        } else if (isWin) {
          const exeAsset = release.assets.find((a: any) => a.name.endsWith('.exe'));
          if (exeAsset?.browser_download_url) downloadUrl = exeAsset.browser_download_url;
        }
      }

      return {
        hasUpdate,
        currentVersion,
        latestVersion: cleanLatest,
        releaseName: release.name || latestTag,
        releaseNotes: release.body || '',
        publishedAt: release.published_at,
        downloadUrl,
        htmlUrl: release.html_url,
      };
    } catch (err: any) {
      console.error('[Updater Check Error]:', err.message);
      return {
        hasUpdate: false,
        currentVersion,
        latestVersion: currentVersion,
        releaseName: '',
      };
    }
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
