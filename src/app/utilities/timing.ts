
// Debounce without `any`
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 200) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Throttle without `any`
export function throttle<T extends (...args: unknown[]) => void>(fn: T, interval = 200) {
  let last = 0;
  let pending: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = interval - (now - last);
    if (remaining <= 0) {
      if (pending) { clearTimeout(pending); pending = null; }
      last = now;
      fn(...args);
    } else if (!pending) {
      pending = setTimeout(() => {
        last = Date.now();
        pending = null;
        fn(...args);
      }, remaining);
    }
  };
}
