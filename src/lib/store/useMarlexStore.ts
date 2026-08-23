import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientProfile, GenerationResult, LLMConfig, SlideItem, MarlexProject, TextPositionMode } from '../../types';
import { generateContentPackage } from '../ai/llm-client';
import { DEFAULT_BG_COLOR, DEFAULT_ACCENT_COLOR } from '../constants';

interface MarlexState {
  // Projects & Team Workspaces
  projects: MarlexProject[];
  activeProject: MarlexProject;
  setActiveProject: (project: MarlexProject) => void;
  addProject: (project: MarlexProject) => void;
  updateProject: (id: string, updated: Partial<MarlexProject>) => void;
  deleteProject: (id: string) => void;
  syncUserWithProjects: (user: { id?: string; name?: string; email?: string }) => void;

  // Backward compatibility alias for ClientProfile
  activeProfile: ClientProfile;

  // LLM Config
  llmConfig: LLMConfig;
  setLLMConfig: (config: Partial<LLMConfig>) => void;

  // Current Content & Studio State
  rawInput: string;
  setRawInput: (val: string) => void;
  isGenerating: boolean;
  activeSlideIndex: number;
  setActiveSlideIndex: (idx: number) => void;
  currentResult: GenerationResult | null;
  setCurrentResult: (res: GenerationResult | null) => void;

  // Visual Assets & Multi-image Pool
  projectImages: string[];
  addProjectImage: (url: string) => void;
  removeProjectImage: (url: string) => void;
  bgPhotoUrl: string | null;
  setBgPhotoUrl: (url: string | null) => void;
  setSlidePhoto: (slideIndex: number, url: string | null, opacity?: number, textPos?: TextPositionMode) => void;
  autoAssignImagesToSlides: () => void;

