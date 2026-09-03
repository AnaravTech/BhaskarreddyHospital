/**
 * Local & Session Storage Service
 * Provides type-safe, resilient persistence for user sessions, themes, and hospital state.
 */

const STORAGE_PREFIX = 'bhaskar_hospital_';

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[Storage] Failed to read key "${key}":`, err);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[Storage] Failed to save key "${key}":`, err);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    } catch (err) {
      console.error(`[Storage] Failed to remove key "${key}":`, err);
      return false;
    }
  },

  clear: () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
      return true;
    } catch (err) {
      console.error('[Storage] Failed to clear hospital keys:', err);
      return false;
    }
  },
};

// Convenience helpers
export const getStoredSession = () => storage.get('auth_session', null);
export const setStoredSession = (user) => storage.set('auth_session', user);
export const removeStoredSession = () => storage.remove('auth_session');

export const getStoredTheme = (defaultTheme = 'light-classic') =>
  storage.get('theme', defaultTheme);
export const setStoredTheme = (themeId) => storage.set('theme', themeId);

export default storage;
