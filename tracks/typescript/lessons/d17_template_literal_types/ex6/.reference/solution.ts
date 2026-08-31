// d17_template_literal_types / ex6 - reference solution (author only).

export type Join<T extends readonly string[], D extends string> = T extends readonly [
  infer Head extends string,
  ...infer Rest extends readonly string[],
]
  ? Rest extends readonly []
    ? Head
    : `${Head}${D}${Join<Rest, D>}`
  : "";
