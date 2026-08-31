// d18_guards_advanced / ex2 - reference solution (author only).

export function hasKey<K extends PropertyKey>(
  value: object,
  key: K,
): value is Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(value, key);
}
