// d11_custom_errors / ex1 - reference solution (author only, used by `dojo verify`).

export class NotFoundError extends Error {
  readonly resource: string;
  readonly id: string;
  readonly status: number = 404;

  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    // Without this every log line about this failure just says "Error". Set it
    // before anybody reads .stack, which is formatted from name and message.
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
  }
}
