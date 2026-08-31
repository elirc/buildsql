// d02_functions_signatures / ex6 - reference solution (author only).

export interface Counter {
  next(): number;
  peek(): number;
  reset(): void;
}

export function makeCounter(start: number = 0): Counter {
  let current = start;
  return {
    next(): number {
      const value = current;
      current += 1;
      return value;
    },
    peek(): number {
      return current;
    },
    reset(): void {
      current = start;
    },
  };
}
