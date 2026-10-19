import React from 'react';
import { Search, Moon, Sun, Menu, X, Github, BookOpen } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenSearch,
  onToggleSidebar,
  isSidebarOpen,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-surface-light/85 dark:bg-surface-dark/85 border-b border-border-light dark:border-border-dark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            aria-label="Abrir menu"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-80"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-tight">
              BR
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Brasil Project
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                v1.0
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search trigger */}
        <div className="flex-1 max-w-md mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-400 transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Search size={14} />
              <span className="truncate">Pesquisar documentos, dados e leis...</span>
            </span>
            <kbd className="hidden sm:flex items-center gap-0.5 font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border-light dark:border-border-dark bg-white dark:bg-zinc-800 text-zinc-400">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a
            href="https://github.com/fregrod/brasil-project"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Ver no GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </header>
  );
};
