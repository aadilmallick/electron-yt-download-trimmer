import { useEffect, useRef, useCallback } from "react";

function useInterval(interval = 1000) {
  const savedCallback = useRef<() => void>();
  const intervalId = useRef(null);

  const startInterval = useCallback(
    (callback: () => void) => {
      // Only start if no interval is currently running
      savedCallback.current = callback;
      if (intervalId.current === null) {
        intervalId.current = setInterval(() => {
          savedCallback.current();
        }, interval);
      }
    },
    [interval]
  );

  const stopInterval = useCallback(() => {
    // Clear the interval if it exists
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  // Clear interval on component unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { startInterval, stopInterval };
}

export default useInterval;
