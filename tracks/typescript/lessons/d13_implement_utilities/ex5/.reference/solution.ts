// d13_implement_utilities / ex5 - reference solution (author only).

export type MyInstanceType<C extends new (...args: any[]) => unknown> = C extends new (
  ...args: any[]
) => infer R
  ? R
  : never;
