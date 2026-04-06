import { useSyncExternalStore } from 'react';
import { getPersistedValue, setPersistedValue, removePersistedValue } from '@/lib/storage';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function usePersistedState<T>(storageType: Storage.Type, key: string, initialValue: T) {
  const state = useSyncExternalStore(
    subscribe,
    () => getPersistedValue(storageType, key, initialValue),
    () => initialValue,
  );

  function setState(value: T) {
    setPersistedValue(storageType, key, value);
  }

  function removeState() {
    removePersistedValue(storageType, key);
  }

  return [state, setState, removeState] as const;
}
