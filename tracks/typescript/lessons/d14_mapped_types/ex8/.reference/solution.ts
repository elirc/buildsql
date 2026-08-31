// d14_mapped_types / ex8 - reference solution (author only).

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
