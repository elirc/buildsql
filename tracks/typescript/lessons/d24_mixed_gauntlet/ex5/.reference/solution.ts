// d24_mixed_gauntlet / ex5 - reference solution (author only).

export type Command =
  | { type: "add"; item: string }
  | { type: "remove"; id: number }
  | { type: "clear" };

export function parseCommand(input: unknown): Command | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  const record = input as Record<string, unknown>;
  if (record.type === "add" && typeof record.item === "string") {
    return { type: "add", item: record.item };
  }
  if (record.type === "remove" && typeof record.id === "number") {
    return { type: "remove", id: record.id };
  }
  if (record.type === "clear") {
    return { type: "clear" };
  }
  return null;
}
