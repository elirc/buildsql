// d22_declaration_files / ex8 - a class, a type and a namespace.
// See lessons/d22_declaration_files/README.md, "ex8".
//
// The stub is the class alone, with currency widened to string,
// so there is no namespace, no currency type and no factory.

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {}

  plus(other: Money | number): Money {
    throw new Error("ex8: Money.plus() is not implemented yet - edit this file.");
  }

  toString(): string {
    throw new Error("ex8: Money.toString() is not implemented yet - edit this file.");
  }
}
