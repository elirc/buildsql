// d14_mapped_types / ex5 - keep only the members of one value type.
// See lessons/d14_mapped_types/README.md, "ex5".
//
// PickByType<Metric, string> should keep the string members and drop the
// rest entirely. Remapping a key to never is how a member is deleted.

export type PickByType<T, V> = T;
