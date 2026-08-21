import React, { useState } from 'react';
import { Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { signIn, signUp } from '../../lib/auth-client';

interface AuthScreenProps {
  onSuccess: () => void;
  onOfflineContinue?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onOfflineContinue }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn.email({
          email,
          password,
        });

        if (res.error) {
          setError(res.error.message || 'Ошибка входа. Проверьте email и пароль.');
        } else {
          onSuccess();
        }
      } else {
        if (!name.trim()) {
          setError('Пожалуйста, укажите ваше имя');
          setLoading(false);
          return;
        }

        const res = await signUp.email({
          email,
          password,
          name,
        });

        if (res.error) {
          setError(res.error.message || 'Ошибка регистрации. Попробуйте другой email.');
        } else {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось связаться с сервером авторизации.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4 font-sans select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="./icon.svg" alt="Marlex Logo" className="w-16 h-16 rounded-2xl shadow-xl shadow-amber-500/20 mb-4" />
          <h1 className="text-2xl font-black tracking-tight text-white">MARLEX</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Автономный Контент-Завод & Студия Каруселей
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              isLogin ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !isLogin ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Имя пользователя</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-zinc-500 absolute left-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Мария Широкова"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Пароль</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Обработка...</span>
            ) : isLogin ? (
              <>
                <span>Войти в Marlex</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Создать аккаунт</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Offline / Local mode continue */}
        {onOfflineContinue && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onOfflineContinue}
              className="text-xs text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer py-1 underline underline-offset-4"
            >
              Продолжить локально (без синхронизации) →
            </button>
          </div>
        )}

        {/* Supabase Security Badge */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Безопасная авторизация Better Auth & Supabase</span>
        </div>
      </div>
    </div>
  );
};
