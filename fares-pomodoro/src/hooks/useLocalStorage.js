import { useEffect, useState } from 'react';

const PREFIX = 'fares-pomodoro:';

// useState that persists to localStorage (JSON). Fails silently if storage
// is unavailable or full (e.g. a very large uploaded photo).
export function useLocalStorage(key, initialValue) {
  const storageKey = PREFIX + key;

  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      /* ignore corrupt or unavailable storage */
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* quota exceeded or storage disabled */
    }
  }, [storageKey, value]);

  return [value, setValue];
}
