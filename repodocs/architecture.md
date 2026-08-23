# architecture.md — целевая архитектура

<!-- Purpose: the agent never changes implementation or project artifacts detached from the system. -->

## Архитектурный подход
Marlex — десктоп-приложение (Electron) и web/PWA-приложение, собранные из одного React-рендерера (`src/`), с тонкой Electron-обёрткой (main/preload) и отдельным HTTP-бэкендом для auth и (в перспективе) синхронизации проектов. Текущая форма — domain-native, без искусственных слоёв — сохраняется как целевая, см. [[decisions#ADR-001]]; единственное принятое изменение формы — консолидация бэкенда в одну точку входа, [[decisions#ADR-002]].

## Границы ответственности
- `src/` (React-рендерер) — вся UI-логика, студия дизайна карусели, состояние (`src/lib/store`), AI-клиент (`src/lib/ai`), экспорт (`src/lib/canvas`). Не должен напрямую обращаться к Postgres — только через `api/index.ts`.
- `electron/` (main + preload) — жизненный цикл окна, автообновление, обнаружение и запуск локальных CLI-агентов, `contextBridge`-мост в рендерер. Не должен содержать бизнес-логику генерации контента.
- `api/index.ts` — единственная развёрнутая HTTP-точка входа (Vercel): auth (better-auth) и, после [[decisions#ADR-002]], `/api/projects`. Источник схемы и auth-конфига — `server/src/db/schema.ts`/`server/src/auth.ts`, не собственная копия.
- `server/src/` — общий Drizzle-слой (`db/schema.ts`, `db/index.ts`) и общий auth-конфиг (`auth.ts`), импортируемые `api/index.ts`; `server/src/index.ts` — только локальный dev-сервер поверх того же кода.
- `scripts/` — сборочные утилиты (иконки, подготовка `dist`), не часть рантайма приложения.

## Карта структуры
См. evidence-backed [[project_map]] — ключевые узлы: renderer (`src/`), electron-shell (`electron/`), backend-entry (`api/index.ts`), backend-dev (`server/src/index.ts`, помечен legacy per [[decisions#ADR-002]]), data-layer (`server/src/db/`), auth (`server/src/auth.ts`).

## Правила размещения и создания
- Новый UI-код — в `src/components/<домен>/`, общие примитивы — в `src/components/ui/` (создаётся по [[decisions#ADR-008]]).
- Новая серверная логика — в `server/src/`, импортируется в `api/index.ts`; не дублировать инлайн в `api/index.ts`.
- Тесты (после [[decisions#ADR-007]]) — рядом с тестируемым модулем, `*.test.ts`.

## Правила для новой реализации и артефактов
Новый код следует целевой структуре выше. Существующие несоответствия (дублирование бэкенда, god-функция `generateContentPackage`) не исправляются попутно — они зафиксированы в [[legacy_warning]] / [[migration_backlog]] и решаются отдельными задачами ([[migration_backlog#MB-001]], [[migration_backlog#MB-010]]).

## Ограничения на взаимодействие и зависимости
- Рендерер (`src/`) обращается к данным только через `api/index.ts`, никогда напрямую к Postgres/Drizzle.
- `electron/main.ts` не должен импортировать код рендерера напрямую — только через `contextBridge`/IPC (уже соблюдается: `contextIsolation`/`nodeIntegration` настроены корректно, security-007's единственная находка — `webSecurity: false`, см. [[security]]).

Related: [[context]] · [[project_map]] · [[techstack]] · [[decisions]]
