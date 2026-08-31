// d13_implement_utilities / ex3 - reference solution (author only).

export type MyRecord<K extends PropertyKey, V> = { [P in K]: V };
