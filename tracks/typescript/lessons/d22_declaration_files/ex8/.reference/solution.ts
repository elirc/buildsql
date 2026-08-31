// d22_declaration_files / ex8 - reference solution (author only).

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Money.Currency,
  ) {}

  plus(other: Money): Money;
  plus(amount: number): Money;
  plus(other: Money | number): Money {
    if (typeof other === "number") {
      return new Money(this.amount + other, this.currency);
    }
    if (other.currency !== this.currency) {
      throw new TypeError(
        "Money.plus: cannot add " + other.currency + " to " + this.currency + " - " +
          "one currency at a time",
      );
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  toString(): string {
    return Money.SYMBOLS[this.currency] + this.amount.toFixed(2);
  }
}

export namespace Money {
  export type Currency = "USD" | "EUR";

  export const SYMBOLS: Record<Currency, string> = { USD: "$", EUR: "E" };

  export function zero(currency: Currency): Money {
    return new Money(0, currency);
  }
}
