'use client';

import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        background: 'transparent',
        border: '1px solid var(--card-border)',
        borderRadius: '4px',
        padding: '0.4rem 0.6rem',
        cursor: 'pointer',
        fontSize: '1rem',
        color: 'var(--foreground)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.2s ease',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
