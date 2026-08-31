// d14_mapped_types / ex6 - flags from a union of names.
// See lessons/d14_mapped_types/README.md, "ex6".
//
// Toggles<"audio" | "video"> should be { hasAudio: boolean; hasVideo: boolean }.
// This version maps the union but keeps the names raw.

export type Toggles<K extends string> = { [P in K]: boolean };
