'use client';

import type { ChangeEvent } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { COLOR_SCHEME_OPTIONS, COLOR_TOKEN_DEFINITIONS, ColorSchemeName, ColorToken } from '../lib/color-schemes';

export function ThemeToggle() {
  const { scheme, colors, hasOverrides, setScheme, setColorOverride, resetOverrides } = useTheme();

  const handleSchemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setScheme(event.target.value as ColorSchemeName);
  };

  const handleColorChange = (token: ColorToken) => (event: ChangeEvent<HTMLInputElement>) => {
    setColorOverride(token, event.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
        }}
      >
        <span>Farbschema</span>
        <select
          data-testid="theme-menu"
          aria-label="Farbschema auswählen"
          value={scheme}
          onChange={handleSchemeChange}
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
          {COLOR_SCHEME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <details
        style={{
          border: '1px solid var(--card-border)',
          borderRadius: '6px',
          padding: '0.35rem 0.5rem',
          backgroundColor: 'var(--form-background)',
          maxWidth: '520px',
        }}
      >
        <summary
          data-testid="color-customization-summary"
          style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
        >
          Farben bearbeiten
        </summary>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}
        >
          {COLOR_TOKEN_DEFINITIONS.map(({ token, label }) => (
            <label
              key={token}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <input
                  type="color"
                  data-testid={`color-picker-${token}`}
                  aria-label={`${label} Farbe`}
                  value={colors[token]}
                  onChange={handleColorChange(token)}
                  style={{ width: '36px', height: '28px', border: 'none', background: 'transparent', padding: 0 }}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {colors[token].toUpperCase()}
                </span>
              </div>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            data-testid="reset-color-overrides"
            onClick={resetOverrides}
            disabled={!hasOverrides}
            style={{
              borderRadius: '999px',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--input-background)',
              color: 'var(--foreground)',
              padding: '0.25rem 0.65rem',
              cursor: hasOverrides ? 'pointer' : 'not-allowed',
              fontSize: '0.7rem',
              opacity: hasOverrides ? 1 : 0.6,
            }}
          >
            Zurücksetzen
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            Farben werden im Browser gespeichert.
          </span>
        </div>
      </details>
    </div>
  );
}
