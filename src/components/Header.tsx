import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Theme } from '../types';

import { HelpCircle } from 'lucide-react';

interface HeaderProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, onOpenHelp }) => {
  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A] z-50 transition-colors duration-300">
      <div className="flex flex-col">
        <h1 className="text-sm md:text-base font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">PanoFix</h1>
        <p className="text-[7px] md:text-[8px] text-neutral-500 uppercase tracking-widest hidden sm:block">Instant 360° metadata</p>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onOpenHelp}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors text-neutral-500 hover:text-orange-500"
          title="How to use"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
};
