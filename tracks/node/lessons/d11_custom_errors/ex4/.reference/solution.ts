// d11_custom_errors / ex4 - reference solution (author only, used by `dojo verify`).

export interface SerialisedError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  cause?: SerialisedError;
}

export type ErrorClass = new (message: string) => Error;

export function reviveError(
  json: SerialisedError,
  registry: Record<string, ErrorClass>,
): Error {
  // hasOwnProperty rather than a bare lookup: a name like "constructor" or
  // "toString" would otherwise find something on Object.prototype.
  const Known = Object.prototype.hasOwnProperty.call(registry, json.name)
    ? registry[json.name]
    : undefined;

  const error = Known ? new Known(json.message) : new Error(json.message);

  // Even without a class, the name is the only clue left about what failed.
  error.name = json.name;

  const target = error as Error & { code?: string; status?: number; cause?: unknown };
  if (json.code !== undefined) target.code = json.code;
  if (json.status !== undefined) target.status = json.status;
  if (json.cause) target.cause = reviveError(json.cause, registry);

  return error;
}
