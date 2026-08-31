// d03_objects_shapes / ex6 - reference solution (author only).

export interface TrackMeta {
  genre?: string;
  mood?: string;
  era?: string;
}

export function presentTags(meta: TrackMeta): Record<string, string> {
  const present: Record<string, string> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string" && value.trim() !== "") {
      present[key] = value.trim();
    }
  }
  return present;
}
