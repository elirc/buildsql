// 11_async_and_modules / ex1 - reference solution (author only).

export interface Lesson {
  slug: string;
  title: string;
}

const LESSONS: Record<string, Lesson> = {
  "01_primitives_and_inference": { slug: "01_primitives_and_inference", title: "Primitives" },
  "04_unions_narrowing": { slug: "04_unions_narrowing", title: "Unions" },
};

export async function loadLesson(slug: string): Promise<Lesson> {
  const lesson = LESSONS[slug];
  if (lesson === undefined) {
    throw new Error(`unknown lesson: ${slug}`);
  }
  return lesson;
}
