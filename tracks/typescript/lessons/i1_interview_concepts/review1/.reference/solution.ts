// i1_interview_concepts / review1 - reference solution (author only).

export function safeGet(source: unknown, key: string): unknown {
  if (typeof source !== "object" || source === null) {
    return undefined;
  }
  return (source as Record<string, unknown>)[key];
}
