// d24_mixed_gauntlet / ex5 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";
import type { ZodSchema } from "zod";

export interface InvalidRecord {
  index: number;
  value: unknown;
  issues: { path: string; message: string }[];
}

export interface ValidatingOptions {
  onInvalid?: (record: InvalidRecord) => void;
  failFast?: boolean;
}

export function createValidatingStage<T>(
  schema: ZodSchema<T>,
  options: ValidatingOptions = {},
): Transform {
  //: counts every record that arrived, valid or not - it is a position in the
  //: input file, not a count of the ones that got through.
  let index = 0;

  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      const position = index;
      index += 1;

      const result = schema.safeParse(chunk);
      if (result.success) {
        // The PARSED value, so the schema's stripping and coercion actually
        // reach the sink.
        callback(null, result.data);
        return;
      }

      const issues = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      if (options.failFast === true) {
        callback(new Error(`record ${position} failed validation: ${issues[0]?.path}`));
        return;
      }

      options.onInvalid?.({ index: position, value: chunk, issues });
      // Not pushing anything is how a Transform drops a record.
      callback();
    },
  });
}
