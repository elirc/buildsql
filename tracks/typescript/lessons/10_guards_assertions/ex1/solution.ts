// 10_guards_assertions / ex1 - a function that narrows for its caller.
// See lessons/10_guards_assertions/README.md, "Exercise 1".
//
// This returns a boolean, which tells the compiler nothing.

export interface Lesson {
  slug: string;
  exercises: number;
}

export function isLesson(value: unknown): boolean {
  throw new Error("ex1: isLesson() is not implemented yet - edit this file.");
}
