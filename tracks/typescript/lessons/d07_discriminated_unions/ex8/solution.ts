// d07_discriminated_unions / ex8 - a union that contains itself.
// See lessons/d07_discriminated_unions/README.md, "ex8".

export type Expr =
  | { kind: string; value: number }
  | { kind: string; name: string }
  | { kind: string; left: Expr; right: Expr }
  | { kind: string; operand: Expr };

export function evaluate(expr: Expr, env: Readonly<Record<string, number>>): number {
  throw new Error("ex8: evaluate() is not implemented yet - edit this file.");
}

export function render(expr: Expr): string {
  throw new Error("ex8: render() is not implemented yet - edit this file.");
}
