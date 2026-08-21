// 11_async_and_modules / ex4 - reference solution (author only).

import { LEGACY_VERSION, slugify } from "./legacy.js";

export const version: string = LEGACY_VERSION;

export function lessonSlug(index: number, title: string): string {
  return `${String(index).padStart(2, "0")}_${slugify(title)}`;
}
