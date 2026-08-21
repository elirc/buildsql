// 02_props_composition / review1 - reference solution.
import type { ReactNode } from "react";

export function MediaObject({ media, children }: { media: ReactNode; children: ReactNode }) {
  return (
    <div className="media">
      <div className="media-figure">{media}</div>
      <div className="media-body">{children}</div>
    </div>
  );
}
