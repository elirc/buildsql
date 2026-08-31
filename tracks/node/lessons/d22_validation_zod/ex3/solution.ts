// d22_validation_zod / ex3 - the rules no single field can check on its own.
// See lessons/d22_validation_zod/README.md, "Problem 3".
import { z } from "zod";

export interface Booking {
  startsAt: string;
  endsAt: string;
  seats: number;
  email?: string;
  phone?: string;
}

/**
 * A booking: `startsAt`, `endsAt`, `seats` (1 to 8), and an optional `email`
 * and `phone`. `endsAt` must be after `startsAt`, and at least one of `email`
 * and `phone` has to be there.
 *
 * As shipped this rejects everything - replace it with the real schema.
 */
export const bookingSchema = z.custom<Booking>(() => false, {
  message: "ex3: bookingSchema is not implemented yet - edit this file.",
});
