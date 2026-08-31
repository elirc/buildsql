// d24_mixed_gauntlet / ex5 - a schema in the middle of a stream.
// See lessons/d24_mixed_gauntlet/README.md, "Problem 5".
import type { Transform } from "node:stream";
import type { ZodSchema } from "zod";

export interface InvalidRecord {
  /** Position in the INPUT, counting from zero. */
  index: number;
  value: unknown;
  issues: { path: string; message: string }[];
}

export interface ValidatingOptions {
  onInvalid?: (record: InvalidRecord) => void;
  /** Fail the stream on the first bad record instead of reporting it. */
  failFast?: boolean;
}

/**
 * An object-mode Transform that pushes the PARSED value of every record the
 * schema accepts, and hands the rest to `onInvalid` - or, with `failFast`,
 * fails the stream with a message naming the record.
 */
export function createValidatingStage<T>(
  schema: ZodSchema<T>,
  options: ValidatingOptions = {},
): Transform {
  throw new Error("ex5: createValidatingStage() is not implemented yet - edit this file.");
}
