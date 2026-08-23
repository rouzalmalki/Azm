import { useState, useEffect, useCallback } from "react";

// Custom event name for same-tab sync
const STORAGE_EVENT = "azm:localstorage-change";

function readFromStorage<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readFromStorage(key, initialValue)
  );

  // Listen for changes from OTHER instances using the same key
  useEffect(() => {
    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (detail?.key === key) {
        setStoredValue(readFromStorage(key, initialValue));
      }
    };
    // Cross-tab sync (native storage event)
    const handleNative = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(readFromStorage(key, initialValue));
      }
    };
    window.addEventListener(STORAGE_EVENT, handleCustom);
    window.addEventListener("storage", handleNative);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleCustom);
      window.removeEventListener("storage", handleNative);
    };
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Notify all other hooks in the same tab
          window.dispatchEvent(
            new CustomEvent(STORAGE_EVENT, { detail: { key } })
          );
          return valueToStore;
        });
      } catch (error) {
        console.error("useLocalStorage error:", error);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
