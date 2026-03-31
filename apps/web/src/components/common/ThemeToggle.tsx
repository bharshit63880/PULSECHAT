import { MoonStar, SunMedium } from 'lucide-react';

import { useUiStore } from '@/store/ui-store';

export const ThemeToggle = () => {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-muted transition hover:text-ink"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
};
