// d14_mapped_types / ex6 - reference solution (author only).

export type Toggles<K extends string> = {
  [P in K as `has${Capitalize<P>}`]: boolean;
};
