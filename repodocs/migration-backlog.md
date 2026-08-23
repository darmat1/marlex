# migration-backlog.md — план достижения целевого состояния

Упорядочено по приоритету. Выполненные пункты не удаляются — отмечаются как done с датой.

<a id="MB-002"></a>
## MB-002: Добавить session-check и владение по `userId` в `/api/projects`
- Priority: P1 · Effort: S · Status: done (2026-08-23)
- Sources: [[decisions#ADR-003]] · Findings/requirements: data-003, security-004 · Debt: [[legacy_warning]]
- Where: `server/src/index.ts:34-65` (или новое место в `api/index.ts` после MB-001)
- What exactly: перед GET добавить `auth.api.getSession()` и `.where(eq(projects.userId, session.user.id))`; перед INSERT в POST — читать `userId` из сессии, а не из тела запроса.
- Risk: без этого пункта MB-001 (перенос роутов в прод) превращает сегодняшний dev-only баг в публичный IDOR — выполнять строго вместе или до MB-001.

<a id="MB-001"></a>
## MB-001: Консолидировать бэкенд в `api/index.ts`
- Priority: P1 · Effort: M · Status: done (2026-08-23)
- Sources: [[decisions#ADR-002]] · Findings/requirements: architecture-001, stack-001, data-001, data-002, data-005, testing-006 · Debt: [[legacy_warning]]
- Where: `api/index.ts`, `server/src/index.ts`, `server/src/db/schema.ts`, `server/src/auth.ts`
- What exactly: `api/index.ts` импортирует схему и auth-конфиг из `server/src/db/schema.ts`/`server/src/auth.ts` вместо собственных копий; добавляет `/api/projects` GET/POST (см. MB-002 — обязательно вместе); `server/src/index.ts` остаётся только как локальный dev-сервер поверх того же кода или удаляется, если избыточен.
- Risk: пока MB-002 не выполнен параллельно, не деплоить `/api/projects` в проде. После консолидации сверить клиентскую модель `MarlexProject` (zustand/localStorage) с серверной — они пока не пересекаются ни одним полем (data-002).

<a id="MB-013"></a>
## MB-013: Ввести drizzle-kit миграции и upsert для `/api/projects`
- Priority: P2 · Effort: S · Status: done (2026-08-23)
- Sources: [[decisions#ADR-002]] · Findings/requirements: data-004, data-006
- Where: `drizzle.config.ts`, новый каталог миграций, `api/index.ts`'s POST /api/projects (после MB-001)
- What exactly: сгенерировать первую миграцию через `drizzle-kit generate`, закоммитить каталог миграций; POST переделать в upsert (`ON CONFLICT (id) DO UPDATE`), а не только INSERT.
- Risk: миграция схемы на пустой каталог миграций — сверить с текущим состоянием БД вручную перед первым `drizzle-kit push`.

<a id="MB-003"></a>
## MB-003: Убрать захардкоженный fallback-секрет auth
- Priority: P1 · Effort: S · Status: done (2026-08-23)
- Sources: [[decisions#ADR-004]] · Findings/requirements: security-001
- Where: `server/src/auth.ts:14`, `api/index.ts:97`, `.env.example`
- What exactly: `secret: process.env.BETTER_AUTH_SECRET` без `||`-fallback; бросать понятную ошибку при старте, если переменная не задана; добавить `BETTER_AUTH_SECRET=` в `.env.example`.
- Risk: деплой упадёт, если в окружении (Vercel) секрет не выставлен — это ожидаемо и является целью пункта; перед выкаткой проверить, что переменная реально задана в Vercel project settings.

<a id="MB-004"></a>
## MB-004: CORS — allowlist вместо отражения Origin
- Priority: P1 · Effort: S · Status: done (2026-08-23)
- Sources: [[decisions#ADR-005]] · Findings/requirements: security-002
- Where: `server/src/index.ts:14-19`, `api/index.ts:138-144`
- What exactly: заменить `origin: (origin) => origin || '*'` / отражение `req.headers.origin` на проверку против общего allowlist (тот же список, что в MB-005); `Access-Control-Allow-Credentials: true` — только когда origin прошёл проверку.
- Risk: не забыть добавить в allowlist все реально используемые origin'ы (dev localhost, production домен, Electron file://) — иначе сломается легитимный клиент.

<a id="MB-005"></a>
## MB-005: Убрать `'*'` из `trustedOrigins`
- Priority: P1 · Effort: XS · Status: done (2026-08-23)
- Sources: [[decisions#ADR-006]] · Findings/requirements: security-003
- Where: `api/index.ts:117`, `server/src/auth.ts` (allowlist)
- What exactly: удалить литерал `'*'`; перечислить реальные origin'ы явно (переиспользовать список из MB-004).
- Risk: минимальный — если после удаления `'*'` легитимный клиент перестанет проходить, значит его origin не был явно учтён, это и есть цель проверки.

<a id="MB-006"></a>
## MB-006: Vitest + тесты для пяти критических путей
- Priority: P1 · Effort: L · Status: done (2026-08-23) — 33 теста в 5 файлах: `electron/semver.test.ts`, `electron/cli-discovery.test.ts`, `src/lib/ai/llm-client.test.ts`, `api/http-bridge.test.ts`, `src/lib/canvas/export-utils.test.ts`. Заодно исправлен реальный баг: `compareSemver` игнорировал pre-release суффиксы (`0.1.4-beta` считался равным `0.1.4`). `npm test` добавлен в CI перед сборкой.
- Sources: [[decisions#ADR-007]] · Findings/requirements: testing-001, testing-002, testing-003, testing-004, testing-005, testing-006, testing-007
- Where: новый `vitest.config.ts`, `package.json`'s scripts (`test`), тесты рядом с `src/lib/ai/llm-client.ts`, `src/lib/canvas/export-utils.ts`, `electron/main.ts` (`compareSemver`, CLI-discovery), `api/index.ts`
- What exactly: подключить Vitest; первая волна — граничные случаи `compareSemver` (pre-release суффиксы, разное число сегментов), `generateContentPackage`'s JSON-парсинг и fallback-путь, `renderSlideToCanvas`'s граничные случаи (пустой фон, 0 слайдов, длинный текст), HTTP-мост `api/index.ts` (`toWebRequest`/`writeWebResponse`).
- Risk: нет — добавление тестов чисто аддитивно; порядок — по риску (см. ADR-007), не всё сразу.

<a id="MB-007"></a>
## MB-007: Общие accessible-примитивы (Modal, useClickOutside, selectable-список, tablist)
- Priority: P2 · Effort: M · Status: done (2026-08-23) — кроме ui-001 (zinc-* вместо токенов темы на лендинге), сознательно оставлено как отдельный, более крупный дизайн-долг
- Sources: [[decisions#ADR-008]] · Findings/requirements: ui-002, ui-003, ui-004, ui-005, ui-006, bloat-003, bloat-004
- Where: новый `src/components/ui/Modal.tsx`, `src/lib/hooks/useClickOutside.ts` (или аналог), рефактор `SettingsModal.tsx`, `ProjectSettingsModal.tsx`, `UpdateModal.tsx`, `SlideThumbnails.tsx`, `PhotoPaletteUpload.tsx`, `Header.tsx`, `MultiChannelTabs.tsx`; Gatekeeper-виджет копирования (bloat-004) — `src/components/landing/HeroSection.tsx` и `src/components/landing/FAQSection.tsx` (последний на момент аудита был незакоммиченной правкой, `worktree_clean: false`, см. [[drift_report]]) — вынести в общий компонент/хук.
- What exactly: `Modal` с `role="dialog"`, `aria-modal`, Escape-закрытием и focus-trap; общий `useClickOutside` вместо трёх копий; selectable-списки — `role="button"`/`tabIndex=0`/`onKeyDown` (Enter/Space) или семантичный `<button>`; tab-группы — `role="tablist"`/`role="tab"`/`aria-selected`; иконочные кнопки — `aria-label`; Gatekeeper-копирование — общий компонент вместо двух независимых копий.
- Risk: визуальный QA после рефакторинга модалок (фокус-ловушка может конфликтовать с существующими эффектами) — Escape не должен ломать несохранённые формы без подтверждения, если такая логика уже где-то есть.

<a id="MB-008"></a>
## MB-008: Использовать установленные AI SDK вместо ручного `fetch`
- Priority: P2 · Effort: M · Status: done (2026-08-23)
- Sources: [[decisions#ADR-009]] · Findings/requirements: stack-002, bloat-001
- Where: `src/lib/ai/llm-client.ts`
- What exactly: заменить самописные `fetch`-интеграции с OpenAI/Anthropic/Gemini на `@anthropic-ai/sdk`, `openai`, `@google/generative-ai` (уже в зависимостях); заодно уменьшает cyclomatic complexity `generateContentPackage` (ADR-001's консеквенс).
- Risk: у каждого SDK своя обработка ошибок/таймаутов — при замене явно сверить текущее поведение fallback (`buildDynamicFallback`) с новым.

<a id="MB-009"></a>
## MB-009: Удалить неиспользуемые зависимости и мёртвый скрипт
- Priority: P3 · Effort: S · Status: done (2026-08-23)
- Sources: [[decisions#ADR-009]] · Findings/requirements: stack-003, stack-004, stack-005, stack-006, bloat-002, bloat-005, bloat-006
- Where: `package.json`, `src/lib/palette/color-extractor.ts`, `src/lib/canvas/export-utils.ts`, `vercel.json`, `.npmrc`, `scripts/make-icns.js`
- What exactly: удалить `better-sqlite3`/`@types/better-sqlite3` (не используется — единственный драйвер `postgres`); заменить ручное усреднение пикселей в `color-extractor.ts` на `colorthief` (уже в зависимостях) или удалить `colorthief`, если ручная логика остаётся осознанно; `roundRect()` — заменить на нативный `CanvasRenderingContext2D.roundRect()`; выровнять `vercel.json`'s `buildCommand` с `package.json`'s `build` (typecheck + генерация иконок); разобрать причину `legacy-peer-deps=true` в `.npmrc`; удалить `scripts/make-icns.js` (не вызывается нигде).
- Risk: перед удалением `better-sqlite3`/`make-icns.js` — финальная проверка `find_references`/`grep`, что действительно нет скрытых потребителей (например, в электрон-сборке для другой ОС).

<a id="MB-010"></a>
## MB-010: Снизить сложность `generateContentPackage`
- Priority: P3 · Effort: M · Status: done (2026-08-23)
- Sources: [[decisions#ADR-001]] · Findings/requirements: architecture-002
- Where: `src/lib/ai/llm-client.ts:316`
- What exactly: после MB-008 (переход на SDK) разбить функцию на отдельные провайдер-стратегии + отдельную JSON-парсинг/fallback-логику.
- Risk: делать после MB-008, а не вместо — иначе рефакторинг придётся переделывать дважды.

<a id="MB-011"></a>
## MB-011: Не возвращать сырые ошибки клиенту; безопасное хранение BYOK-ключей
- Priority: P2 · Effort: S · Status: done (2026-08-23)
- Sources: [[decisions#ADR-010]] · Findings/requirements: security-005, security-006
- Where: `api/index.ts:232`, `src/lib/store/useMarlexStore.ts:312,519`
- What exactly: обработчик ошибок в `api/index.ts` логирует `err.stack` на сервере, клиенту отдаёт нейтральное сообщение; zustand `persist` для стора получает `partialize`, исключающий API-ключи из localStorage (или хранит их через Electron `safeStorage`, когда приложение запущено в Electron).
- Risk: `partialize` может неожиданно исключить что-то ещё, что клиент ожидает переживающим reload — явно перечислить, что персистится, а не что исключается.

<a id="MB-012"></a>
## MB-012: Убрать `webSecurity: false`; пиннить GitHub Actions по SHA
- Priority: P3 · Effort: XS · Status: done (2026-08-23)
- Sources: [[decisions#ADR-010]] · Findings/requirements: security-007, security-008
- Where: `electron/main.ts:114`, `.github/workflows/release.yml:31,34`
- What exactly: убрать `webSecurity: false` из `BrowserWindow`, если не найдётся задокументированной причины (сейчас её нет); `actions/checkout@v4`/`actions/setup-node@v4` — заменить тег на конкретный commit SHA.
- Risk: если `webSecurity: false` был нужен для загрузки локальных file:// ресурсов — проверить конкретный сценарий перед удалением, не просто убрать вслепую.
