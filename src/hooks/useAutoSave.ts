import { useState, useEffect, useRef } from "react";

interface UseAutoSaveProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  initialSkip?: boolean;
}

export type AutoSaveStatus = "synced" | "syncing" | "error" | "retrying";

export function useAutoSave<T>({
  data,
  onSave,
  delay = 1000,
  initialSkip = true
}: UseAutoSaveProps<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>("synced");
  const [retryCount, setRetryCount] = useState(0);
  const skipNext = useRef(initialSkip);
  const lastSavedData = useRef<string>(JSON.stringify(data));

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }

    // Evitar disparar si la data no cambió realmente (deep check simple)
    const currentDataStr = JSON.stringify(data);
    if (currentDataStr === lastSavedData.current && status !== "retrying") {
      return;
    }

    const handler = setTimeout(async () => {
      setStatus("syncing");
      try {
        await onSave(data);
        setStatus("synced");
        setRetryCount(0);
        lastSavedData.current = currentDataStr;
      } catch (error) {
        console.error("AutoSave Error:", error);
        if (retryCount < 3) {
          setStatus("retrying");
          setRetryCount(prev => prev + 1);
        } else {
          setStatus("error");
        }
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [data, retryCount, delay, onSave]);

  return {
    status,
    retryCount,
    setStatus,
    setRetryCount
  };
}
