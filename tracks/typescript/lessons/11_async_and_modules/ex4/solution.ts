// 11_async_and_modules / ex4 - importing an untyped module.
// See lessons/11_async_and_modules/README.md, "Exercise 4".

import { LEGACY_VERSION } from "./legacy.js";

export const version: string = LEGACY_VERSION;

export function lessonSlug(index: number, title: string): string {
  throw new Error("ex4: lessonSlug() is not implemented yet - edit this file.");
}
