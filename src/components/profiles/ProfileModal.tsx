import React, { useState } from 'react';
import { X, User, Instagram, Send, Linkedin, Palette, Plus, Check, Trash2, AtSign } from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { ClientProfile } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profiles, activeProfile, setActiveProfile, addProfile, updateProfile, deleteProfile } = useMarlexStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ClientProfile>({ ...activeProfile });

  React.useEffect(() => {
    setFormData({ ...activeProfile });
  }, [activeProfile, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData.id, formData);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newProfile: ClientProfile = {
      id: `profile_${Date.now()}`,
      name: 'Новый клиент / автор',
      instagramHandle: '@brand',
      telegramChannel: 'https://t.me/channel',
      linkedInUrl: 'https://linkedin.com/in/profile',
      threadsHandle: 'brand',
      defaultBgColor: '#9B6140',
      defaultAccentColor: '#D1B852',
      defaultTextColor: '#FFFFFF',
      defaultFont: 'Source Sans 3',
      photoOpacity: 15,
    };
    addProfile(newProfile);
    setActiveProfile(newProfile);
    setFormData(newProfile);
    setIsEditing(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Профиль автора и брендинг</h2>
              <p className="text-[11px] text-zinc-400">Управление подписями на слайдах, никнеймами и палитрой</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Profile Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Активный профиль (Контент-завод)
              </label>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить профиль
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profiles.map((p) => {
                const isActive = p.id === activeProfile.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveProfile(p);
                      setFormData({ ...p });
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: p.defaultBgColor }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate">{p.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono truncate">{p.instagramHandle}</div>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Данные для слайдов</span>
              {profiles.length > 1 && activeProfile.id !== profiles[0].id && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Удалить профиль ${activeProfile.name}?`)) {
                      deleteProfile(activeProfile.id);
                    }
                  }}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Удалить
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Имя автора (футер слайда)</label>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus-within:border-amber-500">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-transparent w-full focus:outline-none"
                    placeholder="Andrew Kupriyanov"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Instagram Никнейм (шапка)</label>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus-within:border-amber-500">
                  <AtSign className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.instagramHandle}
                    onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                    className="bg-transparent w-full focus:outline-none"
                    placeholder="@andrewkupriyanov"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Telegram Канал</label>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus-within:border-amber-500">
                  <Send className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.telegramChannel}
                    onChange={(e) => setFormData({ ...formData, telegramChannel: e.target.value })}
                    className="bg-transparent w-full focus:outline-none"
                    placeholder="https://t.me/andrew"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">LinkedIn URL</label>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus-within:border-amber-500">
                  <Linkedin className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.linkedInUrl}
                    onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                    className="bg-transparent w-full focus:outline-none"
                    placeholder="https://linkedin.com/in/andrew"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="pt-2">
              <label className="text-[11px] text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Фирменные цвета по умолчанию
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.defaultBgColor}
                    onChange={(e) => setFormData({ ...formData, defaultBgColor: e.target.value })}
                    className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-zinc-300">Фон ({formData.defaultBgColor})</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.defaultAccentColor}
                    onChange={(e) => setFormData({ ...formData, defaultAccentColor: e.target.value })}
                    className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-zinc-300">Акцентная плашка ({formData.defaultAccentColor})</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                Сохранить настройки
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
