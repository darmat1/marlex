# Marlex — Autonomous Content Factory & Carousel Studio

[![Release Multi-Platform](https://github.com/darmat1/marlex/actions/workflows/release.yml/badge.svg)](https://github.com/darmat1/marlex/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)

**Marlex** — автономный десктопный контент-завод и студия каруселей для экспертов и фаундеров.
Генерация смысловых слайдов и постов для 4 соцсетей через локальные AI CLI (Claude Code, ChatGPT, Gemini CLI, Ollama), визуальный редактор уровня Canva/Figma и встроенное автообновление.

---

## 🏛 Структура проекта

1. **Web (Vercel / Browser):**
   - Маркетинговый лендинг с описанием возможностей, интерактивным демо и умным определением ОС для скачивания дистрибутивов (`.dmg` / `.exe`).
2. **Desktop (Electron App):**
   - Полнофункциональная дизайн-студия, локальное подключение к терминальным AI CLI без передачи API-ключей, экспорт в Ultra-HD PNG / PDF и фоновая проверка обновлений.
3. **CI/CD Releases (GitHub Actions):**
   - Автоматическая матричная сборка под macOS (Apple Silicon `arm64` + Intel `x64`) и Windows 64-bit при каждом пуше тега версии.

---

## 🚀 Как выпустить новую версию (Release)

Благодаря настроенному GitHub Actions workflow (`.github/workflows/release.yml`), вам не нужно вручную собирать приложение на разных компьютерах.

### Создание релиза в 2 команды:

```bash
# 1. Создайте тег с версией
git tag v0.1.1

# 2. Запушьте тег на GitHub
git push origin v0.1.1
```

GitHub Actions автоматически:
1. Запустит виртуальные машины macOS и Windows.
2. Соберет `.dmg` (Apple Silicon и Intel) и `.exe` (Windows).
3. Создаст официальный Release на [GitHub Releases](https://github.com/darmat1/marlex/releases) и прикрепит готовые файлы.
4. Все пользователи десктопного приложения получат уведомление об обновлении и смогут обновиться в 1 клик!

---

## 🛠 Локальная разработка

### Требования
- Node.js 20+
- npm

### Запуск в режиме разработки:

```bash
# Установка зависимостей
npm install

# Запуск десктопного приложения (Vite + Electron):
npm run dev:electron

# Запуск только веб-лендинга в браузере:
npm run dev
```

### Сборка:

```bash
# Сборка веб-части:
npm run build

# Локальная сборка установщика для текущей ОС:
npm run build:electron
```
