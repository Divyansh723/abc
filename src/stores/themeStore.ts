import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      
      setTheme: (theme: Theme) => {
        set({ theme });
        updateTheme(theme);
      },
      
      toggleTheme: () => {
        const { theme } = get();
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(nextTheme);
      },
      
      initializeTheme: () => {
        const { theme } = get();
        updateTheme(theme);
      },
    }),
    {
      name: 'habitforge-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

const updateTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  
  // Update DOM classes
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
  }
};