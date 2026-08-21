import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Marlex App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-zinc-950 text-zinc-100 p-8 text-center select-none font-sans">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xl mb-4">
            !
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Произошла ошибка при загрузке</h1>
          <p className="text-xs text-zinc-400 max-w-md font-mono bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-6 text-left overflow-auto max-h-40">
            {this.state.error?.message || 'Неизвестная ошибка интерфейса'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('marlex-storage');
                window.location.reload();
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Сбросить кэш и обновить
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
