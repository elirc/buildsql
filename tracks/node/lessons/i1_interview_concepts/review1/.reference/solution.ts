// i1_interview_concepts / review1 - reference solution (author only, used by `dojo verify`).

export interface RequestContext {
  userId: string;
  log: (step: string) => void;
}

export interface RequestResult {
  userId: string;
  steps: string[];
}

export async function handleRequest(
  userId: string,
  work: (context: RequestContext) => Promise<void>,
): Promise<RequestResult> {
  // Everything about this request lives here, in this call frame - never in a
  // module-level variable, which every concurrent request would share.
  const steps: string[] = [];
  const context: RequestContext = {
    userId,
    log: (step) => {
      steps.push(step);
    },
  };

  await work(context);

  return { userId, steps };
}
