import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storageService.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storageService.set(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const item = storageService.get<T>(key);
    if (item !== null) {
      setStoredValue(item);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}
