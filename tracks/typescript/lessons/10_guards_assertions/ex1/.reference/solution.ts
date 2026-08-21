// 10_guards_assertions / ex1 - reference solution (author only).

export interface Lesson {
  slug: string;
  exercises: number;
}

export function isLesson(value: unknown): value is Lesson {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate.slug === "string" && typeof candidate.exercises === "number";
}
