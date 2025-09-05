'use client';

import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Function to apply theme changes
  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement;
    
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let shouldBeDark = false;
    if (savedTheme) {
      shouldBeDark = savedTheme === 'dark';
    } else {
      shouldBeDark = systemPrefersDark;
    }
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only apply system theme if no manual preference is saved
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    if (!mounted) return;
    
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Dispatch custom event for other components that might need to know
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { isDark: newTheme } 
    }));
  }, [isDark, mounted, applyTheme]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    if (!mounted) return;
    
    let shouldBeDark = false;
    
    if (theme === 'system') {
      localStorage.removeItem('theme');
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      localStorage.setItem('theme', theme);
      shouldBeDark = theme === 'dark';
    }
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
    
    window.dispatchEvent(new CustomEvent('theme-change', { 
      detail: { isDark: shouldBeDark, theme } 
    }));
  }, [mounted, applyTheme]);

  return { 
    isDark, 
    toggleTheme, 
    setTheme,
    mounted,
    theme: mounted ? (localStorage.getItem('theme') || 'system') as 'light' | 'dark' | 'system' : 'system'
  };
};