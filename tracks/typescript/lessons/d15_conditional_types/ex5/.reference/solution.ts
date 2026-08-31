// d15_conditional_types / ex5 - reference solution (author only).

export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends bigint
      ? bigint
      : T extends boolean
        ? boolean
        : T;
