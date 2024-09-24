import React from "react";

const useInterval = (intervalInSeconds: number) => {
  const [intervalId, setIntervalId] = React.useState<number | null>(null);

  const startInterval = React.useCallback(
    (callback: () => void) => {
      stopInterval();
      const id = window.setInterval(() => {
        callback();
      }, intervalInSeconds * 1000);
      setIntervalId(id);
    },
    [intervalInSeconds]
  );

  const stopInterval = React.useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  return { startInterval, stopInterval };
};

export default useInterval;
