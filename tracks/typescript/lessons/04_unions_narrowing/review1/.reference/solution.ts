// 04_unions_narrowing / review1 - reference solution (author only).

export type Payment =
  | { method: "cash" }
  | { method: "card"; last4: string }
  | { method: "transfer"; iban: string };

export function describePayment(payment: Payment): string {
  switch (payment.method) {
    case "cash":
      return "cash";
    case "card":
      return `card ending ${payment.last4}`;
    case "transfer":
      return `transfer to ${payment.iban}`;
  }
}
