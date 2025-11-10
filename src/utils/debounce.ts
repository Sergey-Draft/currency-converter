/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce(func: (...args: any[]) => any, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
