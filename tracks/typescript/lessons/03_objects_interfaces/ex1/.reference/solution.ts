// 03_objects_interfaces / ex1 - reference solution (author only).

export interface Lesson {
  slug: string;
  title: string;
  exercises: number;
  challenge?: boolean;
}

export function describeLesson(lesson: Lesson): string {
  const line = `${lesson.slug}: ${lesson.title} - ${lesson.exercises} exercises`;
  return lesson.challenge ? `${line} + challenge` : line;
}
