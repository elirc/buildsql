// d15_conditional_types / ex4 - reference solution (author only).

export type Kind<T> = T extends null
  ? "null"
  : T extends undefined
    ? "undefined"
    : T extends readonly unknown[]
      ? "array"
      : T extends string
        ? "string"
        : T extends number
          ? "number"
          : T extends boolean
            ? "boolean"
            : T extends bigint
              ? "bigint"
              : T extends object
                ? "object"
                : "other";
