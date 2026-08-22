# Marlex Landing Page, Multi-Platform Releases & In-App Auto-Updater Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a marketing landing page on the website with direct multi-platform download links, create a GitHub Actions CI/CD matrix release pipeline, and add in-app auto-update checking for the Electron desktop application.

**Architecture:** Split runtime rendering in `src/App.tsx` between the Web Landing Page (browser environment) and the Studio Application (Electron environment). Build a responsive, high-converting Landing Page with dynamic OS detection and download links pointing to `darmat1/marlex` GitHub Releases. Implement in-app version checks in Electron via IPC querying the GitHub Releases API with notification UI and 1-click downloads.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React, Electron 34, GitHub Actions CI/CD, Vite 6.

**Spec:** `docs/superpowers/specs/2026-08-22-landing-and-auto-update-design.md`

## Global Constraints

- Website (`!isElectron`) must display only the marketing landing page and download options, not the studio workstation.
- Desktop (`isElectron === true`) must open directly into the studio workstation with in-app updater check.
- Releases repository is `darmat1/marlex`.
- Multi-platform targets: macOS `arm64` (.dmg), macOS `x64` (.dmg), Windows `x64` (.exe).

---

### Task 1: Environment & Runtime Detection Utility

**Files:**
- Create: `src/lib/runtime.ts`
- Modify: `src/types/index.ts`
- Modify: `electron/preload.ts`

**Interfaces:**
- Produces: `isElectron(): boolean`, `getPlatform(): 'darwin' | 'win32' | 'linux' | 'browser'`, `getAppVersion(): Promise<string>`

- [ ] **Step 1: Define runtime detection and updater types**
Add `AppUpdateInfo` and `ElectronAPI` interfaces in `src/types/index.ts`.

- [ ] **Step 2: Implement `src/lib/runtime.ts`**
Create utility functions to detect Electron environment vs web browser and detect client OS for landing page download button.

- [ ] **Step 3: Expose updater methods in `electron/preload.ts`**
Add `getAppVersion()`, `checkForUpdates()`, and `openExternalUrl()` to `window.electronAPI`.

- [ ] **Step 4: Verify build & commit**
Run `npm run build` and commit changes.

---

### Task 2: High-Converting Marketing Landing Page

**Files:**
- Create: `src/components/landing/LandingPage.tsx`
- Create: `src/components/landing/HeroSection.tsx`
- Create: `src/components/landing/FeaturesSection.tsx`
- Create: `src/components/landing/ComparisonSection.tsx`
- Create: `src/components/landing/FAQSection.tsx`
- Create: `src/components/landing/LandingFooter.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `isElectron()`, `getPlatform()` from `src/lib/runtime.ts`
- Produces: `<LandingPage />` component rendered when `!isElectron`

- [ ] **Step 1: Build Hero Section with smart OS download button**
Implement Hero with headline, dynamic macOS/Windows download CTA linked to `https://github.com/darmat1/marlex/releases/latest`, alternative OS dropdown, and interactive carousel studio mockup.

- [ ] **Step 2: Build Features, Comparison, and FAQ sections**
Add visual feature cards (AI Generation, Canva-like styling, Multi-channel posts, Local CLI privacy), 3-hour manual vs 2-minute AI comparison, and FAQ accordion.

- [ ] **Step 3: Integrate with `src/App.tsx` routing**
If `!isElectron`, render `<LandingPage />`. If `isElectron`, render Studio App.

- [ ] **Step 4: Verify build & visual presentation**
Run `npm run build` and verify cleanly.

- [ ] **Step 5: Commit**
```bash
git add src/components/landing/ src/App.tsx
git commit -m "feat(landing): add modern marketing landing page with direct download links"
```

---

### Task 3: Electron In-App Auto-Updater & Version Checker

**Files:**
- Modify: `electron/main.ts`
- Create: `src/components/updater/UpdateBanner.tsx`
- Create: `src/components/updater/UpdateModal.tsx`
- Create: `src/lib/updater.ts`
- Modify: `src/components/settings/SettingsModal.tsx`
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: GitHub Releases API `https://api.github.com/repos/darmat1/marlex/releases/latest`
- Produces: In-app notification banner and modal when updates are available, plus manual check in Settings.

- [ ] **Step 1: Implement IPC update handlers in `electron/main.ts`**
Add handlers for `updater:check`, `updater:openRelease`, and `updater:getVersion` using semantic version comparison.

- [ ] **Step 2: Create `src/lib/updater.ts` service**
Query GitHub releases and compare with current app version.

- [ ] **Step 3: Create `<UpdateBanner />` and `<UpdateModal />` UI**
Render non-intrusive update banner with "Обновить" CTA and changelog popup.

- [ ] **Step 4: Add manual "Проверить обновления" button in SettingsModal**
Allow user to check for updates on demand with instant feedback toast/modal.

- [ ] **Step 5: Verify build & commit**
Run `npm run build` and commit changes.

---

### Task 4: GitHub Actions CI/CD Multi-Platform Release Matrix

**Files:**
- Create: `.github/workflows/release.yml`
- Modify: `package.json`

**Interfaces:**
- Triggers on: Git tag push `v*.*.*`
- Produces: macOS arm64/x64 `.dmg` and `.zip`, Windows x64 `.exe` published to GitHub Releases.

- [ ] **Step 1: Configure `electron-builder` in `package.json`**
Configure publish settings for GitHub repository `darmat1/marlex`.

- [ ] **Step 2: Create `.github/workflows/release.yml`**
Add multi-platform build matrix (`macos-latest`, `windows-latest`) that compiles installers and publishes to GitHub Releases with release notes.

- [ ] **Step 3: Verify and commit**
Commit the workflow and build configuration.

---

### Task 5: End-to-End Verification & Documentation

**Files:**
- Modify: `README.md`
- Create: `walkthrough.md`

- [ ] **Step 1: Verify web build (`npm run build`)**
- [ ] **Step 2: Verify Electron build (`npm run build:electron`)**
- [ ] **Step 3: Update documentation with release instructions**
- [ ] **Step 4: Final commit & push**
