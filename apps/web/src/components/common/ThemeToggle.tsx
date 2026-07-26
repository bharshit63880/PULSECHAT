import { MoonStar, SunMedium } from 'lucide-react';

import { useUiStore } from '@/store/ui-store';

export const ThemeToggle = () => {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line/80 bg-white/78 text-muted shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:text-ink dark:bg-slate-950/72"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <SunMedium className="h-4.5 w-4.5" /> : <MoonStar className="h-4.5 w-4.5" />}
    </button>
  );
};
