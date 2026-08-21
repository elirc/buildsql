// 03_objects_interfaces / ex1 - describe a shape, then use it.
// See lessons/03_objects_interfaces/README.md, "Exercise 1".
//
// The interface below is missing most of the lesson. Finish it, then
// implement describeLesson().

export interface Lesson {
  slug: string;
}

export function describeLesson(lesson: Lesson): string {
  throw new Error("ex1: describeLesson() is not implemented yet - edit this file.");
}
