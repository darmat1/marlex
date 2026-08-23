# decisions.md — принятые решения (ADR)

Источник истины для генерации остальных документов. Решение изменилось — перегенерируйте документы, не правьте их руками.

## Referenced from source
<!-- В репозитории пока нет файлов вне repodocs/, которые бы цитировали ADR/MB id (preflight decision_citations: пусто) -->

<a id="ADR-001"></a>
## ADR-001: Сохранить текущую архитектурную форму (Electron-десктоп + web/PWA, единый React-рендерер)
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: architecture-002
- Context: Проект — не сервис с ярко выраженными слоями, а десктоп/PWA-приложение (Electron main/preload + один React-рендерер в `src/`), недавно расширенное поддержкой iPad/web. Аудитор архитектуры не нашёл циклов зависимостей или нарушений границ, требующих переписывания структуры — единственная находка внутри этой формы (architecture-002) касается одной god-функции, а не формы проекта в целом.
- Options: (A) сохранить текущую форму как целевую и фиксировать точечный техдолг отдельно; (B) ввести формальные слои/паттерны ради самой архитектурности.
- Decision: (A) — форма сохраняется. `generateContentPackage` (`src/lib/ai/llm-client.ts:316`, cyclomatic 41) фиксируется как техдолг и решается вместе с ADR-009 (переход на официальные SDK вместо ручных fetch должен сам по себе уменьшить сложность функции).
- Governs: [[architecture]]
- Consequences: Новый код следует текущей структуре (renderer / electron / server / api / lib). Точечный рефакторинг `generateContentPackage` — [[migration_backlog#MB-010]].

<a id="ADR-002"></a>
## ADR-002: Сделать `api/index.ts` единственной точкой правды для бэкенда
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: architecture-001, stack-001, data-001, data-002, data-004, data-005, data-006, testing-006
- Context: В проде (Vercel, per `vercel.json`) работает только `api/index.ts` — со своей рукописной копией Postgres-схемы и `betterAuth()`, без роутов `/api/projects`. `server/src/index.ts` (Hono-приложение с рабочими `/api/projects`, но без auth-проверки) запускается только локально (`npm run server:dev`, гейт `if (!process.env.VERCEL)`) и никуда не задеплоен. Копии схемы уже разошлись: у `api/index.ts` нет `clientProfileId`/`client_profiles`. Также нет каталога drizzle-миграций — эволюция схемы не версионируется.
- Options: (A) сделать `api/index.ts` единой точкой входа — добавить в него `/api/projects` и общий импорт `server/src/db/schema.ts`/`server/src/auth.ts`, `server/src/index.ts` оставить только для локальной разработки или удалить; (B) задеплоить Hono-приложение (`server/src/index.ts`) на Vercel вместо `api/index.ts`; (C) зафиксировать факт расхождения без выбора направления.
- Decision: (A), подтверждено пользователем.
- Governs: [[architecture]], [[data_model]]
- Consequences: `server/src/db/schema.ts` становится единственным источником схемы (импортируется, не копируется). `/api/projects` реализуется в `api/index.ts` — но только вместе с ADR-003 (иначе в проде появится незащищённый endpoint). Клиентская модель `MarlexProject` (localStorage/zustand, data-002) и серверная Postgres-модель сверяются заново после консолидации. Ввести drizzle-kit миграции (`drizzle.config.ts` уже на месте, каталога миграций нет). POST должен делать upsert, а не только INSERT (data-006). — [[migration_backlog#MB-001]]

<a id="ADR-003"></a>
## ADR-003: `/api/projects` не деплоится без session-проверки и владения по `userId`
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: data-003, security-004
- Context: Сегодняшняя реализация `/api/projects` в `server/src/index.ts` не вызывает `auth.api.getSession()`, GET отдаёт все строки без фильтра, POST не проставляет `userId` (колонка есть и nullable — рассчитана на владение, но не используется). Публично это не эксплуатируется только потому, что маршрут нигде не задеплоен (см. ADR-002) — но именно ADR-002 collects этот код в продовую точку входа, так что это блокирующее условие, а не отдельная задача "когда-нибудь".
- Options: (A) добавить session-check + `eq(projects.userId, session.user.id)` при переносе роутов в `api/index.ts`; (B) перенести роуты как есть и чинить отдельным тикетом.
- Decision: (A) — обязательное условие для ADR-002, не отдельная задача.
- Governs: [[security]]
- Consequences: `/api/projects` GET/POST получают проверку сессии и фильтрацию по `userId` до того, как маршрут появится в проде. — [[migration_backlog#MB-002]]

<a id="ADR-004"></a>
## ADR-004: Секрет подписи сессий обязателен, без захардкоженного fallback
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: security-001
- Context: `server/src/auth.ts:14` и `api/index.ts:97` подставляют одну и ту же зашитую в код строку, если `BETTER_AUTH_SECRET` не задан в окружении. `.env.example` вообще не упоминает эту переменную, то есть ничего не заставляет оператора её выставить.
- Options: (A) убрать fallback, падать с понятной ошибкой на старте при отсутствии `BETTER_AUTH_SECRET`; (B) оставить как есть.
- Decision: (A).
- Governs: [[security]]
- Consequences: Оба файла (`server/src/auth.ts`, `api/index.ts`) требуют `BETTER_AUTH_SECRET` из окружения без запасного значения; переменная добавляется в `.env.example` как обязательная. — [[migration_backlog#MB-003]]

<a id="ADR-005"></a>
## ADR-005: CORS — явный allowlist вместо отражения любого Origin
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: security-002
- Context: `server/src/index.ts:14-19` и `api/index.ts:138-144` отражают заголовок `Origin` запроса обратно в `Access-Control-Allow-Origin` и одновременно ставят `Access-Control-Allow-Credentials: true` — классическая связка, позволяющая любому сайту читать авторизованные ответы через браузер жертвы.
- Options: (A) явный allowlist origin'ов (переиспользовать список `trustedOrigins`, см. ADR-006), credentials только для origin из списка; (B) оставить отражение, но убрать credentials.
- Decision: (A) — credentials нужны для cookie-based сессий better-auth, поэтому убрать их нельзя; убираем отражение.
- Governs: [[security]]
- Consequences: Оба backend-входа проверяют `Origin` против одного и того же allowlist перед тем, как отражать его и выставлять credentials. — [[migration_backlog#MB-004]]

<a id="ADR-006"></a>
## ADR-006: Убрать wildcard `'*'` из `trustedOrigins`
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: security-003
- Context: `api/index.ts:117` включает в `trustedOrigins` литерал `'*'`, который в установленной версии better-auth (1.7.1, `node_modules/better-auth/dist/utils/wildcard.mjs`) компилируется в паттерн, matching любой одно-сегментный host — то есть реальный wildcard-обход origin-проверки better-auth (используется в CSRF-защите state-changing эндпоинтов, `origin-check.mjs`). Отдельно проверили запись `'null'` — в этой версии библиотеки Origin `'null'` отклоняется до чтения `trustedOrigins`, так что сама по себе она не обход (независимая проверка это подтвердила).
- Options: (A) убрать `'*'`, перечислить реальные origin'ы явно; (B) оставить.
- Decision: (A).
- Governs: [[security]]
- Consequences: `trustedOrigins` в `api/index.ts` и `server/src/auth.ts` содержит только конкретные хосты. При обновлении better-auth (semver-диапазон `^1.1.20` допускает дрейф) — перепроверить поведение `'null'`. — [[migration_backlog#MB-005]]

<a id="ADR-007"></a>
## ADR-007: Ввести автоматическую верификацию для критических путей (Vitest)
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: testing-001, testing-002, testing-003, testing-004, testing-005, testing-006, testing-007
- Context: В репозитории нет тестового фреймворка и ни одного тестового файла (testing-001); CI (`release.yml`) не запускает тесты/линт. При этом пять путей с реальным риском регрессии не покрыты вообще: мультипровайдерный AI-пайплайн (`llm-client.ts`, cyclomatic 41), рендер/экспорт карусели (`export-utils.ts`, cyclomatic 73 — не самая сложная в репозитории, но одна из трёх самых сложных и наименее защищённая), самописный semver-компаратор автообновления (`electron/main.ts`), HTTP-мост продового `api/index.ts` (0% reached) и обнаружение/запуск CLI-агентов (`electron/main.ts`). `AGENTS.md` формально требует TDD, но на практике единственная проверка перед завершением задачи — `npm run build` (typecheck), что и есть testing-002.
- Options: (A) добавить Vitest (уже Vite-проект, минимальный оверхед) и начать с этих пяти путей; (B) оставить без изменений и полагаться на ручное QA перед релизом.
- Decision: (A).
- Governs: [[testing]], [[testing]]
- Consequences: Приоритет — пять критических путей из testing-003..007, затем остальное по мере изменений (testing-driven, не «покрыть всё сразу»). — [[migration_backlog#MB-006]]

<a id="ADR-008"></a>
## ADR-008: Общие доступные (accessible) UI-примитивы вместо самодельных на каждый случай
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: ui-001, ui-002, ui-003, ui-004, ui-005, ui-006, bloat-003, bloat-004
- Context: В `src/components` нет ни одного `aria-*` атрибута (ui-006, подтверждено `grep`); три модалки (`SettingsModal`, `ProjectSettingsModal`, `UpdateModal`) независимо реализуют оверлей без `role="dialog"`/`aria-modal`/Escape/focus-trap (ui-005) и без общего `Modal`-компонента (ui-002); списки выбора (CLI-агент, слайды, фото) — кликабельные `<div>` без клавиатурного пути (ui-004); логика «клик снаружи — закрыть» независимо продублирована в трёх местах (bloat-003); виджет копирования Gatekeeper-команды (`xattr -cr ...`) сегодня существует в `src/components/landing/HeroSection.tsx` и — на момент аудита, в незакоммиченной правке рабочего дерева (`worktree_clean: false`, см. [[drift_report]]) — независимо продублирован в `src/components/landing/FAQSection.tsx` (bloat-004); лендинг смешивает новые токены темы с захардкоженными `zinc-*` (ui-001) и hex-литералами бренда (ui-003).
- Options: (A) выделить общие примитивы (доступный `Modal`, `useClickOutside`, семантичный `SelectableItem`/roving-tabindex список, `role="tablist"`) и мигрировать существующие места на них; (B) точечно патчить aria-атрибуты в каждом файле без общих компонентов.
- Decision: (A) — меньше дублирования и решает и accessibility, и bloat-находки одним ходом.
- Governs: [[ui_kit]], [[ui_kit]]
- Consequences: Три модалки, три места «клик снаружи», selectable-списки и tab-группы (`Header.tsx`, `MultiChannelTabs.tsx`) переезжают на общие примитивы. — [[migration_backlog#MB-007]]

<a id="ADR-009"></a>
## ADR-009: Использовать установленные SDK/нативные API вместо самодельных дублей; убрать неиспользуемые зависимости
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: stack-002, stack-003, stack-004, stack-005, stack-006, bloat-001, bloat-002, bloat-005, bloat-006
- Context: `@anthropic-ai/sdk`, `@google/generative-ai`, `openai` установлены, но `llm-client.ts` говорит со всеми тремя через сырой `fetch()` (stack-002/bloat-001). `colorthief` установлен, но `color-extractor.ts` вручную усредняет пиксели канваса (stack-004/bloat-002). `better-sqlite3` + типы не используются — единственный драйвер БД — `postgres`/`drizzle-orm/postgres-js` (stack-003). `roundRect()` в `export-utils.ts` вручную строит путь вместо нативного `CanvasRenderingContext2D.roundRect()` (bloat-005). `scripts/make-icns.js` дублирует `generate-icons.js` и нигде не вызывается (bloat-006, dead code). `vercel.json`'s `buildCommand` пропускает typecheck и генерацию иконок, которые запускает `package.json`'s `build` (stack-005). `.npmrc` c `legacy-peer-deps=true` — сигнал неразрешённого конфликта peer-зависимостей, вероятно вокруг React 19 (stack-006, низкая уверенность без доступа к registry).
- Options: (A) переиспользовать установленные SDK/нативные API, удалить неиспользуемые зависимости и мёртвый скрипт, выровнять `vercel.json`'s `buildCommand` с `package.json`'s `build`; (B) оставить как есть — работает, хоть и задублировано.
- Decision: (A).
- Governs: [[techstack]], [[techstack]]
- Consequences: `better-sqlite3`, `@types/better-sqlite3`, `colorthief` (если не начнём использовать вместо самописной логики) — кандидаты на удаление после подтверждения отсутствия других потребителей. `make-icns.js` — на удаление. `.npmrc`'s `legacy-peer-deps` требует разбора конкретного конфликта, а не игнорирования. — [[migration_backlog#MB-008]], [[migration_backlog#MB-009]]

<a id="ADR-010"></a>
## ADR-010: Точечное усиление безопасности (ошибки, хранение BYOK-ключей, Electron webSecurity, пиннинг Actions)
- Date: 2026-08-23 · Status: accepted · Level: specialist · Accepted by: user
- Supersedes: none
- Sources: security-005, security-006, security-007, security-008
- Context: `api/index.ts:232` возвращает клиенту сырые `err.message`/`err.stack` необработанных ошибок (security-005). BYOK API-ключи провайдеров хранятся в `localStorage` через zustand `persist` без `partialize` и без шифрования (security-006). `electron/main.ts:114` безусловно ставит `webSecurity: false` на главном `BrowserWindow`, при этом `contextIsolation`/`nodeIntegration` настроены корректно (security-007). Релизный workflow пиннит `actions/checkout`/`actions/setup-node` мутируемым тегом `@v4`, а не SHA (security-008, низкая severity).
- Options: (A) устранить каждый пункт точечно; (B) отложить как низкоприоритетный техдолг.
- Decision: (A) для среднего/высокого — ошибки и хранение ключей чинятся; (B) для низкого — пиннинг Actions переносится в migration-backlog с низким приоритетом, не блокирует релиз.
- Governs: [[security]], [[security]]
- Consequences: Обработчик ошибок в `api/index.ts` возвращает нейтральное сообщение, детали — только в серверный лог. BYOK-ключи в сторе используют `partialize`, чтобы не персистить их в открытом виде (либо переносятся в Electron `safeStorage`, когда доступно). `webSecurity: false` убирается, если не найдётся задокументированной причины (сейчас её нет). — [[migration_backlog#MB-011]], [[migration_backlog#MB-012]]
