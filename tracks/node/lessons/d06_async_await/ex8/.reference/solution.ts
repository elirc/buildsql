// d06_async_await / ex8 - reference solution (author only, used by `dojo verify`).

export interface Stage {
  name: string;
  run(): Promise<void>;
  rollback?(): Promise<void>;
}

export async function runStages(stages: readonly Stage[]): Promise<string[]> {
  const completed: Stage[] = [];

  for (const stage of stages) {
    try {
      await stage.run();
    } catch (error) {
      const rollbackErrors: Error[] = [];
      // Reverse, and only the ones that finished: the stage that threw did not
      // complete, so there is nothing of it to undo.
      for (let i = completed.length - 1; i >= 0; i -= 1) {
        const done = completed[i];
        if (typeof done.rollback !== "function") continue;
        try {
          await done.rollback();
        } catch (rollbackError) {
          rollbackErrors.push(
            rollbackError instanceof Error
              ? rollbackError
              : new Error(String(rollbackError)),
          );
        }
      }
      if (error instanceof Error && rollbackErrors.length > 0) {
        (error as Error & { rollbackErrors?: Error[] }).rollbackErrors = rollbackErrors;
      }
      throw error;
    }
    // Push AFTER the await returns, so "completed" means completed.
    completed.push(stage);
  }

  return completed.map((stage) => stage.name);
}