  bgColor: string;
  setBgColor: (color: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  photoOpacity: number;
  setPhotoOpacity: (val: number) => void;

  // History & Projects
  history: GenerationResult[];
  saveToHistory: (res: GenerationResult) => void;

  // Core Actions
  runGeneration: () => Promise<void>;
  updateSlide: (index: number, updated: Partial<SlideItem>) => void;
  addSlide: (index?: number) => void;
  deleteSlide: (index: number) => void;
  updateChannelText: (channel: 'telegramPost' | 'linkedInPost', text: string) => void;
}

const DEFAULT_PROJECT: MarlexProject = {
  id: 'proj_default',
  name: 'Marlex Content Factory',
  brandHandle: '@marlex.expert',
  authorName: 'Marlex Creator',
  bgColor: DEFAULT_BG_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  textColor: '#FFFFFF',
  font: 'Source Sans 3',
  photoOpacity: 15,
  members: [
    {
      id: 'mem_owner',
      name: 'Marlex Creator',
      email: 'creator@marlex.ai',
      role: 'owner',
      status: 'active',
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SAMPLE_RESULT: GenerationResult = {
  id: 'sample_1',
  title: 'Что AI изменит в стартапах — и почему я бы не стала бояться этого будущего',
  rawInput: 'Текст для карусели: Что AI изменит в стартапах...',
  clientProfileId: 'proj_default',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [
    {
      id: 's1',
      slideNumber: 1,
      type: 'cover',
      headline: 'AI не убьёт стартапы.',
      subheadline: 'Он изменит правила игры. И вот что, на мой взгляд, будет происходить дальше.',
      bodyParagraphs: [],
      accentWords: ['не убьёт', 'изменит правила'],
      showArrow: true,
      textPosition: 'bottom',
    },
    {
      id: 's2',
      slideNumber: 2,
      type: 'content',
      headline: 'Ещё недавно стартапу нужны были:',
      subheadline: 'Идея, деньги, команда из 10–20 человек, месяцы работы.',
      bodyParagraphs: [
        '• Дорогостоящая разработка MVP',
        '• Большой бэклог задач',
        '• Долгий цикл проверки гипотез'
      ],
      accentWords: ['команда', 'месяцы работы'],
      showArrow: true,
      textPosition: 'center',
    },
    {
      id: 's3',
      slideNumber: 3,
      type: 'content',
      headline: 'Создавать продукты станет дешевле.',
      subheadline: 'Раньше для запуска требовались CTO + разработчики + дизайнер + QA.',
      bodyParagraphs: [
        'Сегодня часть этого уже забирает AI.',
        'Сам код становится дешевле. Цена неправильных решений — нет.'
      ],
      accentWords: ['дешевле', 'Цена неправильных решений'],
      showArrow: true,
      textPosition: 'center',
    },
    {
      id: 's4',
      slideNumber: 4,
      type: 'content',
      headline: 'В чём ценность основателя теперь?',
      subheadline: 'Если разработать может каждый — что тогда будет отличать успешный стартап?',
      bodyParagraphs: [
        '• Проблема, которую вы решаете',
        '• Глубокое понимание пользователя',
        '• Скорость экспериментов',
        '• Дистрибуция и доверие'
      ],
      accentWords: ['ценность', 'Дистрибуция'],
      showArrow: true,
      textPosition: 'center',
    },
    {
      id: 's5',
      slideNumber: 5,
      type: 'content',
      headline: 'Ценность будет смещаться в другое.',
      subheadline: 'Не в саму разработку или фичи.',
      bodyParagraphs: [
        '• в скорость проверки гипотез',
        '• в понимание болей аудитории',
        '• в умение выстраивать дистрибуцию'
      ],
      accentWords: ['скорость проверки', 'дистрибуцию'],
      showArrow: true,
      textPosition: 'center',
    },
    {
      id: 's6',
      slideNumber: 6,
      type: 'content',
      headline: 'И да, команды станут меньше.',
      subheadline: 'Если раньше фаундеры искали 20–30 человек для масштабирования...',
      bodyParagraphs: [
        'То теперь компактная команда из 3–5 человек с сильными AI-пайплайнами может строить единорогов.'
      ],
      accentWords: ['3–5 человек', 'единорогов'],
      showArrow: true,
      textPosition: 'center',
    },
    {
      id: 's7',
      slideNumber: 7,
      type: 'content',
      headline: 'Главный вопрос сегодня не: «Куда бы еще добавить AI?»',
      subheadline: 'А: «Что принципиально нового мы можем создать теперь, когда разработка почти бесплатна?»',
      bodyParagraphs: [
        'Тот, кто найдет ответ быстрее других, заберет рынок.'
      ],
      accentWords: ['Что принципиально нового'],
      showArrow: true,
      textPosition: 'center',
    },
    {
      id: 's8',
      slideNumber: 8,
      type: 'final',
      headline: 'Выигрывать будут те, кто лучше понимает: что строить, для кого и зачем.',
      subheadline: 'Сам инструмент не создаёт продукт. А смыслы создаются всегда человеком.',
      bodyParagraphs: [
        'А как изменилась скорость разработки в вашей команде за последний год?'
      ],
      accentWords: ['что строить', 'смыслы'],
      showArrow: false,
      textPosition: 'center',
    }
  ],
  telegramPost: `💡 **AI не убьёт стартапы. Он изменит правила игры.**\n\nЕщё недавно для запуска MVP требовались месяцы и $50k+ бюджета. Сегодня компактная команда из 3-5 человек может опередить корпорацию.\n\n👇 **Ключевые выводы:**\n1. Сам код дешевеет, но цена неправильных решений растет.\n2. Ценность смещается в глубокое понимание болей аудитории и дистрибуцию.\n3. Главный вопрос: не «Куда добавить AI?», а «Что принципиально нового мы можем создать?».`,
  linkedInPost: `AI is not going to kill startups. It's redefining the entire playbook.\n\nBuilding code is becoming commoditized. The real competitive moat is now shifting to:\n• Deep domain insights & customer discovery\n• Speed of iteration and learning loops\n• Audience trust and distribution\n\nA 3-person team with AI workflows can now outpace a 30-person engineering department.\n\nHow is AI changing the structure of your team this year?`,
  threadsPosts: [
    '1/4 AI не убьёт стартапы. Он просто заставит фаундеров заново ответить на вопрос: а за что вообще платят люди?',
    '2/4 Когда код становится дешевым, ценность перемещается в понимание пользователя и дистрибуцию.',
    '3/4 Команда из 3 человек с AI теперь мощнее агентства из 20 человек.',
    '4/4 Главный вопрос 2026: «Что нового мы можем создать?», а не «Куда бы еще добавить AI».'
  ]
};

function projectToClientProfile(p: MarlexProject): ClientProfile {
  return {
    id: p.id,
    name: p.authorName,
    instagramHandle: p.brandHandle,
    telegramChannel: '',
    linkedInUrl: '',
    threadsHandle: p.brandHandle.replace('@', ''),
    defaultBgColor: p.bgColor,
    defaultAccentColor: p.accentColor,
    defaultTextColor: p.textColor,
    defaultFont: p.font,
    photoOpacity: p.photoOpacity,
  };
}

export const useMarlexStore = create<MarlexState>()(
  persist(
    (set, get) => ({
      projects: [DEFAULT_PROJECT],
      activeProject: DEFAULT_PROJECT,
      activeProfile: projectToClientProfile(DEFAULT_PROJECT),

      setActiveProject: (project) => set({ 
        activeProject: project,
        activeProfile: projectToClientProfile(project),
        bgColor: project.bgColor,
        accentColor: project.accentColor,
        photoOpacity: project.photoOpacity
      }),

      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project],
        activeProject: project,
        activeProfile: projectToClientProfile(project),
      })),

      updateProject: (id, updated) => set((state) => {
        const updatedProjects = state.projects.map((p) => p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p);
        const newActive = state.activeProject.id === id ? { ...state.activeProject, ...updated, updatedAt: new Date().toISOString() } : state.activeProject;
        return {
          projects: updatedProjects,
          activeProject: newActive,
          activeProfile: projectToClientProfile(newActive),
          bgColor: newActive.bgColor,
          accentColor: newActive.accentColor,
          photoOpacity: newActive.photoOpacity,
        };
      }),

      deleteProject: (id) => set((state) => {
        const filtered = state.projects.filter((p) => p.id !== id);
        const newActive = filtered[0] || DEFAULT_PROJECT;
        return {
          projects: filtered.length > 0 ? filtered : [DEFAULT_PROJECT],
          activeProject: newActive,
          activeProfile: projectToClientProfile(newActive),
        };
      }),

      syncUserWithProjects: (user) => {
        if (!user || (!user.name && !user.email)) return;
        const currentActive = get().activeProject;
        const currentProjects = get().projects;

        const userName = user.name || (user.email ? user.email.split('@')[0] : 'Marlex Creator');
        const userHandle = '@' + (user.email ? user.email.split('@')[0] : 'marlex.expert');

        if (currentActive.authorName.toLowerCase().includes('mary') || currentActive.brandHandle.toLowerCase().includes('shirokova') || currentActive.id === 'proj_default') {
          const updatedProj: MarlexProject = {
            ...currentActive,
            authorName: userName,
            brandHandle: userHandle,
            members: [
              {
                id: user.id || 'mem_owner',
                name: `${userName} (Владелец)`,
                email: user.email || 'owner@marlex.ai',
                role: 'owner',
                status: 'active',
              }
            ],
            updatedAt: new Date().toISOString(),
          };

          const newProjects = currentProjects.map((p) => p.id === currentActive.id ? updatedProj : p);
          set({
            projects: newProjects,
            activeProject: updatedProj,
            activeProfile: projectToClientProfile(updatedProj),
          });
        }
      },

      llmConfig: {
        mode: 'local_cli',
        cliAgent: 'chatgpt',
        cliModel: 'default',
        provider: 'openai',
        model: 'gpt-4o',
        openaiKey: '',
        anthropicKey: '',
        geminiKey: '',
        localBridgeUrl: 'http://localhost:11434/api/generate',
      },
      setLLMConfig: (cfg) => set((state) => ({ llmConfig: { ...state.llmConfig, ...cfg } })),

      rawInput: '',
      setRawInput: (val) => set({ rawInput: val }),
      isGenerating: false,
      activeSlideIndex: 0,
      setActiveSlideIndex: (idx) => set({ activeSlideIndex: idx }),
      currentResult: DEFAULT_SAMPLE_RESULT,
      setCurrentResult: (res) => set({ currentResult: res, activeSlideIndex: 0 }),

      // Multi-image pool
      projectImages: [],
      addProjectImage: (url) => set((state) => ({ 
        projectImages: [...state.projectImages.filter(img => img !== url), url],
        bgPhotoUrl: state.bgPhotoUrl || url,
      })),
      removeProjectImage: (url) => set((state) => ({
        projectImages: state.projectImages.filter(img => img !== url),
        bgPhotoUrl: state.bgPhotoUrl === url ? (state.projectImages.filter(img => img !== url)[0] || null) : state.bgPhotoUrl,
      })),

      bgPhotoUrl: null,
      setBgPhotoUrl: (url) => set({ bgPhotoUrl: url }),

      setSlidePhoto: (slideIndex, url, opacity = 85, textPos = 'bottom') => {
        const { currentResult } = get();
        if (!currentResult) return;
        const newSlides = [...currentResult.slides];
        newSlides[slideIndex] = {
          ...newSlides[slideIndex],
          photoUrl: url,
          photoOpacity: opacity,
          textPosition: textPos,
          elements: undefined, // Reset elements to re-flow with new photo layout
        };
        set({
          currentResult: {
            ...currentResult,
            slides: newSlides,
            updatedAt: new Date().toISOString(),
          }
        });
      },

      autoAssignImagesToSlides: () => {
        const { currentResult, projectImages } = get();
        if (!currentResult || projectImages.length === 0) return;

        const newSlides = currentResult.slides.map((slide, idx) => {
          const assignedImg = projectImages[idx % projectImages.length];
          return {
            ...slide,
            photoUrl: assignedImg,
            photoOpacity: idx === 0 ? 90 : 75,
            textPosition: (idx === 0 ? 'bottom' : (idx % 2 === 0 ? 'bottom' : 'top')) as TextPositionMode,
            elements: undefined,
          };
        });

        set({
          currentResult: {
            ...currentResult,
            slides: newSlides,
            updatedAt: new Date().toISOString(),
          }
        });
      },

      bgColor: DEFAULT_BG_COLOR,
      setBgColor: (color) => set({ bgColor: color }),
      accentColor: DEFAULT_ACCENT_COLOR,
      setAccentColor: (color) => set({ accentColor: color }),
      photoOpacity: 15,
      setPhotoOpacity: (val) => set({ photoOpacity: val }),

      history: [DEFAULT_SAMPLE_RESULT],
      saveToHistory: (res) => set((state) => ({ history: [res, ...state.history] })),

      runGeneration: async () => {
        const { rawInput, llmConfig, activeProject, saveToHistory, projectImages } = get();
        if (!rawInput.trim()) return;

        set({ isGenerating: true });
        try {
          const result = await generateContentPackage(rawInput, llmConfig, activeProject.id);
          
          // If project has uploaded images, intelligently auto-assign them across slides
          if (projectImages.length > 0) {
            result.slides = result.slides.map((slide, idx) => ({
              ...slide,
              photoUrl: projectImages[idx % projectImages.length],
              photoOpacity: idx === 0 ? 90 : 75,
              textPosition: (idx === 0 ? 'bottom' : (idx % 2 === 0 ? 'bottom' : 'top')) as TextPositionMode,
              elements: undefined,
            }));
          } else {
            result.slides.forEach((s) => {
              delete s.elements;
            });
          }

          set({ currentResult: result, activeSlideIndex: 0 });
          saveToHistory(result);
        } catch (e: any) {
          alert(`Ошибка генерации: ${e.message || e}`);
        } finally {
          set({ isGenerating: false });
        }
      },

      updateSlide: (index, updated) => {
        const { currentResult } = get();
        if (!currentResult) return;
        const newSlides = [...currentResult.slides];
        const oldSlide = newSlides[index];

        const isTextEdited = 
          (updated.headline !== undefined && updated.headline !== oldSlide.headline) ||
          (updated.subheadline !== undefined && updated.subheadline !== oldSlide.subheadline) ||
          (updated.bodyParagraphs !== undefined) ||
          (updated.photoUrl !== undefined) ||
          (updated.textPosition !== undefined);

        const merged = { ...oldSlide, ...updated };
        if (isTextEdited && !updated.elements) {
          delete merged.elements;
        }

        newSlides[index] = merged;
        set({
          currentResult: {
            ...currentResult,
            slides: newSlides,
            updatedAt: new Date().toISOString(),
          }
        });
      },

      addSlide: (index) => {
        const { currentResult, projectImages } = get();
        if (!currentResult) return;
        const insertAt = index !== undefined ? index + 1 : currentResult.slides.length;
        const assignedImg = projectImages.length > 0 ? projectImages[insertAt % projectImages.length] : null;

        const newSlide: SlideItem = {
          id: `slide_${Date.now()}`,
          slideNumber: insertAt + 1,
          type: 'content',
          headline: 'Новый ключевой тезис',
          subheadline: 'Дополнительное пояснение сути',
          bodyParagraphs: ['• Текст первого пункта', '• Текст второго пункта'],
          accentWords: ['ключевой тезис'],
          showArrow: true,
          photoUrl: assignedImg,
          textPosition: 'center',
        };

        const newSlides = [...currentResult.slides];
        newSlides.splice(insertAt, 0, newSlide);

        const reindexed = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
        set({
          currentResult: {
            ...currentResult,
            slides: reindexed,
            updatedAt: new Date().toISOString(),
          },
          activeSlideIndex: insertAt,
        });
      },

      deleteSlide: (index) => {
        const { currentResult, activeSlideIndex } = get();
        if (!currentResult || currentResult.slides.length <= 1) return;

        const newSlides = currentResult.slides.filter((_, idx) => idx !== index);
        const reindexed = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

        const nextIndex = Math.min(activeSlideIndex, reindexed.length - 1);
        set({
          currentResult: {
            ...currentResult,
            slides: reindexed,
            updatedAt: new Date().toISOString(),
          },
          activeSlideIndex: nextIndex >= 0 ? nextIndex : 0,
        });
      },

      updateChannelText: (channel, text) => {
        const { currentResult } = get();
        if (!currentResult) return;
        set({
          currentResult: {
            ...currentResult,
            [channel]: text,
            updatedAt: new Date().toISOString(),
          }
        });
      },
    }),
    {
      name: 'marlex-content-storage-v5',
      // BYOK provider keys are secrets — never persist them to localStorage in plaintext.
      // They stay in memory for the session and must be re-entered after a reload.
      partialize: (state) => ({
        ...state,
        llmConfig: {
          ...state.llmConfig,
          openaiKey: '',
          anthropicKey: '',
          geminiKey: '',
        },
      }),
    }
  )
);
