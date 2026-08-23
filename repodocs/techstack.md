# techstack.md — целевой технологический стек

<!-- Purpose: the agent never picks technologies on its own. -->

## Языки, окружения, платформы и тулчейны
- TypeScript (React-рендерер, Electron main/preload, `server/`, `api/`) — компилируется через `tsc`/Vite; версия — по `package.json`/`tsconfig*.json`.
- Целевые платформы: desktop-приложение на Electron (macOS Apple Silicon + Intel, Windows 10/11 x64) и web/PWA (включая iPad/Safari) из одного React-рендерера в `src/`.
- Node.js — среда выполнения `server/`, `api/index.ts`, скриптов сборки (`scripts/*.js`) и Electron main-процесса.
- Развёртывание бэкенда — Vercel (serverless-функция `api/index.ts`, см. [[decisions#ADR-002]]).

## Фреймворки, платформы, инструменты и ключевые зависимости
| Назначение | Выбранное средство |
|---|---|
| UI-рендерер | React 19 + Vite 6 |
| Стили | Tailwind CSS v4 (CSS-first `@theme` в `src/index.css`), без отдельного `tailwind.config.*` |
| Десктоп-обёртка | Electron + electron-builder |
| HTTP-бэкенд (dev) | Hono (`server/src/index.ts`) |
| HTTP-бэкенд (прод, Vercel) | ручной Node `http`↔Web `Request/Response` мост в `api/index.ts` — целевое состояние: единая точка правды, см. [[decisions#ADR-002]] |
| ORM / БД | Drizzle ORM + `postgres` (postgres-js драйвер) |
| Аутентификация | better-auth (session/cookie-based) |
| AI-провайдеры | локальный CLI (Claude Code / ChatGPT CLI / Gemini CLI / Ollama) или BYOK через `@anthropic-ai/sdk`, `openai`, `@google/generative-ai` — целевое состояние: использовать эти SDK вместо ручного `fetch`, см. [[decisions#ADR-009]] |
| Экспорт карусели | `jspdf` (PDF), `jszip` (архив PNG) |
| Состояние клиента | zustand (+ `persist` в localStorage) |
| Иконки | `lucide-react` |
| Шрифты | Google Fonts: Inter (UI), Source Sans 3 (карусели), Playfair Display (акцентные заголовки лендинга), Montserrat/Roboto (доступны, не везде задействованы) |

Версии — в `package.json`/`package-lock.json`; не копировать их сюда.

## Запрещено
- Ручные HTTP-интеграции с AI-провайдерами через `fetch`, когда для провайдера есть установленный официальный SDK — см. [[decisions#ADR-009]].
- Вторая независимая копия Postgres-схемы/auth-конфига вне `server/src/db/schema.ts`/`server/src/auth.ts` — единственный источник правды, см. [[decisions#ADR-002]].
- `better-sqlite3` как драйвер БД — проект использует Postgres через `postgres-js`; SQLite-зависимости — кандидаты на удаление ([[migration_backlog#MB-009]]).

## Важные зависимости, возможности и ограничения
- BYOK-режим — единственный способ работать без установленного локального CLI; ключи провайдеров сейчас хранятся в localStorage без шифрования — целевое состояние см. [[security]] и [[decisions#ADR-010]].
- `vercel.json`'s `buildCommand` не должен расходиться с `package.json`'s `build`-скриптом (typecheck + генерация иконок) — см. [[decisions#ADR-009]].
- Drizzle-миграции пока не заведены (нет каталога миграций) — целевое состояние см. [[data_model]].

## Внутренние ссылки и договорённости команды
- Нет отдельных внешних wiki/style-guide — правила лежат в `AGENTS.md`/`GEMINI.md` в корне и в `.agents/skills/*` (workflow-скиллы, не технологические решения).

Related: [[context]] · [[decisions]]
