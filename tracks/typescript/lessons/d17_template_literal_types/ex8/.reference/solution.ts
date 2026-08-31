// d17_template_literal_types / ex8 - reference solution (author only).

type ParamNames<S extends string> = S extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ParamNames<Rest>
  : S extends `${string}:${infer Param}`
    ? Param
    : never;

export type RouteParams<S extends string> = { [K in ParamNames<S>]: string };
