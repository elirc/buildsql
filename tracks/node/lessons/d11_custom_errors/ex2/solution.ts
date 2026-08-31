// d11_custom_errors / ex2 - a family, not a flag.
// See lessons/d11_custom_errors/README.md, "Problem 2".

export interface HttpErrorOptions {
  cause?: unknown;
}

/** `expose` is true for a 4xx and false for a 5xx. */
export class HttpError extends Error {
  readonly status!: number;
  readonly expose!: boolean;

  constructor(status: number, message: string, options?: HttpErrorOptions) {
    super(message);
    throw new Error("ex2: HttpError is not implemented yet - edit this file.");
  }
}

/** 400. */
export class BadRequestError extends HttpError {
  constructor(message: string, options?: HttpErrorOptions) {
    super(400, message, options);
    throw new Error("ex2: BadRequestError is not implemented yet - edit this file.");
  }
}

/** 409. */
export class ConflictError extends HttpError {
  constructor(message: string, options?: HttpErrorOptions) {
    super(409, message, options);
    throw new Error("ex2: ConflictError is not implemented yet - edit this file.");
  }
}
