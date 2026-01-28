'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  COLOR_SCHEMES,
  COLOR_TOKEN_DEFINITIONS,
  ColorSchemeName,
  ColorToken,
  isColorToken,
  normalizeColorValue,
} from '../lib/color-schemes';

interface ThemeContextType {
  scheme: ColorSchemeName;
  colors: Record<ColorToken, string>;
  hasOverrides: boolean;
  setScheme: (scheme: ColorSchemeName) => void;
  setColorOverride: (token: ColorToken, value: string) => void;
  resetOverrides: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'ralph-theme';
const THEME_OVERRIDES_KEY = 'ralph-theme-overrides';
const COLOR_SCHEME_VALUES: ColorSchemeName[] = ['light', 'dark', 'msg', 'high-contrast'];

const isColorSchemeName = (value: string): value is ColorSchemeName =>
  COLOR_SCHEME_VALUES.includes(value as ColorSchemeName);

const loadStoredScheme = (): ColorSchemeName => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && isColorSchemeName(stored)) {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const loadStoredOverrides = (): Partial<Record<ColorToken, string>> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(THEME_OVERRIDES_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const overrides: Partial<Record<ColorToken, string>> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!isColorToken(key) || typeof value !== 'string') continue;
      const normalized = normalizeColorValue(value);
      if (normalized) {
        overrides[key] = normalized;
      }
    }
    return overrides;
  } catch {
    return {};
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<ColorSchemeName>(() => loadStoredScheme());
  const [overrides, setOverrides] = useState<Partial<Record<ColorToken, string>>>(() => loadStoredOverrides());

  const colors = useMemo(() => {
    const basePalette = COLOR_SCHEMES[scheme];
    return COLOR_TOKEN_DEFINITIONS.reduce<Record<ColorToken, string>>((acc, { token }) => {
      acc[token] = overrides[token] ?? basePalette[token];
      return acc;
    }, {} as Record<ColorToken, string>);
  }, [scheme, overrides]);

  const hasOverrides = useMemo(() => Object.keys(overrides).length > 0, [overrides]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', scheme);
    for (const { token } of COLOR_TOKEN_DEFINITIONS) {
      root.style.setProperty(`--${token}`, colors[token]);
    }
    localStorage.setItem(THEME_STORAGE_KEY, scheme);
    if (hasOverrides) {
      localStorage.setItem(THEME_OVERRIDES_KEY, JSON.stringify(overrides));
    } else {
      localStorage.removeItem(THEME_OVERRIDES_KEY);
    }
  }, [scheme, colors, overrides, hasOverrides]);

  const setColorOverride = (token: ColorToken, value: string) => {
    const normalized = normalizeColorValue(value);
    if (!normalized) return;
    setOverrides((prev) => {
      const baseValue = COLOR_SCHEMES[scheme][token];
      if (normalized === baseValue) {
        if (!(token in prev)) return prev;
        const next = { ...prev };
        delete next[token];
        return next;
      }
      if (prev[token] === normalized) return prev;
      return { ...prev, [token]: normalized };
    });
  };

  const resetOverrides = () => {
    setOverrides({});
  };

  return (
    <ThemeContext.Provider value={{ scheme, colors, hasOverrides, setScheme, setColorOverride, resetOverrides }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
