# LegacyWarning.md — технический долг

## Клиентская и серверная модель проекта не пересекаются ни одним доменным полем
- Sources: data-002
- What: `MarlexProject` (zustand + localStorage, клиент) и Postgres-таблица `projects` (сервер) — независимые модели; общие только служебные `id`/`createdAt`/`updatedAt`, ни одно смысловое поле не совпадает. FAQ лендинга прямо говорит «все данные хранятся локально», так что `/api/projects` сегодня, судя по всему, не вызывается фронтендом вовсе.
- Where: `src/lib/store/useMarlexStore.ts` (клиентская модель), `server/src/db/schema.ts` (серверная)
- Why it's like this for now: сервер/API, похоже, строился как задел на будущее (синхронизация/облако), а не как активно используемый путь — MVP работает полностью локально.
- Risk when changing nearby: при выполнении [[migration_backlog#MB-001]] не подгонять серверную схему под клиентскую (и наоборот) вслепую — сперва явно решить, remains ли `/api/projects` локальным API для будущей синхронизации или от него стоит отказаться, если он не нужен.
- Related: [[migration_backlog#MB-001]]

## Часть иконочных кнопок без `aria-label` всё же имеет `title`
- Sources: ui-006
- What: независимая проверка нашла, что конкретные кнопки закрытия в `ContextualInspector.tsx`, `CanvaToolbar.tsx`, `StudioLayout.tsx` — в отличие от кнопок закрытия в `SettingsModal.tsx:152`/`UpdateModal.tsx:31`/`ProjectSettingsModal.tsx:170` — всё-таки задают `title="..."`. Большинство браузеров считают `title` accessible name по умолчанию, так что для этих конкретных кнопок удар по доступности мягче. Это не обобщение на файл целиком: например, `ProjectSettingsModal.tsx` в другом месте (delete-кнопка на строке 449) тоже имеет `title`, при этом её собственная кнопка закрытия (строка 170) — нет; сравнивать нужно конкретную кнопку, не файл.
- Where: `src/components/studio/ContextualInspector.tsx`, `src/components/canva/CanvaToolbar.tsx`, `src/components/studio/StudioLayout.tsx` (кнопки с `title`) vs. `src/components/settings/SettingsModal.tsx:152`, `src/components/updater/UpdateModal.tsx:31`, `src/components/projects/ProjectSettingsModal.tsx:170` (кнопки закрытия без `title` и без `aria-label`)
- Why it's like this for now: `title` добавлялся точечно как тултип для мыши на части кнопок, не как системная замена `aria-label`.
- Risk when changing nearby: при выполнении [[migration_backlog#MB-007]] не полагаться на существующий `title` как на «уже готово» — добавить `aria-label` явно везде одинаково, `title` можно оставить как есть (не мешает).
- Related: [[migration_backlog#MB-007]]
