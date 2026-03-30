declare global {
  namespace Storage {
    type Type = 'local' | 'session';
  }
}

function getStorage(type: Storage.Type) {
  if (typeof window === 'undefined') return null;
  return type === 'local' ? localStorage : sessionStorage;
}

export function getPersistedValue<T>(storageType: Storage.Type, key: string, initialValue: T): T {
  const storage = getStorage(storageType);
  if (!storage) return initialValue;

  try {
    const stored = storage.getItem(key);
    return stored !== null ? JSON.parse(stored) : initialValue;
  } catch {
    return initialValue;
  }
}

export function setPersistedValue<T>(storageType: Storage.Type, key: string, value: T) {
  const storage = getStorage(storageType);
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removePersistedValue<T>(storageType: Storage.Type, key: string) {
  const storage = getStorage(storageType);
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {}
}
