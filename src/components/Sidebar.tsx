import React, { useState } from 'react';
import { CategoryItem } from '../types';
import {
  Compass,
  TrendingUp,
  Building2,
  Scale,
  Landmark,
  ScrollText,
  Users,
  Briefcase,
  Globe,
  MessageSquareText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  BookOpen,
  Network,
} from 'lucide-react';

interface SidebarProps {
  categories: CategoryItem[];
  activePath: string;
  onSelectDoc: (path: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  currentView: 'reader' | 'graph';
  onToggleView: (view: 'reader' | 'graph') => void;
}

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Compass,
  TrendingUp,
  Building2,
  Scale,
  Landmark,
  ScrollText,
  Users,
  Briefcase,
  Globe,
  MessageSquareText,
  BarChart3,
  Folder,
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activePath,
  onSelectDoc,
  isOpen,
  onCloseMobile,
  currentView,
  onToggleView,
}) => {
  // Keep all categories open by default or track open states
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initial[cat.key] = true;
    });
    return initial;
  });

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-30 w-72 lg:w-64 xl:w-72 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-y-auto transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* View Switcher: Leitor / Grafo */}
        <div className="sticky top-0 z-20 p-3 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs font-medium gap-1">
            <button
              onClick={() => {
                onToggleView('reader');
                onCloseMobile();
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                currentView === 'reader'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <BookOpen size={13} />
              <span>Leitor</span>
            </button>
            <button
              onClick={() => {
                onToggleView('graph');
                onCloseMobile();
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                currentView === 'graph'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Network size={13} />
              <span>Grafo</span>
            </button>
          </div>
        </div>

        <div className="p-4 pt-3 space-y-6">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Folder;
            const isCategoryOpen = openCategories[cat.key] !== false;

            return (
              <div key={cat.key} className="space-y-1">
                <button
                  onClick={() => toggleCategory(cat.key)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider py-1 px-1 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Icon size={14} className="text-zinc-400 dark:text-zinc-500" />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="text-zinc-400">
                    {isCategoryOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </span>
                </button>

                {isCategoryOpen && (
                  <div className="space-y-0.5 pt-1 pl-2 border-l border-border-light/60 dark:border-border-dark/60 ml-2">
                    {cat.documents.map((doc) => {
                      const isActive = activePath === doc.path;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => {
                            onSelectDoc(doc.path);
                            onCloseMobile();
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between group ${
                            isActive
                              ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-medium'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate flex-1 pr-2">{doc.title}</span>
                          <span className="text-[10px] text-zinc-400 opacity-60 group-hover:opacity-100 font-mono shrink-0">
                            {doc.readTimeMinutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
