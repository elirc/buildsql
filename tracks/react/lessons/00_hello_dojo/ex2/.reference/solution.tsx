// 00_hello_dojo / ex2 - reference solution.

export function TrackSummary({ track, lessons }: { track: string; lessons: number }) {
  const noun = lessons === 1 ? "lesson" : "lessons";
  return (
    <p>
      {track}: {lessons} {noun}
    </p>
  );
}
