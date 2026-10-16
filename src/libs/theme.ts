export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

// New visitors follow the device. A saved preference (chosen in onboarding or Settings) wins.
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export const THEME_META_COLOR: Record<Theme, string> = {
  light: '#F6F7F9',
  dark: '#0B0F14',
};

export const AUTH_STORAGE_KEY = 'auth-storage';

export function resolveTheme(preference: string | null | undefined, deviceIsLight: boolean): Theme {
  if (preference === 'light' || preference === 'dark') return preference;
  if (preference === 'system') return deviceIsLight ? 'light' : 'dark';
  return resolveFallback(deviceIsLight);
}

// What an unknown or missing preference resolves to.
function resolveFallback(deviceIsLight: boolean): Theme {
  const fallback: ThemePreference = DEFAULT_THEME_PREFERENCE;
  return fallback === 'system' ? (deviceIsLight ? 'light' : 'dark') : fallback;
}

export const FALLBACK_THEME: Theme = resolveFallback(false);

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);

  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.removeAttribute('media');
    meta.content = THEME_META_COLOR[theme];
  });
}

// Runs in <head> before first paint so the page never flashes the wrong theme. It must stay
// self-contained and mirror resolveTheme/applyTheme, because it executes without the bundle.
export const NO_FLASH_THEME_SCRIPT = `(function(){try{
var pref=${JSON.stringify(DEFAULT_THEME_PREFERENCE)};
var raw=localStorage.getItem(${JSON.stringify(AUTH_STORAGE_KEY)});
if(raw){var s=JSON.parse(raw).state;if(s&&s.activeTheme)pref=s.activeTheme}
var light=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches;
var theme=pref==='light'||pref==='dark'?pref:pref==='system'?(light?'light':'dark'):${JSON.stringify(FALLBACK_THEME)};
var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(theme);
}catch(e){}})();`;
