export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  let timeoutId: ReturnType<Window["setTimeout"]>;
  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  wait = 300
) {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      fn.apply(this, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(this, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  } as T;
}
