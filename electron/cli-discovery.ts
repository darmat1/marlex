import path from 'path';
import os from 'os';
import fs from 'fs';

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

/** Extended PATH resolution for macOS, Windows & Linux, beyond what a GUI app's process.env.PATH usually carries. */
export function getSearchPaths(): string[] {
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

export function findBinary(name: string): string | null {
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

export function hasApp(appName: string): boolean {
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
