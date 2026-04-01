'use client';

import { useEffect, useState } from 'react';
import { getPersistedValue, setPersistedValue, removePersistedValue } from '@/lib/storage';

function deleteValue(storageType: Storage.Type, key: string) {
  removePersistedValue(storageType, key);
}

export function usePersistedState<T>(storageType: Storage.Type, key: string, initialValue: T) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const val = getPersistedValue(storageType, key, initialValue)
    setState(val);
  }, [])
  
  useEffect(() => {
    setPersistedValue(storageType, key, state);
  }, [key, state]);

  function removeState() {
    deleteValue(storageType, key);
  }

  return [state, setState, removeState] as const;
}
