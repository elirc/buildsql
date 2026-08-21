// i1_interview_concepts / ex2 - make the union exhaustive.
// See lessons/i1_interview_concepts/README.md, "Exercise 2".
//
// A fourth state was added to the union and this function was not updated.
// Nothing complained, which is the bug.

export type JobState =
  | { status: "queued" }
  | { status: "running"; percent: number }
  | { status: "done"; durationMs: number }
  | { status: "failed"; message: string };

export function describeJob(job: JobState): string {
  switch (job.status) {
    case "queued":
      return "queued";
    case "running":
      return `running (${job.percent}%)`;
    case "done":
      return `done in ${job.durationMs}ms`;
    default:
      return "unknown";
  }
}
