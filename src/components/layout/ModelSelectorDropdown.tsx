import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Terminal, 
  Key, 
  Settings, 
  Check, 
  Sparkles, 
  Cpu,
  Laptop
} from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { CLIAgent, ExecutionMode } from '../../types';

interface ModelSelectorDropdownProps {
  onOpenExecutionSettings: () => void;
}

export const ModelSelectorDropdown: React.FC<ModelSelectorDropdownProps> = ({
  onOpenExecutionSettings,
}) => {
  const { llmConfig, setLLMConfig } = useMarlexStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [detectedCLIs, setDetectedCLIs] = useState<Record<string, boolean>>({
    chatgpt: true,
    claude_code: true,
    gemini_cli: true,
    ollama: true,
  });

  useEffect(() => {
    if (window.electronAPI?.detectCLIs) {
      window.electronAPI.detectCLIs().then((clis) => {
        setDetectedCLIs(clis);
      });
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const agents: { id: CLIAgent; name: string; icon: string; desc: string }[] = [
    { id: 'chatgpt', name: 'ChatGPT', icon: '❇️', desc: 'ChatGPT Plus / Mac App' },
    { id: 'claude_code', name: 'Claude Code', icon: '🦀', desc: 'Anthropic Pro/Team' },
    { id: 'gemini_cli', name: 'Gemini CLI', icon: '🔷', desc: 'Google Gemini' },
    { id: 'ollama', name: 'Ollama', icon: '🦙', desc: 'Local Apple Silicon' },
  ];

  const currentAgent = agents.find((a) => a.id === llmConfig.cliAgent) || agents[0];

  return (
    <div className="relative app-no-drag" ref={dropdownRef}>
      {/* Header Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-xs font-medium transition-all cursor-pointer text-zinc-200 shadow-sm"
      >
        <span className="text-xs">{llmConfig.mode === 'local_cli' ? currentAgent.icon : '🔑'}</span>
        <span className="font-semibold text-zinc-200">
          {llmConfig.mode === 'local_cli' ? currentAgent.name : llmConfig.provider}
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
          {/* 1. MODE: Local CLI vs BYOK */}
          <div className="flex flex-col gap-2 mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              РЕЖИМ АВТОРИЗАЦИИ
            </span>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setLLMConfig({ mode: 'local_cli' })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  llmConfig.mode === 'local_cli'
                    ? 'bg-zinc-800 text-amber-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Подписки Mac
              </button>
              <button
                onClick={() => setLLMConfig({ mode: 'byok' })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  llmConfig.mode === 'byok'
                    ? 'bg-zinc-800 text-blue-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                BYOK (API Key)
              </button>
            </div>
          </div>

          {/* 2. AGENT SELECTION */}
          {llmConfig.mode === 'local_cli' ? (
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  ПРИЛОЖЕНИЯ / АГЕНТЫ
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  без API ключей
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent) => {
                  const isSelected = llmConfig.cliAgent === agent.id;
                  const isDetected = detectedCLIs[agent.id] ?? false;

                  return (
                    <button
                      key={agent.id}
                      onClick={() => setLLMConfig({ cliAgent: agent.id })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-base">{agent.icon}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold truncate">{agent.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {isDetected ? '● установлен' : 'app'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                API PROVIDER
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'openai', name: 'OpenAI' },
                  { id: 'anthropic', name: 'Claude' },
                  { id: 'gemini', name: 'Gemini' },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    onClick={() => setLLMConfig({ provider: prov.id as any })}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
          )}

          {/* 3. MODEL SELECTOR */}
          <div className="flex flex-col gap-1.5 mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              МОДЕЛЬ
            </span>
            <select
              value={llmConfig.mode === 'local_cli' ? llmConfig.cliModel || 'default' : llmConfig.model}
              onChange={(e) => {
                if (llmConfig.mode === 'local_cli') {
                  setLLMConfig({ cliModel: e.target.value });
                } else {
                  setLLMConfig({ model: e.target.value });
                }
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="default">Default (Использовать настройки подписки)</option>
              <option value="gpt-4o">GPT-4o (ChatGPT Plus)</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="llama3.2">Ollama: Llama 3.2</option>
            </select>
          </div>

          {/* 4. OPEN EXECUTION SETTINGS */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenExecutionSettings();
            }}
            className="w-full pt-3 border-t border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Настройки AI и подписок Mac</span>
          </button>
        </div>
      )}
    </div>
  );
};
