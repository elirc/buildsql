// 11_async_and_modules / ex1 - a promise is a type parameter away.
// See lessons/11_async_and_modules/README.md, "Exercise 1".
//
// This function is synchronous and its return type says so.

export interface Lesson {
  slug: string;
  title: string;
}

const LESSONS: Record<string, Lesson> = {
  "01_primitives_and_inference": { slug: "01_primitives_and_inference", title: "Primitives" },
  "04_unions_narrowing": { slug: "04_unions_narrowing", title: "Unions" },
};

export function loadLesson(slug: string): Lesson {
  throw new Error("ex1: loadLesson() is not implemented yet - edit this file.");
}
