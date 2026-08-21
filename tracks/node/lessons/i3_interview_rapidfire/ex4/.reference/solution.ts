// i3_interview_rapidfire / ex4 - reference solution (author only, used by `dojo verify`).

export interface HttpReply {
  status: number;
  body: { error: string; message: string };
}

const INTERNAL: HttpReply = {
  status: 500,
  body: { error: "internal_error", message: "internal server error" },
};

export function toResponse(error: unknown): HttpReply {
  if (!(error instanceof Error)) return INTERNAL;

  const candidate = error as Error & { status?: unknown; code?: unknown };

  if (typeof candidate.status === "number" && typeof candidate.code === "string") {
    return {
      status: candidate.status,
      body: { error: candidate.code, message: error.message },
    };
  }

  if (typeof candidate.code === "string" && /^E[A-Z]+$/.test(candidate.code)) {
    return {
      status: 502,
      body: { error: "upstream_error", message: "upstream request failed" },
    };
  }

  return INTERNAL;
}
