// d16_infer_patterns / ex6 - reference solution (author only).

export type StateOf<T> = T extends {
  subscribe(listener: (state: infer S) => void): unknown;
}
  ? S
  : never;
