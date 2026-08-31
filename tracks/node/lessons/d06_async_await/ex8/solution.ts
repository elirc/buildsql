// d06_async_await / ex8 - run it, and be able to undo it.
// See lessons/d06_async_await/README.md, "Problem 8".

export interface Stage {
  name: string;
  run(): Promise<void>;
  /** optional - a stage with nothing to undo simply omits it */
  rollback?(): Promise<void>;
}

/**
 * Run the stages in order and return the names that ran.
 *
 * On a failure: roll back the stages that COMPLETED, in reverse order, then
 * reject with the original error. A rollback that itself fails is collected on
 * that error as `rollbackErrors` rather than replacing it.
 */
export async function runStages(stages: readonly Stage[]): Promise<string[]> {
  throw new Error("ex8: runStages() is not implemented yet - edit this file.");
}
