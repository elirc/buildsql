// d19_unknown_any_never / ex7 - reference solution (author only).

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) {
    return true;
  }
  const kind = typeof value;
  if (kind === "string" || kind === "boolean") {
    return true;
  }
  if (kind === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry));
  }
  if (kind === "object") {
    return Object.values(value as Record<string, unknown>).every((entry) =>
      isJsonValue(entry),
    );
  }
  return false;
}
