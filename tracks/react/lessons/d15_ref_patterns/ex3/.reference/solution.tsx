// d15_ref_patterns / ex3 - reference solution.
import { useImperativeHandle, useState, type Ref } from "react";

export type ScrubberHandle = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
};

export function MediaScrubber({
  label,
  ref,
}: {
  label: string;
  ref?: Ref<ScrubberHandle>;
}) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  // The parent gets this object and nothing else: three verbs, no DOM node, no
  // way to reach around the component and break it.
  useImperativeHandle(
    ref,
    (): ScrubberHandle => ({
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      seek: (seconds) => setPosition(seconds),
    }),
    [],
  );

  return (
    <p role="status">
      {label}: {playing ? "playing" : "paused"} at {position}s
    </p>
  );
}
