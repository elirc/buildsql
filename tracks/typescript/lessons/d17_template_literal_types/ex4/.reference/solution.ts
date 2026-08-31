// d17_template_literal_types / ex4 - reference solution (author only).

export type StripPrefix<S extends string, P extends string> = S extends `${P}${infer Rest}`
  ? Rest
  : S;
