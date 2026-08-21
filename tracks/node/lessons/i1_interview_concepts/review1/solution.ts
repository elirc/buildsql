// i1_interview_concepts / review1 - state that belongs to one request.
// See lessons/i1_interview_concepts/README.md, "Review".

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
  throw new Error("review1: handleRequest() is not implemented yet - edit this file.");
}
