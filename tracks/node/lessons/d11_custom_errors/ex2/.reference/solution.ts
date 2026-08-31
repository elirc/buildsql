// d11_custom_errors / ex2 - reference solution (author only, used by `dojo verify`).

export interface HttpErrorOptions {
  cause?: unknown;
}

export class HttpError extends Error {
  readonly status: number;
  readonly expose: boolean;

  constructor(status: number, message: string, options?: HttpErrorOptions) {
    // The options object has to reach Error itself, or `cause` never gets set
    // and the chain stops at this subclass.
    super(message, options);
    // new.target.name gives each subclass its own name without every subclass
    // repeating the line.
    this.name = new.target.name;
    this.status = status;
    this.expose = status < 500;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, options?: HttpErrorOptions) {
    super(400, message, options);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, options?: HttpErrorOptions) {
    super(409, message, options);
  }
}
