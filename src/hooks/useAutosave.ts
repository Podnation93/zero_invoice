import { useEffect, useRef } from 'react';

interface UseAutosaveOptions {
  data: any;
  onSave: (data: any) => void;
  interval?: number;
  enabled?: boolean;
}

export function useAutosave({
  data,
  onSave,
  interval = 3000,
  enabled = true,
}: UseAutosaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousDataRef = useRef(data);

  useEffect(() => {
    if (!enabled) return;

    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onSave(data);
        previousDataRef.current = data;
      }, interval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, interval, enabled]);
}
