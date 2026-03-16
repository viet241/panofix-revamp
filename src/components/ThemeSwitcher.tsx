import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Theme } from '../types';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => (
  <div className="bg-neutral-100 dark:bg-neutral-900/50 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-black/5 dark:border-white/5 flex gap-0.5 md:gap-1">
    {(['light', 'dark', 'system'] as Theme[]).map((t) => (
      <button
        key={t}
        type="button"
        onClick={() => setTheme(t)}
        className={`
          p-1.5 md:p-2 rounded-md md:rounded-lg flex items-center justify-center transition-all
          ${theme === t 
            ? 'bg-orange-500 text-white shadow-sm md:shadow-lg' 
            : 'text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'}
        `}
        title={`${t.charAt(0).toUpperCase() + t.slice(1)} Mode`}
      >
        {t === 'light' && <Sun className="w-3 h-3 md:w-4 md:h-4" />}
        {t === 'dark' && <Moon className="w-3 h-3 md:w-4 md:h-4" />}
        {t === 'system' && <Monitor className="w-3 h-3 md:w-4 md:h-4" />}
      </button>
    ))}
  </div>
);
