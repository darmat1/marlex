import React, { useEffect, useState } from 'react';
import { 
  X, 
  Terminal, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Key, 
  CheckCircle2, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { CLIAgent } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { llmConfig, setLLMConfig } = useMarlexStore();
  const [detectedCLIs, setDetectedCLIs] = useState<Record<string, boolean>>({
    chatgpt: true,
    claude_code: true,
    gemini_cli: true,
    ollama: true,
    opencode: true,
  });

  useEffect(() => {
    if (window.electronAPI?.detectCLIs) {
      window.electronAPI.detectCLIs().then((clis) => {
        setDetectedCLIs(clis);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cliAgents: { 
    id: CLIAgent; 
    name: string; 
    icon: string; 
    path: string; 
    desc: string; 
    authInfo: string;
  }[] = [
    { 
      id: 'chatgpt', 
      name: 'Codex / ChatGPT (OpenAI)', 
      icon: '❇️', 
      path: 'Codex IDE / ChatGPT App',
      desc: 'Официальный агент Codex / ChatGPT',
      authInfo: 'Использует вашу активную авторизацию Codex / ChatGPT на Mac без ввода API-ключей'
    },
    { 
      id: 'claude_code', 
      name: 'Claude Code', 
      icon: '🦀', 
      path: '/Users/andrew/.local/bin/claude',
      desc: 'Авторизованный CLI от Anthropic',
      authInfo: 'Использует вашу активную подписку Anthropic (Claude Pro/Team) на Mac без API ключей'
    },
    { 
      id: 'gemini_cli', 
      name: 'Gemini CLI', 
      icon: '🔷', 
      path: '/usr/local/bin/gemini',
      desc: 'Google Gemini CLI на Mac',
      authInfo: 'Использует авторизацию Google Cloud / Gemini CLI без ввода ключей'
    },
    { 
      id: 'ollama', 
      name: 'Ollama Local', 
      icon: '🦙', 
      path: '/usr/local/bin/ollama',
      desc: 'Локальные модели на чипе Apple Silicon',
      authInfo: 'Локальный запуск Llama 3.2 / Qwen без интернета'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Настройки AI Агентов и Подписок Mac
              </h2>
              <p className="text-[11px] text-zinc-400">Codex / ChatGPT, Claude Code, Gemini CLI, Ollama (без API-ключей)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          
          {/* Mode Switcher */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Режим работы
            </label>
            <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
              <button
                onClick={() => setLLMConfig({ mode: 'local_cli' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  llmConfig.mode === 'local_cli'
                    ? 'bg-zinc-800 text-amber-400 shadow-md border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Подписки Mac (Codex / Claude / Gemini)
              </button>
              <button
                onClick={() => setLLMConfig({ mode: 'byok' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  llmConfig.mode === 'byok'
                    ? 'bg-zinc-800 text-blue-400 shadow-md border border-blue-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                BYOK (Прямой ввод API-ключа)
              </button>
            </div>
          </div>

          {/* LOCAL CLI SECTION */}
          {llmConfig.mode === 'local_cli' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">
                  Выберите приложение / агент на Mac:
                </label>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  Авторизация подписок активна
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {cliAgents.map((agent) => {
                  const isSelected = llmConfig.cliAgent === agent.id;
                  const isDetected = detectedCLIs[agent.id] ?? true;

                  return (
                    <div
                      key={agent.id}
                      onClick={() => setLLMConfig({ cliAgent: agent.id })}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{agent.icon}</span>
                          <div>
                            <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                              {agent.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 block font-mono">
                              {agent.path}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDetected ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                              ● Установлен
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-mono">
                              не найден
                            </span>
                          )}
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/50">
                        ✨ {agent.authInfo}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* CLI Model Profile */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Конфигурация модели
                </label>
                <select
                  value={llmConfig.cliModel || 'default'}
                  onChange={(e) => setLLMConfig({ cliModel: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="default">Default (Использовать настройки подписки)</option>
                  <option value="gpt-4o">GPT-4o / Codex</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="llama3.2">Ollama: Llama 3.2</option>
                </select>
              </div>
            </div>
          ) : (
            /* BYOK SECTION */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-300">
                  Провайдер API:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'openai', name: 'OpenAI GPT-4o' },
                    { id: 'anthropic', name: 'Anthropic Claude' },
                    { id: 'gemini', name: 'Google Gemini' },
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      onClick={() => setLLMConfig({ provider: prov.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        llmConfig.provider === prov.id
                          ? 'bg-blue-500/10 border-blue-500/60 text-blue-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {prov.name}
                    </button>
                  ))}
                </div>
              </div>

              {llmConfig.provider === 'openai' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">OpenAI API Key (sk-proj-...)</label>
                  <input
                    type="password"
                    value={llmConfig.openaiKey || ''}
                    onChange={(e) => setLLMConfig({ openaiKey: e.target.value })}
                    placeholder="sk-proj-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {llmConfig.provider === 'anthropic' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Anthropic API Key (sk-ant-...)</label>
                  <input
                    type="password"
                    value={llmConfig.anthropicKey || ''}
                    onChange={(e) => setLLMConfig({ anthropicKey: e.target.value })}
                    placeholder="sk-ant-api03-..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {llmConfig.provider === 'gemini' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Gemini API Key (AIzaSy...)</label>
                  <input
                    type="password"
                    value={llmConfig.geminiKey || ''}
                    onChange={(e) => setLLMConfig({ geminiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Подписки Codex / ChatGPT, Claude и Gemini подключены</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md shadow-amber-500/10"
          >
            Готово
          </button>
        </div>

      </div>
    </div>
  );
};
