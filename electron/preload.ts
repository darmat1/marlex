import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  saveFile: (options: { defaultPath: string; filters: any[] }) =>
    ipcRenderer.invoke('dialog:saveFile', options),
  executeCLI: (opts: { cliType: string; prompt: string; model?: string }) =>
    ipcRenderer.invoke('cli:execute', opts),
  detectCLIs: () => ipcRenderer.invoke('cli:detect'),
});
