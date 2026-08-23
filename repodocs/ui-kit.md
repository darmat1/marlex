# ui-kit.md — интерфейсная система и переиспользуемые компоненты

<!-- Purpose: when a user interface exists, the agent follows its established interaction and presentation system instead of inventing a parallel one. -->

## Поверхности, платформы и режимы ввода
- Web/PWA (включая iPad/Safari) и Electron-десктоп (macOS, Windows) — один и тот же React-рендерер.
- Ввод — указатель (мышь/тачпад) и touch; клавиатурная доступность сегодня частична (см. ниже) — целевое состояние по [[decisions#ADR-008]].
- Локализация — интерфейс и лендинг на русском языке; смешение языков в остальных частях приложения не зафиксировано аудитом как проблема.

## Где живут общие интерфейсные примитивы
- Целевое расположение — `src/components/ui/` (создаётся по [[decisions#ADR-008]]: `Modal`, `useClickOutside`).
- Домен-специфичные компоненты — `src/components/<домен>/` (`auth`, `canva`, `channels`, `landing`, `layout`, `projects`, `settings`, `studio`, `updater`).

## Существующие экраны, вью, компоненты, виджеты
| Компонент | Назначение | Путь |
|---|---|---|
| `LandingPage` + секции | маркетинговый лендинг | `src/components/landing/` |
| `SettingsModal` | настройки приложения, выбор CLI-агента/BYOK | `src/components/settings/SettingsModal.tsx` |
| `ProjectSettingsModal` | настройки проекта | `src/components/projects/ProjectSettingsModal.tsx` |
| `UpdateModal` | уведомление об обновлении | `src/components/updater/UpdateModal.tsx` |
| `SlideThumbnails` | выбор активного слайда | `src/components/studio/SlideThumbnails.tsx` |
| `PhotoPaletteUpload` | привязка фото к слайду | `src/components/studio/PhotoPaletteUpload.tsx` |
| `ContextualInspector`, `CanvaToolbar`, `StudioLayout` | студия дизайна карусели | `src/components/studio/`, `src/components/canva/` |
| `Header` | верхняя навигация (Studio/Channels/History) | `src/components/layout/Header.tsx` |
| `MultiChannelTabs` | переключение Telegram/LinkedIn/Threads/Instagram | `src/components/channels/MultiChannelTabs.tsx` |

## Канонические примитивы и паттерны взаимодействия
- Модальные окна — единый `Modal`-компонент (role="dialog", aria-modal, Escape, focus-trap) — целевое состояние, см. [[decisions#ADR-008]]; сегодня три модалки реализованы независимо.
- Клик вне элемента — общий `useClickOutside`-хук — целевое состояние; сегодня продублирован в трёх местах.
- Списки одиночного выбора — семантичная кнопка или `role="button"`/`tabIndex=0`/`onKeyDown` (Enter/Space) — целевое состояние; сегодня — кликабельные `<div>` без клавиатурного пути.
- Группы вкладок — `role="tablist"`/`role="tab"`/`aria-selected` — целевое состояние; сегодня — обычные `<button>`.

## Что не должно переизобретаться
- Оверлей/фокус-менеджмент модалки — только через общий `Modal`, не инлайн в каждом компоненте.
- Логика «клик снаружи — закрыть» — только через общий хук.
- Скруглённые прямоугольники на canvas — нативный `CanvasRenderingContext2D.roundRect()`, не ручное построение пути ([[decisions#ADR-009]]).

## Ресурсы оформления и токены
- Источник истины по цвету/шрифтам — `@theme`-блок в `src/index.css` (Tailwind v4, CSS-first): `--color-accent`, `--color-canvas`/`-2`/`-3`, `--color-line`, `--font-display`.
- Не хардкодить `zinc-*`-классы Tailwind вместо токенов темы и не дублировать hex-литералы бренда (`#D1B852`, `#9B6140` и т.п.) — выносить в токены/константы (см. [[decisions#ADR-008]]).

## Доступность и платформенные соглашения
- Иконочные кнопки без видимого текста — обязателен `aria-label`.
- Модальные окна — обязательны `role="dialog"`, `aria-modal="true"`, закрытие по Escape, начальный фокус/focus-trap.
- Интерактивные `<div>` — либо семантичный элемент (`<button>`), либо `role`+`tabIndex`+обработка клавиатуры.
- Целевое состояние — по [[decisions#ADR-008]]; сегодняшнее состояние (0 `aria-*` атрибутов в `src/components`) зафиксировано как gap, не переиспользуется как образец.

## Просмотр, каталог или документация интерфейса
- Отдельного Storybook/каталога компонентов нет — просмотр через сам запущенный `npm run dev`/`npm run dev:electron`.

Related: [[context]] · [[techstack]] · [[architecture]]
