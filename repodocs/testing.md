# testing.md — правила верификации и тестирования

<!-- Purpose: the agent knows how this project proves behavior and what evidence is required. -->

## Как выполняется верификация
Целевое состояние (см. [[decisions#ADR-007]]) — Vitest как единственный тестовый раннер, запускается через `npm test` (скрипт добавляется вместе с внедрением). CI (`.github/workflows/release.yml`) получает шаг `npm test` перед сборкой релиза.

## Где живут проверки и evidence; как они называются
- Тесты — рядом с тестируемым модулем: `<module>.test.ts`.
- Первая волна тестов покрывает пять путей, зафиксированных как критические в ходе аудита (см. ниже) — [[migration_backlog#MB-006]].

## Стратегия покрытия по риску
| Путь | Уровень проверки | Почему |
|---|---|---|
| `compareSemver` (`electron/main.ts`) | unit, граничные значения | гейтит автообновление для всех desktop-пользователей |
| `generateContentPackage` / `buildDynamicFallback` (`src/lib/ai/llm-client.ts`) | unit + контрактный тест на JSON-парсинг и fallback | самая сложная функция после `renderSlideToCanvas`/`ContextualInspector`/`InteractiveSlideCanvas` (cyclomatic 41), основной AI-пайплайн продукта |
| `renderSlideToCanvas` / `exportSlidesToZip` / `exportSlidesToPdf` (`src/lib/canvas/export-utils.ts`) | unit на граничные случаи (пустой фон, 0 слайдов, длинный текст) | ядро продукта — генерация самой карусели |
| HTTP-мост `api/index.ts` (`readBody`/`setCors`/`toWebRequest`/`writeWebResponse`/`handler`) | контрактный тест запрос→ответ | единственная продовая точка входа |
| Обнаружение/запуск CLI-агентов (`electron/main.ts`) | unit с мокнутым `child_process` | межплатформенная логика, тихий сбой не будет замечен без теста |

Не изобретать формальный coverage-процент или пирамиду — приоритет только для перечисленных путей, остальное добавляется по мере изменений.

## Обязательная верификация
- `compareSemver`, `generateContentPackage`, `renderSlideToCanvas`, HTTP-мост `api/index.ts`, CLI-discovery — не должны меняться без соответствующего теста (см. таблицу выше).
- После [[decisions#ADR-002]] (консолидация бэкенда) — `/api/projects` GET/POST получают тест на авторизацию (session required, `userId`-scoping) как часть той же задачи, не отдельно.

## Adversarial-проверки
- `compareSemver`: pre-release-суффиксы (`0.1.4-beta`), разное число сегментов версии, невалидный ввод.
- `generateContentPackage`: невалидный/усечённый JSON от модели, таймаут провайдера, переключение между провайдерами.
- `renderSlideToCanvas`: отсутствующее фоновое изображение, 0 слайдов, аномально длинный текст (перенос строк).
- `/api/projects` (после консолидации): запрос без сессии, запрос с чужим `userId`.

## Фикстуры, симуляторы, окружения и инфраструктура
- Нет CI-шага для БД/сети сегодня — тесты, требующие Postgres, используют мок/тестовую БД (конкретный механизм выбирается при реализации [[migration_backlog#MB-006]], не изобретается заранее здесь).

## Неподдерживаемые или запрещённые паттерны
- Тавтологичные тесты (проверка реализации, повторяющая саму реализацию) — не считаются verification для путей из таблицы выше.
- Тестовый дубль, называющий модуль, который проверяемый юнит не импортирует, — не покрытие; это отдельная находка (см. `_common.md`'s test-double rule), а не тест.

Related: [[context]] · [[edge_cases]]
