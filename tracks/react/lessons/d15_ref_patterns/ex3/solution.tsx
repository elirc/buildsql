// d15_ref_patterns / ex3 - the handle exists, the wiring does not.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 3".
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

  useImperativeHandle(
    ref,
    (): ScrubberHandle => ({
      play() {
        // TODO: this is your job.
      },
      pause() {
        // TODO: and this.
      },
      seek() {
        // TODO: and this.
      },
    }),
    [],
  );

  return (
    <p role="status">
      {label}: {playing ? "playing" : "paused"} at {position}s
    </p>
  );
}
