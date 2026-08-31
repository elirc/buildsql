// d22_validation_zod / ex3 - reference solution (author only, used by `dojo verify`).
import { z } from "zod";

export const bookingSchema = z
  .object({
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    seats: z.number().int().min(1).max(8),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
  })
  .superRefine((value, ctx) => {
    // ISO-8601 strings compare correctly as strings, which is the one thing
    // that format is for.
    if (value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        // Without a path the issue lands on the object and no form field can
        // display it.
        path: ["endsAt"],
        message: "endsAt must be after startsAt",
      });
    }

    if (value.email === undefined && value.phone === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "email or phone is required",
      });
    }
  });
