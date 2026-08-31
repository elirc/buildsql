// d17_template_literal_types / ex3 - reference solution (author only).

export type StartsWith<S extends string, P extends string> = S extends `${P}${string}`
  ? true
  : false;
