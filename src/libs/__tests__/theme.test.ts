import { NO_FLASH_THEME_SCRIPT, resolveTheme } from '@/libs/theme';

describe('resolveTheme', () => {
  it('keeps an explicit light or dark preference', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('follows the device for a system preference', () => {
    expect(resolveTheme('system', true)).toBe('light');
    expect(resolveTheme('system', false)).toBe('dark');
  });

  it('falls back to a valid theme for missing or unknown values', () => {
    expect(['light', 'dark']).toContain(resolveTheme(undefined, true));
    expect(['light', 'dark']).toContain(resolveTheme('sepia', false));
  });
});

describe('NO_FLASH_THEME_SCRIPT', () => {
  const run = (stored: string | null, deviceIsLight: boolean) => {
    document.documentElement.className = '';
    window.matchMedia = ((query: string) => ({ matches: deviceIsLight && query.includes('light') })) as typeof window.matchMedia;
    if (stored === null) localStorage.removeItem('auth-storage');
    else localStorage.setItem('auth-storage', JSON.stringify({ state: { activeTheme: stored } }));
    new Function(NO_FLASH_THEME_SCRIPT)();
    return document.documentElement.className;
  };

  it('applies the stored theme before paint', () => {
    expect(run('light', false)).toBe('light');
    expect(run('dark', true)).toBe('dark');
  });

  it('resolves a stored system preference against the device', () => {
    expect(run('system', true)).toBe('light');
    expect(run('system', false)).toBe('dark');
  });

  it('applies the default when nothing is stored and never throws on bad data', () => {
    expect(['light', 'dark']).toContain(run(null, false));
    localStorage.setItem('auth-storage', '{not json');
    document.documentElement.className = '';
    expect(() => new Function(NO_FLASH_THEME_SCRIPT)()).not.toThrow();
  });
});
