# Отчёт о дрейфе (Drift report)

## Снимок
- run_id: audit-20260823T005819Z-eb01
- scanned_at: 2026-08-22T22:03:57Z (последний аудитор из 7) — 2026-08-23T01:20:00Z (testing, самый поздний)
- revision (git HEAD на момент аудита): 17f2b36946e974a0142995daecc51cf35b3f5f58
- worktree_clean: false (в рабочем дереве были незакоммиченные правки лендинга на момент аудита)
- scope: весь репозиторий, кроме `dist/`, `dist-electron/`, `build/`, `node_modules/`, `.git/` (см. `.jcodemunch.jsonc`); секретный файл `.npmrc` пропущен индексатором, прочитан напрямую security-аудитором
- coverage: 7 из 7 требуемых доменов (stack, architecture, bloat, security, testing, ui, data) — все завершены; `resources/`, `scratch/`, `public/` не процитированы ни одним аудитором как evidence (статические ассеты и dev-скретч-файл) — `outcome: coverage-incomplete` зафиксирован честно, не округлён до «complete»

## Несоответствия
Это первый прогон (`context_state` было `absent` до генерации) — базового `PROJECT_CONTEXT.md` для сравнения не существовало. Несоответствия ниже — из слепой (blind) проверки самих сгенерированных документов против реального репозитория, а не из повторного аудита существующего контекста.

- Sources: blind-verification-pass-1
- Target: `decisions.md#ADR-002` (Governs) → `[[architecture]]`
- Evidence: заголовок в `architecture.md` — `## Границы ответственности` (обратный порядок слов), ссылка не резолвилась.
- Disposition: false fact fixed — ссылка исправлена на точный текст заголовка.

- Sources: blind-verification-pass-1
- Target: `LegacyWarning.md` (запись про `title`/`aria-label`)
- Evidence: `ProjectSettingsModal.tsx:449` (delete-кнопка) имеет `title`, хотя запись обобщала «весь файл — без title» по кнопке закрытия (`:170`).
- Disposition: false fact fixed — формулировка сужена до конкретных кнопок закрытия, а не файлов целиком.

- Sources: blind-verification-pass-1
- Target: `data-model.md`, `LegacyWarning.md` (data-002)
- Evidence: клиентская (`src/types/index.ts:28`) и серверная (`server/src/db/schema.ts:70`) модели проекта делят служебные поля `id`/`createdAt`/`updatedAt`; буквальное «не пересекаются ни одним полем» было неточным.
- Disposition: false fact fixed — формулировка уточнена до «ни одним доменным полем».

- Sources: blind-verification-pass-1
- Target: `data-model.md` (описание `MarlexProject`)
- Evidence: слайды/промпты/экспортированные тексты в реальности лежат в `currentResult: GenerationResult` (`src/types/index.ts:124`), не в самом типе `MarlexProject` (`src/types/index.ts:28-40`).
- Disposition: false fact fixed — описание разделено на `MarlexProject` (метаданные) и `currentResult` (контент).

- Sources: blind-verification-pass-2
- Target: `security.md` (пункт про пиннинг GitHub Actions)
- Evidence: `.github/workflows/release.yml:31,34` реально использует мутируемые теги `@v4`, а не SHA — документ утверждал целевое состояние как текущий факт.
- Disposition: false fact fixed — помечено как целевое состояние, с явной ссылкой на текущее состояние и [[migration_backlog#MB-012]].

- Sources: blind-verification-pass-2
- Target: `project-map.json` (edge `backend_dev_server` → `schema_source`)
- Evidence: evidence-массив ссылался только на строку 34 (`app.get`), хотя label также описывает `app.post` (строка 44).
- Disposition: false fact fixed — добавлена вторая evidence-запись на строку 44.

- Sources: blind-verification-pass-2
- Target: `edge-cases.md`
- Evidence: реальный, ранее не задокументированный баг — кнопка «Сбросить кэш» в error boundary (`src/main.tsx`) чистит localStorage-ключ `'marlex-storage'`, а реальный ключ zustand `persist` — `'marlex-content-storage-v5'` (`useMarlexStore.ts`); кнопка сегодня no-op.
- Disposition: debt/TODO recorded — добавлено в `edge-cases.md`; не заведено как отдельный MB-пункт (вне рамок исходного аудита, приоритет не оценён), решение — на усмотрение пользователя.

## Независимая проверка полноты
- checked_at: 2026-08-23 (четыре прогона)
- Прогон 1: 2 important/contradiction, 2 minor/contradiction, 0 blocking, 0 omission. Не удовлетворяет стоп-правилу (есть important) — все 4 исправлены.
- Прогон 2: 1 important/contradiction, 1 important/broken-link, 3 minor (1 omission, 1 imprecision, 1 real undocumented bug), 0 blocking. Не удовлетворяет стоп-правилу — все исправлены (кроме [[drift_report]]-ссылки, которая резолвится самим фактом появления этого файла в том же батче генерации).
- Прогон 3: 1 important (contradiction + omission: bloat-004's Gatekeeper-виджет утверждался как факт для аудированного HEAD, хотя дублирование существовало только в незакоммиченной правке `FAQSection.tsx`; MB-007's «Where» не перечислял файлы, где реально находится bloat-004), 0 blocking. Не удовлетворяет стоп-правилу — исправлено (явная привязка к `worktree_clean: false`, добавлены пути в MB-007).
- Прогон 4: 0 blocking, 0 important; 1 minor (imprecision) — `migration-backlog.md#MB-011`'s ссылка `useMarlexStore.ts:518` указывала на открывающую скобку блока `persist`-опций, а не на строку `name: 'marlex-content-storage-v5'` (строка 519). Исправлено.
- **verdict: passed.** Прогон 4 удовлетворяет стоп-правилу (0 blocking, 0 important). Итого: 4 прогона из 8 допустимых, 7 реальных проблем найдено и исправлено (5 important/contradiction, 1 broken-link, включая обнаружение ранее незадокументированного бага с ключом localStorage — записан в [[edge_cases]] отдельно от исходных 41 находок аудита), 0 unresolved blocking/important issues.

## Ограничения верификации
- jCodeMunch: `exclude_skip_directories` из `.jcodemunch.jsonc` игнорируется движком индексации в этой версии (известное ограничение v1.108.210+, см. `references/jcodemunch.md`) — вручную подтверждено отсутствие путаницы через явные `extra_ignore_patterns` при индексации.
- Проверка уязвимостей зависимостей по сетевому advisory-источнику не выполнялась (офлайн-профиль, без сетевого доступа) — см. [[security]].
- `layer_violations`-проверка jCodeMunch — no-op (в репозитории нет объявленных layer-правил), зафиксировано архитектурным аудитором как ограничение, не как чистый результат.
- Сравнение с предыдущим прогоном невозможно — это первый аудит репозитория (`context_state: absent`).

Related: [[context]] · [[legacy_warning]] · [[migration_backlog]]
