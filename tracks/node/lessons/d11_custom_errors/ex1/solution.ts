// d11_custom_errors / ex1 - the smallest useful error class.
// See lessons/d11_custom_errors/README.md, "Problem 1".

/**
 * message: `<resource> not found: <id>`, name "NotFoundError", status 404, and
 * both pieces kept as data so a handler never has to parse the message.
 */
export class NotFoundError extends Error {
  readonly resource!: string;
  readonly id!: string;
  readonly status!: number;

  constructor(resource: string, id: string) {
    super("ex1: NotFoundError is not implemented yet - edit this file.");
    throw new Error("ex1: NotFoundError is not implemented yet - edit this file.");
  }
}
