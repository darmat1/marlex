import { AppUpdateInfo } from '../types';
import { isElectron, GITHUB_REPO } from './runtime';

export async function checkAppUpdate(): Promise<AppUpdateInfo> {
  // If in Electron, call IPC handler
  if (isElectron() && window.electronAPI?.checkForUpdates) {
    try {
      return await window.electronAPI.checkForUpdates();
    } catch (e: any) {
      console.error('[In-App Updater Error]:', e);
    }
  }

  // Web / fallback check via GitHub API
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) {
      return {
        hasUpdate: false,
        currentVersion: '0.1.0',
        latestVersion: '0.1.0',
        releaseName: '',
      };
    }
    const release: any = await res.json();
    const latestTag = release.tag_name || release.name || 'v0.1.0';
    const cleanLatest = latestTag.replace(/^v/, '');

    return {
      hasUpdate: false, // On web we don't force update banner
      currentVersion: '0.1.0',
      latestVersion: cleanLatest,
      releaseName: release.name || latestTag,
      releaseNotes: release.body || '',
      publishedAt: release.published_at,
      downloadUrl: release.html_url,
      htmlUrl: release.html_url,
    };
  } catch (err) {
    return {
      hasUpdate: false,
      currentVersion: '0.1.0',
      latestVersion: '0.1.0',
      releaseName: '',
    };
  }
}

export function openDownloadUrl(url?: string) {
  const targetUrl = url || `https://github.com/${GITHUB_REPO}/releases/latest`;
  if (isElectron() && window.electronAPI?.openExternalUrl) {
    window.electronAPI.openExternalUrl(targetUrl);
  } else if (typeof window !== 'undefined') {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}
