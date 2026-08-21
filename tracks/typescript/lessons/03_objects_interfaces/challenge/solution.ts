// 03_objects_interfaces / challenge - nested shapes, summarised.
// See lessons/03_objects_interfaces/README.md, "Challenge".
//
// Three interfaces, one function. Only the first interface is finished.

export interface Lesson {
  slug: string;
  exercises: number;
}

export interface Part {
  title: string;
}

export interface PartSummary {
  title: string;
}

export function summarise(parts: readonly Part[]): PartSummary[] {
  throw new Error("challenge: summarise() is not implemented yet - edit this file.");
}
