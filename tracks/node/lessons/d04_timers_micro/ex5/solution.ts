// d04_timers_micro / ex5 - poll with a budget.
// See lessons/d04_timers_micro/README.md, "Problem 5".

export interface PollOptions {
  intervalMs: number;
  timeoutMs: number;
}

/**
 * Check now, then every `intervalMs`. Resolve with the number of checks made
 * as soon as one returns true; reject with `timed out after <timeoutMs>ms` if
 * the budget runs out first. Either way, leave no timer armed and stop
 * checking.
 */
export function pollUntil(check: () => boolean, options: PollOptions): Promise<number> {
  throw new Error("ex5: pollUntil() is not implemented yet - edit this file.");
}
