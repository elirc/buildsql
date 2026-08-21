// 02_props_composition / review1 - the media-object slot pattern.
// See tracks/react/lessons/02_props_composition/README.md, "Review".
import type { ReactNode } from "react";

export function MediaObject({ media, children }: { media: ReactNode; children: ReactNode }) {
  return <div>{children}</div>;
}
