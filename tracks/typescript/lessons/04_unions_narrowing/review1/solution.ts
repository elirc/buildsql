// 04_unions_narrowing / review1 - another discriminated union.
// See lessons/04_unions_narrowing/README.md, "Review".

export type Payment = { method: "cash" };

export function describePayment(payment: Payment): string {
  throw new Error("review1: describePayment() is not implemented yet - edit this file.");
}
