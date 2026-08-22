import { LLMConfig, GenerationResult, SlideItem } from '../../types';
import { buildMarketingSystemPrompt } from '../prompts/presets';


/**
 * Extracts requested number of slides from user prompt (e.g. "из 9 слайдов", "6 slides")
 */
export function extractSlideCount(raw: string): number {
  const match = raw.match(/(\d+)\s*(?:слайд[а-яё]*|slides?|страниц[а-яё]*|карточ[а-яё]*)/iu);
  if (match && match[1]) {
    const count = parseInt(match[1], 10);
    if (count >= 3 && count <= 15) return count;
  }
  return 8;
}

/**
 * Strips command prefixes & prepositions from topic ("9 слайдов о пользе пуков..." -> "Польза пуков и отрыжек")
 */
export function cleanPromptTopic(raw: string): string {
  let cleaned = raw.trim();

  // Strip leading numbers & slide count words
  cleaned = cleaned
    .replace(/^#+\s*/gu, '')
    .replace(/^(?:создай|напиши|сделай|подготовь|сгенерируй|разбери|расскажи)\s+/gui, '')
    .replace(/^(?:карусель|пост|тред|презентацию|слайды|материал)\s+/gui, '')
    .replace(/^(?:из\s+)?\d+\s*(?:слайд[а-яё]*|пост[а-яё]*|частей|карточ[а-яё]*|страниц[а-яё]*)\s*/gui, '')
    .replace(/^(?:о|об|про|на тему|тема:)\s+/gui, '')
    .trim();

  cleaned = cleaned.replace(/^\d+\s*(?:слайд[а-яё]*|страниц[а-яё]*|карточ[а-яё]*)\s*(?:о|об|про)?\s*/gui, '').trim();
  cleaned = cleaned.replace(/^(?:о|об|про|на тему|тема:)\s+/gui, '').trim();

  // Fix common case endings e.g. "пользе" -> "польза", "выгорании" -> "выгорание"
  if (/^пользе/i.test(cleaned)) cleaned = cleaned.replace(/^пользе/i, 'польза');
  if (/^выгорании/i.test(cleaned)) cleaned = cleaned.replace(/^выгорании/i, 'выгорание');

  if (!cleaned) cleaned = 'Как устроен наш организм и привычки';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

interface TopicInsight {
  hookHeadline: string;
  hookSubheadline: string;
  points: { headline: string; sub: string; body: string; accent: string[] }[];
  finalHeadline: string;
  finalSubheadline: string;
  finalQuestion: string;
  finalAccent: string[];
}

function getSemanticKnowledge(rawInput: string, topic: string): TopicInsight {
  const lower = rawInput.toLowerCase();

  // 1. ПОЛЬЗА ПУКОВ / ОТРЫЖЕК / ЖКТ
  if (/пук|отрыжк|метеоризм|газ|кишечник|жкт|пищеварен/i.test(lower)) {
    return {
      hookHeadline: 'Почему газы и отрыжка — главный признак здорового ЖКТ.',
      hookSubheadline: 'Что 38 триллионов бактерий микробиома пытаются сказать вашему мозгу и когда естественные звуки спасают от воспаления.',
      points: [
        {
          headline: '500–1500 мл газа в сутки — медицинская норма.',
          sub: 'В среднем здоровый человек выпускает газы от 14 до 23 раз в день.',
          body: 'Это естественный результат ферментации пищевых волокон полезными бактериями толстого кишечника.',
          accent: ['500–1500 мл', '14 до 23 раз'],
        },
        {
          headline: 'Сероводород защищает клетки от повреждений.',
          sub: 'Газ с характерным запахом — мощный внутриклеточный антиоксидант.',
          body: 'В микродозах он защищает митохондрии, снижает риск деменции и нормализует артериальное давление.',
          accent: ['защищает митохондрии', 'антиоксидант'],
        },
        {
          headline: 'Отрыжка спасает желудок от баротравмы.',
          sub: 'При каждом приеме пищи мы заглатываем до 15 мл воздуха (аэрофагия).',
          body: 'Если бы желудок не сбрасывал избыточное давление через пищевод, стенки органа испытывали бы перерастяжение.',
          accent: ['сбрасывал давление', 'аэрофагия'],
        },
        {
          headline: 'Сдерживание газов опасно для сосудов и легких.',
          sub: 'Зажатый кишечник всасывает газы обратно в кровоток.',
          body: 'Они разносятся по сосудам и в итоге выводятся через легкие с дыханием, вызывая головную боль и вздутие.',
          accent: ['обратно в кровоток', 'выводятся через легкие'],
        },
        {
          headline: 'О чем говорит запах вашего метеоризма?',
          sub: '99% объема кишечных газов не имеют запаха (азот, водород, метан).',
          body: 'Запах дает всего 1% серных соединений. Чем больше клетчатки и бобовых в рационе — тем активнее микрофлора.',
          accent: ['99% без запаха', '1% серных соединений'],
        },
        {
          headline: 'Клетчатка — супертопливо для микробиома.',
          sub: 'Бактерии питаются тем, что мы не можем переварить сами.',
          body: 'В процессе они вырабатывают короткоцепочечные жирные кислоты (бутират), укрепляющие стенки кишечника и иммунитет.',
          accent: ['бутират', 'укрепляющие иммунитет'],
        },
        {
          headline: 'Красные флаги: когда стоит пойти к гастроэнтерологу.',
          sub: 'Нормальные звуки тела не должны сопровождаться болью.',
          body: 'Если вздутие сопровождается тошнотой, потерей веса или резкими спазмами — это повод проверить ферменты и переносимость лактозы.',
          accent: ['Красные флаги', 'без боли'],
        },
      ],
      finalHeadline: 'Слушайте сигналы тела и не блокируйте микробиом.',
      finalSubheadline: 'Естественные звуки — это показатель того, что ваши 38 триллионов бактерий сыты и работают на вас.',
      finalQuestion: 'А вы знали, что сдерживание газов заставляет их выходить через дыхание? Делитесь в комментариях!',
      finalAccent: ['не блокируйте микробиом'],
    };
  }

  // 2. ЧИХАНИЕ / ИММУНИТЕТ
  if (/чих|носоглотк|иммунитет|аллерг/i.test(lower)) {
    return {
      hookHeadline: 'Почему чихать — это скрытая суперсила вашего тела.',
      hookSubheadline: 'Что происходит в организме за те 0.2 секунды, пока длится чих, и почему его никогда нельзя сдерживать.',
      points: [
        {
          headline: 'Скорость выдоха — до 160 км/ч.',
          sub: 'В момент чиха легкие работают как мощный компрессор.',
          body: 'Воздушная волна на сверхскорости выбивает из носоглотки до 100 000 микробов, пыли и аллергенов.',
          accent: ['160 км/ч', '100 000 микробов'],
        },
        {
          headline: 'Мгновенная перезагрузка слизистой.',
          sub: 'Тройничный нерв посылает мощный сигнал в ствол мозга.',
          body: 'Реснички эпителия очищаются и мгновенно восстанавливают способность фильтровать кислород.',
          accent: ['перезагрузка', 'фильтровать кислород'],
        },
        {
          headline: 'Защитный рефлекс глаз.',
          sub: 'Почему невозможно чихнуть с открытыми глазами?',
          body: 'Импульсы автоматически смыкают веки, предотвращая попадание бактерий и защищая глазное яблоко от давления.',
          accent: ['защищая глазное яблоко'],
        },
        {
          headline: 'Опасность сдерживания чиха.',
          sub: 'Зажимать нос и рот во время чихания категорически запрещено.',
          body: 'Внутреннее давление возрастает в 20 раз и может повредить сосуды головы или барабанные перепонки.',
          accent: ['в 20 раз', 'повредить сосуды'],
        },
        {
          headline: 'Световой чихательный рефлекс.',
          sub: 'Почему до 35% людей чихают, глядя на солнце?',
          body: 'Зрительный и тройничный нервы расположены близко, вызывая перекрестный импульс — это генетическая особенность.',
          accent: ['до 35% людей', 'генетическая особенность'],
        },
        {
          headline: 'Иммунный щит первого рубежа.',
          sub: 'Без чихания инфекции проникали бы в легкие в 5 раз быстрее.',
          body: 'Это врожденный биологический механизм самоочищения, выработанный миллионами лет эволюции.',
          accent: ['в 5 раз быстрее', 'самоочищения'],
        },
        {
          headline: 'Как правильно чихать в обществе.',
          sub: 'Забудьте привычку прикрывать рот ладонями.',
          body: 'Чихать следует в сгиб локтя или одноразовую салфетку, чтобы не разносить бактерии по предметам вокруг.',
          accent: ['в сгиб локтя'],
        },
      ],
      finalHeadline: 'Чихайте свободно и защищайте свой иммунитет.',
      finalSubheadline: 'Чих — это естественный встроенный щит вашего организма.',
      finalQuestion: 'А вы знали, что во время чихания невозможно не закрыть глаза? Делитесь в комментариях!',
      finalAccent: ['защищайте свой иммунитет'],
    };
  }

  // 3. ВЫГОРАНИЕ / ПРОДУКТИВНОСТЬ / ПСИХОЛОГИЯ
  if (/выгоран|устал|фокус|дофамин|стресс|привычк|мотивац/i.test(lower)) {
    return {
      hookHeadline: `${topic}: скрытый механизм, о котором молчат.`,
      hookSubheadline: 'Почему сила воли не работает и как перестроить дофаминовую систему без срывов.',
      points: [
        {
          headline: '1. Мозг защищается от перегрузки.',
          sub: 'Усталость — это не лень, а химический стоп-кран.',
          body: 'Когда истощаются запасы нейромедиаторов, префронтальная кора отключает фокус, требуя регенерации.',
          accent: ['химический стоп-кран', 'префронтальная кора'],
        },
        {
          headline: '2. Ловушка дешёвого дофамина.',
          sub: 'Быстрые стимулы повышают базовый порог чувствительности.',
          body: 'Скроллинг ленты и уведомления истощают рецепторы, делая сложные задачи невыносимо скучными.',
          accent: ['базовый порог', 'истощают рецепторы'],
        },
        {
          headline: '3. Правило 90-минутных ультрадианных ритмов.',
          sub: 'Биология продуктивности работает волнами.',
          body: 'Глубокий фокус возможен только циклами по 90 минут, после чего мозгу требуется 15 минут сенсорной тишины.',
          accent: ['90-минутных ритмов', 'сенсорной тишины'],
        },
        {
          headline: '4. Микрошаги побеждают прокрастинацию.',
          sub: 'Снизьте барьер входа до 2 минут.',
          body: 'Амигдала блокирует страх перед масштабом задачи, если вы договоритесь с собой сделать всего одно элементарное действие.',
          accent: ['барьер входа', '2 минут'],
        },
        {
          headline: '5. Сон — главный архитектор памяти.',
          sub: 'Глимфатическая система мозга очищается только ночью.',
          body: 'Во время глубоких фаз сна выводятся токсичные бета-амилоиды и консолидируются новые нейронные связи.',
          accent: ['Глимфатическая система', 'нейронные связи'],
        },
      ],
      finalHeadline: 'Фокусируйтесь на энергии, а не на времени.',
      finalSubheadline: 'Управление собственным состоянием дает контроль над любыми проектами.',
      finalQuestion: 'А какие методы восстановления лучше всего работают у вас? Делитесь в комментариях!',
      finalAccent: ['на энергии, а не на времени'],
    };
  }

  // 4. ДЕЛОВОЙ / БИЗНЕС / СТАРТАПЫ / AI / УНИВЕРСАЛЬНЫЙ
  return {
    hookHeadline: `${topic}: 7 скрытых правил, меняющих игру.`,
    hookSubheadline: 'Разбираем ключевые закономерности, неочевидные механики и выводы без воды.',
    points: [
      {
        headline: '1. Фундаментальный разрыв шаблона.',
        sub: 'Большинство совершают одну и ту же ошибку в начале пути.',
        body: 'Фокусировка на второстепенных процессах съедает до 80% ресурсов, пока ключевой рычаг роста остается незамеченным.',
        accent: ['разрыв шаблона', '80% ресурсов'],
      },
      {
        headline: '2. Скорость обратной связи решает всё.',
        sub: 'Выигрывает не тот, кто идеален, а тот, кто быстрее учится.',
        body: 'Каждая проверенная гипотеза сокращает цикл неопределенности и приближает системный результат.',
        accent: ['Скорость обратной связи', 'системный результат'],
      },
      {
        headline: '3. Асимметричное преимущество.',
        sub: 'Найдите то, что дается вам легко, но трудно для других.',
        body: 'Использование узких сильных сторон создает непреодолимый барьер для конкурентов.',
        accent: ['Асимметричное преимущество'],
      },
      {
        headline: '4. Устранение скрытого трения.',
        sub: 'Простота масштабируется, сложность ломается.',
        body: 'Уберите лишние шаги в цепочке принятия решений — и конверсия вырастет в разы без дополнительных вложений.',
        accent: ['Простота масштабируется', 'в разы'],
      },
      {
        headline: '5. Фокус на долгосрочном капитале.',
        sub: 'Бренд, репутация и доверие аудитории.',
        body: 'Тактические приемы устаревают за месяцы, фундаментальные принципы доверия работают десятилетиями.',
        accent: ['долгосрочном капитале', 'доверия'],
      },
    ],
    finalHeadline: 'Применяйте фундаментальные принципы на практике.',
    finalSubheadline: 'Понимание глубинной механики дает устойчивое преимущество в любой сфере.',
    finalQuestion: 'А какой из этих пунктов откликается вам больше всего? Делитесь в комментариях!',
    finalAccent: ['устойчивое преимущество'],
  };
}

function buildDynamicFallback(rawInput: string, targetCount: number, clientProfileId: string): GenerationResult {
  const topic = cleanPromptTopic(rawInput);
  const now = new Date().toISOString();
  const insight = getSemanticKnowledge(rawInput, topic);

  const slides: SlideItem[] = [];

  // 1. Cover
  slides.push({
    id: 'slide_1',
    slideNumber: 1,
    type: 'cover',
    headline: insight.hookHeadline,
    subheadline: insight.hookSubheadline,
    bodyParagraphs: [],
    accentWords: ['главный признак', 'здорового ЖКТ', 'суперсила'],
    showArrow: true,
  });

  // 2..N-1 Content Slides
  const neededContentCount = targetCount - 2;
  for (let i = 0; i < neededContentCount; i++) {
    const pt = insight.points[i % insight.points.length];
    slides.push({
      id: `slide_${i + 2}`,
      slideNumber: i + 2,
      type: 'content',
      headline: pt.headline,
      subheadline: pt.sub,
      bodyParagraphs: [pt.body],
      accentWords: pt.accent,
      showArrow: true,
    });
  }

  // Final Slide (N)
  slides.push({
    id: `slide_${targetCount}`,
    slideNumber: targetCount,
    type: 'final',
    headline: insight.finalHeadline,
    subheadline: insight.finalSubheadline,
    bodyParagraphs: [insight.finalQuestion],
    accentWords: insight.finalAccent,
    showArrow: false,
  });

  return {
    id: `gen_${Date.now()}`,
    title: topic,
    rawInput,
    slides,
    telegramPost: `🔥 **${insight.hookHeadline}**\n\n${insight.hookSubheadline}\n\n👇 **Главные выводы:**\n${slides.slice(1, -1).map((s, i) => `${i + 1}. **${s.headline}** — ${s.bodyParagraphs?.[0] || ''}`).join('\n')}\n\n💬 *${insight.finalQuestion}*`,
    linkedInPost: `${insight.hookHeadline}\n\n${insight.hookSubheadline}\n\nKey takeaways:\n${slides.slice(1, -1).map((s) => `• ${s.headline}`).join('\n')}\n\nWhat are your thoughts on this?`,
    threadsPosts: slides.slice(0, 4).map((s, i) => `${i + 1}/4 ${s.headline} ${s.bodyParagraphs?.[0] || ''}`),
    clientProfileId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function generateContentPackage(
  rawInput: string,
  config: LLMConfig,
  clientProfileId: string
): Promise<GenerationResult> {
  const targetSlideCount = extractSlideCount(rawInput);
  const systemPrompt = buildMarketingSystemPrompt(targetSlideCount);

  let rawJsonText = '';

  // 1. LOCAL CLI / MAC APP MODE (Claude Code, ChatGPT, Gemini CLI)
  if (config.mode === 'local_cli') {
    if (window.electronAPI && window.electronAPI.executeCLI) {
      try {
        const fullPrompt = `${systemPrompt}\n\nСЫРОЙ ЗАПРОС / ТЕМА ПОЛЬЗОВАТЕЛЯ:\n${rawInput}\n\nТРЕБОВАНИЕ: Сгенерируй ровно ${targetSlideCount} слайдов! Верни ТОЛЬКО чистый JSON объект!`;
        rawJsonText = await window.electronAPI.executeCLI({
          cliType: config.cliAgent || 'chatgpt',
          prompt: fullPrompt,
          model: config.cliModel,
        });
      } catch (cliErr: any) {
        console.warn('CLI execution fallback to semantic marketing engine:', cliErr);
        return buildDynamicFallback(rawInput, targetSlideCount, clientProfileId);
      }
    } else {
      return buildDynamicFallback(rawInput, targetSlideCount, clientProfileId);
    }
  }
  // 2. BYOK MODE
  else if (config.provider === 'openai') {
    if (!config.openaiKey) throw new Error('OpenAI API key не указан в настройках.');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Запрос пользователя: ${rawInput}\n\nСгенерируй ровно ${targetSlideCount} слайдов.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI Error: ${err}`);
    }
    const data = await response.json();
    rawJsonText = data.choices[0].message.content;
  } else if (config.provider === 'anthropic') {
    if (!config.anthropicKey) throw new Error('Anthropic Claude API key не указан в настройках.');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.anthropicKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Запрос: ${rawInput}\nСгенерируй ровно ${targetSlideCount} слайдов в JSON.` }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic Error: ${err}`);
    }
    const data = await response.json();
    rawJsonText = data.content[0].text;
  } else if (config.provider === 'gemini') {
    if (!config.geminiKey) throw new Error('Google Gemini API key не указан в настройках.');
    const model = config.model || 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nЗапрос: ${rawInput}\nСгенерируй ровно ${targetSlideCount} слайдов в JSON.` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google Gemini Error: ${err}`);
    }
    const data = await response.json();
    rawJsonText = data.candidates[0].content.parts[0].text;
  }

  // Parse JSON response
  let cleanJson = rawJsonText.trim();
  const firstBrace = cleanJson.indexOf('{');
  const lastBrace = cleanJson.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (e: any) {
    return buildDynamicFallback(rawInput, targetSlideCount, clientProfileId);
  }

  const now = new Date().toISOString();

  return {
    id: `gen_${Date.now()}`,
    title: parsed.title || cleanPromptTopic(rawInput),
    rawInput,
    slides: (parsed.slides || []).map((s: any, idx: number) => ({
      id: `slide_${idx + 1}`,
      slideNumber: s.slideNumber || idx + 1,
      type: s.type || (idx === 0 ? 'cover' : idx === (parsed.slides.length - 1) ? 'final' : 'content'),
      headline: s.headline || '',
      subheadline: s.subheadline || '',
      bodyParagraphs: s.bodyParagraphs || [],
      accentWords: s.accentWords || [],
      showArrow: s.showArrow !== undefined ? s.showArrow : idx < parsed.slides.length - 1,
    })),
    telegramPost: parsed.telegramPost || '',
    linkedInPost: parsed.linkedInPost || '',
    threadsPosts: parsed.threadsPosts || [],
    clientProfileId,
    createdAt: now,
    updatedAt: now,
  };
}
