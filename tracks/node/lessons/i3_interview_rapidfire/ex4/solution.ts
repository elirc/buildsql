// i3_interview_rapidfire / ex4 - from a thrown thing to an HTTP reply.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 4".

export interface HttpReply {
  status: number;
  body: { error: string; message: string };
}

export function toResponse(error: unknown): HttpReply {
  throw new Error("ex4: toResponse() is not implemented yet - edit this file.");
}
