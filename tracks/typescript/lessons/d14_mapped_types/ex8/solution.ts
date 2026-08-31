// d14_mapped_types / ex8 - which keys are optional?
// See lessons/d14_mapped_types/README.md, "ex8".
//
// OptionalKeys<{ a: number; b?: string }> should be "b" - just the keys a
// value may omit. keyof T is every key, which is a different question.

export type OptionalKeys<T> = keyof T;
