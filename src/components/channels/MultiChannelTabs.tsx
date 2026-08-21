import React from 'react';
import { 
  Send, 
  Linkedin, 
  Instagram, 
  MessageSquare, 
  Copy, 
  Check, 
  Share2 
} from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';

export const MultiChannelTabs: React.FC = () => {
  const { currentResult, activeProfile, updateChannelText } = useMarlexStore();
  const [copiedTab, setCopiedTab] = React.useState<string | null>(null);
  const [activeChannel, setActiveChannel] = React.useState<'telegram' | 'linkedin' | 'threads' | 'instagram'>('telegram');

  if (!currentResult) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Сначала сгенерируйте контент в студии карусели.
      </div>
    );
  }

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-6 overflow-hidden">
      {/* Top Channel Select Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveChannel('telegram')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeChannel === 'telegram'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Telegram Канал
          </button>

          <button
            onClick={() => setActiveChannel('linkedin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeChannel === 'linkedin'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            LinkedIn Пост
          </button>

          <button
            onClick={() => setActiveChannel('threads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeChannel === 'threads'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Threads Тред
          </button>
        </div>
      </div>

      {/* Channel Content Body */}
      <div className="flex-1 overflow-y-auto pt-6 max-w-3xl mx-auto w-full">
        {/* TELEGRAM */}
        {activeChannel === 'telegram' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Канал: <b className="text-sky-400">{activeProfile.telegramChannel}</b>
              </span>
              <button
                onClick={() => handleCopy(currentResult.telegramPost || '', 'tg')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs transition-colors shadow"
              >
                {copiedTab === 'tg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTab === 'tg' ? 'Скопировано!' : 'Скопировать текст с Markdown'}
              </button>
            </div>

            {/* Telegram Message Bubble Simulator */}
            <div className="bg-[#182533] border border-[#2b394a] rounded-2xl p-5 shadow-xl text-zinc-100 font-sans text-sm leading-relaxed whitespace-pre-wrap">
              {currentResult.telegramPost || ''}
            </div>

            <textarea
              rows={8}
              value={currentResult.telegramPost || ''}
              onChange={(e) => updateChannelText('telegramPost', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-sky-500/50"
              placeholder="Редактировать текст Telegram..."
            />
          </div>
        )}

        {/* LINKEDIN */}
        {activeChannel === 'linkedin' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Профиль: <b className="text-blue-400">{activeProfile.name}</b>
              </span>
              <button
                onClick={() => handleCopy(currentResult.linkedInPost || '', 'li')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold text-xs transition-colors shadow"
              >
                {copiedTab === 'li' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTab === 'li' ? 'Скопировано!' : 'Скопировать для LinkedIn'}
              </button>
            </div>

            {/* LinkedIn Card Simulator */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-sm">
                  {activeProfile.name ? activeProfile.name[0] : 'U'}
                </div>
                <div>
                  <div className="font-semibold text-zinc-200 text-sm">{activeProfile.name}</div>
                  <div className="text-[11px] text-zinc-400">Tech Entrepreneur & Product Leader</div>
                </div>
              </div>
              <div className="text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap mb-4">
                {currentResult.linkedInPost || ''}
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span>📄 Прикреплен документ: {currentResult.title}_LinkedIn.pdf</span>
                <span className="text-amber-400 font-mono">1080x1350</span>
              </div>
            </div>
          </div>
        )}

        {/* THREADS */}
        {activeChannel === 'threads' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Аккаунт: <b className="text-zinc-200">@{activeProfile.threadsHandle}</b>
              </span>
              <button
                onClick={() => handleCopy((currentResult.threadsPosts || []).join('\n\n---\n\n'), 'threads')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-white text-zinc-950 font-bold text-xs transition-colors shadow"
              >
                {copiedTab === 'threads' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTab === 'threads' ? 'Скопировано!' : 'Скопировать весь тред'}
              </button>
            </div>

            {/* Threads Thread Visualizer */}
            <div className="flex flex-col gap-3">
              {(currentResult.threadsPosts || []).map((post, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3 shadow-md">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                      {idx + 1}
                    </div>
                    {idx < (currentResult.threadsPosts?.length || 0) - 1 && (
                      <div className="w-[1.5px] flex-1 bg-zinc-800 my-1" />
                    )}
                  </div>
                  <div className="flex-1 text-xs text-zinc-200 leading-relaxed pt-1">
                    {post}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
