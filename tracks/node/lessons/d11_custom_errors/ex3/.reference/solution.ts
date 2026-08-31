// d11_custom_errors / ex3 - reference solution (author only, used by `dojo verify`).

export interface SerialisedError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  cause?: SerialisedError;
}

export function serialiseError(error: Error): SerialisedError {
  const seen = new Set<Error>();

  const walk = (current: Error): SerialisedError => {
    seen.add(current);

    const extra = current as Error & { code?: unknown; status?: unknown; cause?: unknown };
    const result: SerialisedError = { name: current.name, message: current.message };

    // Assigned conditionally rather than always: an absent key is absent, not
    // a key whose value is undefined.
    if (typeof extra.code === "string") result.code = extra.code;
    if (typeof extra.status === "number") result.status = extra.status;
    if (extra.cause instanceof Error && !seen.has(extra.cause)) {
      result.cause = walk(extra.cause);
    }

    return result;
  };

  return walk(error);
}
