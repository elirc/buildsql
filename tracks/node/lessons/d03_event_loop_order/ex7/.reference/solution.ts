// d03_event_loop_order / ex7 - reference solution (author only, used by `dojo verify`).
//
// Synchronously: registering the chain logs nothing, queueMicrotask logs
// nothing, job() runs to its first await and logs "a-start", then "sync".
//
// The microtask queue starts as [p1, q1, q2, job-resume-1]:
//   p1  -> "p1", and only now is the p2 handler queued (position 5)
//   q1  -> "q1"
//   q2  -> "q2"
//   job -> "a-1", and the second await queues job-resume-2 (position 7)
//   p2  -> "p2", queueing p3 (position 8)
//   job -> "a-2"
//   p3  -> "p3"

export function predictOrder(): string[] {
  return ["a-start", "sync", "p1", "q1", "q2", "a-1", "p2", "a-2", "p3"];
}
