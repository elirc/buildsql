// d22_validation_zod / ex4 - parsing, not just validating.
// See lessons/d22_validation_zod/README.md, "Problem 4".
import { z } from "zod";

export interface Signup {
  /** Trimmed and lowercased. */
  email: string;
  /** A real Date, built from the ISO string that came in. */
  joinedAt: Date;
  /** The comma-separated string, split, trimmed and de-duplicated. */
  tags: string[];
}

/**
 * A signup whose OUTPUT is not its input: three strings in, a string, a Date
 * and an array out.
 *
 * As shipped this rejects everything - replace it with the real schema.
 */
export const signupSchema = z.custom<Signup>(() => false, {
  message: "ex4: signupSchema is not implemented yet - edit this file.",
});
