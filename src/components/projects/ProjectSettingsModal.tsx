import React, { useState } from 'react';
import { 
  X, 
  FolderGit2, 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Check, 
  Palette, 
  AtSign, 
  User, 
  Plus,
  Mail,
  Crown,
  Edit3,
  Eye,
  Sparkles
} from 'lucide-react';
import { useMarlexStore } from '../../lib/store/useMarlexStore';
import { MarlexProject, ProjectMember, ProjectMemberRole } from '../../types';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    projects, 
    activeProject, 
    setActiveProject, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useMarlexStore();

  const [activeTab, setActiveTab] = useState<'general' | 'team'>('general');
  const [formData, setFormData] = useState<MarlexProject>({ ...activeProject });

  // Invite new member form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectMemberRole>('editor');

  React.useEffect(() => {
    setFormData({ ...activeProject });
  }, [activeProject, isOpen]);

  if (!isOpen) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(formData.id, formData);
    onClose();
  };

  const handleCreateProject = () => {
    const newProj: MarlexProject = {
      id: `proj_${Date.now()}`,
      name: 'Новый проект',
      brandHandle: '@brand',
      authorName: activeProject.authorName || 'Автор',
      bgColor: '#9B6140',
      accentColor: '#D1B852',
      textColor: '#FFFFFF',
      font: 'Source Sans 3',
      photoOpacity: 15,
      members: [
        {
          id: `mem_${Date.now()}`,
          name: activeProject.authorName || 'Вы (Владелец)',
          email: activeProject.members[0]?.email || 'owner@marlex.ai',
          role: 'owner',
          status: 'active'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProject(newProj);
    setActiveProject(newProj);
    setFormData(newProj);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: ProjectMember = {
      id: `member_${Date.now()}`,
      email: inviteEmail.trim(),
      name: inviteName.trim() || inviteEmail.split('@')[0],
      role: inviteRole,
      status: 'active',
    };

    const updatedMembers = [...(formData.members || []), newMember];
    const updated = { ...formData, members: updatedMembers };
    setFormData(updated);
    updateProject(formData.id, { members: updatedMembers });

    setInviteEmail('');
    setInviteName('');
    setInviteRole('editor');
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = formData.members.filter((m) => m.id !== memberId);
    const updated = { ...formData, members: updatedMembers };
    setFormData(updated);
    updateProject(formData.id, { members: updatedMembers });
  };

  const handleChangeMemberRole = (memberId: string, newRole: ProjectMemberRole) => {
    const updatedMembers = formData.members.map((m) => m.id === memberId ? { ...m, role: newRole } : m);
    const updated = { ...formData, members: updatedMembers };
    setFormData(updated);
    updateProject(formData.id, { members: updatedMembers });
  };

  const getRoleBadge = (role: ProjectMemberRole) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Crown className="w-3 h-3" /> Владелец
          </span>
        );
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Edit3 className="w-3 h-3" /> Редактор
          </span>
        );
      case 'designer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Palette className="w-3 h-3" /> Дизайнер
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
            <Eye className="w-3 h-3" /> Наблюдатель
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                Настройки проекта
                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 font-normal rounded-md">
                  {formData.name}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">Управление параметрами проекта и доступом команды</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Switcher Bar */}
        <div className="px-6 py-3 bg-zinc-950/40 border-b border-zinc-800/80 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-zinc-400 mr-1 shrink-0 font-medium">Проекты:</span>
            {projects.map((p) => {
              const isActive = p.id === activeProject.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProject(p);
                    setFormData({ ...p });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.bgColor || '#9B6140' }}
                  />
                  <span className="truncate max-w-[130px]">{p.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCreateProject}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-medium shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Новый проект
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-zinc-800 bg-zinc-900">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'general'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" /> Основные настройки
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'team'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Команда и доступ ({formData.members?.length || 1})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: General Project Settings */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Название проекта</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="Например: Marlex Content Factory"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Никнейм / Бренд в шапке слайда</label>
                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus-within:border-amber-500">
                    <AtSign className="w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={formData.brandHandle}
                      onChange={(e) => setFormData({ ...formData, brandHandle: e.target.value })}
                      className="bg-transparent w-full focus:outline-none"
                      placeholder="@andrewkupriyanov или @company"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Имя автора / Спикера (в футере слайда)</label>
                <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus-within:border-amber-500">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="bg-transparent w-full focus:outline-none"
                    placeholder="Andrew Kupriyanov"
                  />
                </div>
              </div>

              {/* Color Scheme */}
              <div className="pt-3 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" /> Цветовая гамма проекта
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Фон слайдов</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{formData.bgColor}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Акцентная плашка</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{formData.accentColor}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Удалить проект «${formData.name}»?`)) {
                        deleteProject(formData.id);
                        onClose();
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Удалить проект
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
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
                    Сохранить проект
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Team Members & Collaboration */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  Добавить участника в проект
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Имя коллеги"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Email адрес"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1 flex gap-2">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="editor">Редактор (Editor)</option>
                      <option value="designer">Дизайнер (Designer)</option>
                      <option value="viewer">Наблюдатель (Viewer)</option>
                      <option value="owner">Владелец (Owner)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Пригласить в команду
                  </button>
                </div>
              </form>

              {/* Members List */}
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Участники проекта ({formData.members?.length || 0})
                </div>

                <div className="space-y-2">
                  {formData.members && formData.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {member.name ? member.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
                            <span className="truncate">{member.name}</span>
                            {getRoleBadge(member.role)}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono truncate">{member.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {member.role !== 'owner' && (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeMemberRole(member.id, e.target.value as any)}
                              className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 rounded-md px-2 py-1 focus:outline-none"
                            >
                              <option value="editor">Редактор</option>
                              <option value="designer">Дизайнер</option>
                              <option value="viewer">Наблюдатель</option>
                              <option value="owner">Владелец</option>
                            </select>

                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Удалить из проекта"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
