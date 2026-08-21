// i1_interview_concepts / ex1 - reference solution (author only).

export function lengthOf(value: unknown): number {
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length;
  }
  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length;
  }
  return 0;
}
