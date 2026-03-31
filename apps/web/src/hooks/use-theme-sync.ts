import { useEffect } from 'react';

import { useUiStore } from '@/store/ui-store';

export const useThemeSync = () => {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
};
