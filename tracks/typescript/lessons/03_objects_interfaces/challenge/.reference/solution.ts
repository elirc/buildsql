// 03_objects_interfaces / challenge - reference solution (author only).

export interface Lesson {
  slug: string;
  exercises: number;
}

export interface Part {
  title: string;
  lessons: readonly Lesson[];
}

export interface PartSummary {
  title: string;
  lessonCount: number;
  exerciseCount: number;
}

export function summarise(parts: readonly Part[]): PartSummary[] {
  return parts.map((part) => ({
    title: part.title,
    lessonCount: part.lessons.length,
    exerciseCount: part.lessons.reduce((total, lesson) => total + lesson.exercises, 0),
  }));
}
