'use client';

import type { ChangeEvent } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextTheme = event.target.value === 'dark' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
      }}
    >
      <span>Farbschema</span>
      <select
        data-testid="theme-menu"
        aria-label="Farbschema auswählen"
        value={theme}
        onChange={handleThemeChange}
        style={{
          backgroundColor: 'var(--input-background)',
          color: 'var(--foreground)',
          border: '1px solid var(--card-border)',
          borderRadius: '4px',
          padding: '0.35rem 0.5rem',
          cursor: 'pointer',
          fontSize: '0.75rem',
        }}
      >
        <option value="light">Hell</option>
        <option value="dark">Dunkel</option>
      </select>
    </label>
  );
}
