/**
 * Marlex Runtime & OS Detection Utilities
 */

export function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';
}

export type ClientPlatform = 'macos' | 'windows' | 'linux' | 'unknown';

export function getClientPlatform(): ClientPlatform {
  if (isElectron() && window.electronAPI?.platform) {
    const p = window.electronAPI.platform.toLowerCase();
    if (p.includes('darwin') || p.includes('mac')) return 'macos';
    if (p.includes('win')) return 'windows';
    if (p.includes('linux')) return 'linux';
  }

  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = (navigator as any).userAgentData?.platform?.toLowerCase() || navigator.platform?.toLowerCase() || '';

    if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
      return 'macos';
    }
    if (platform.includes('win') || userAgent.includes('windows')) {
      return 'windows';
    }
    if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'linux';
    }
  }

  return 'unknown';
}

export interface ReleaseAssetUrls {
  macSilicon: string;
  macIntel: string;
  windows: string;
  releasesPage: string;
}

export const GITHUB_REPO = 'darmat1/marlex';

export function getDownloadUrls(): ReleaseAssetUrls {
  const base = `https://github.com/${GITHUB_REPO}/releases/latest/download`;
  return {
    macSilicon: `${base}/Marlex-arm64.dmg`,
    macIntel: `${base}/Marlex.dmg`,
    windows: `${base}/Marlex-Setup.exe`,
    releasesPage: `https://github.com/${GITHUB_REPO}/releases/latest`,
  };
}
