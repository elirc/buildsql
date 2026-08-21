// i1_interview_concepts / ex2 - reference solution (author only).

export type JobState =
  | { status: "queued" }
  | { status: "running"; percent: number }
  | { status: "done"; durationMs: number }
  | { status: "failed"; message: string };

function assertNever(value: never): never {
  throw new Error(`unhandled job state: ${JSON.stringify(value)}`);
}

export function describeJob(job: JobState): string {
  switch (job.status) {
    case "queued":
      return "queued";
    case "running":
      return `running (${job.percent}%)`;
    case "done":
      return `done in ${job.durationMs}ms`;
    case "failed":
      return `failed: ${job.message}`;
    default:
      return assertNever(job);
  }
}
