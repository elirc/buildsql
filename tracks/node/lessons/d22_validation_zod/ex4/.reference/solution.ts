// d22_validation_zod / ex4 - reference solution (author only, used by `dojo verify`).
import { z } from "zod";

export const signupSchema = z.object({
  // trim() and toLowerCase() are transforms; .pipe() feeds what they produced
  // into the next schema, so the address is judged AFTER it is tidied.
  email: z.string().trim().toLowerCase().pipe(z.string().email()),

  // new Date("nonsense") does not throw - it returns an Invalid Date. The
  // z.date() on the far side of the pipe is what catches that.
  joinedAt: z
    .string()
    .transform((value) => new Date(value))
    .pipe(z.date()),

  // The default is applied to the INPUT, so the transform still runs on it.
  tags: z
    .string()
    .default("")
    .transform((value) => [
      ...new Set(
        value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
      ),
    ]),
});

export type Signup = z.infer<typeof signupSchema>;
