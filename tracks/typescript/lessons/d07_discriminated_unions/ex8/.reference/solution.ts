// d07_discriminated_unions / ex8 - reference solution (author only).

export type Expr =
  | { kind: "lit"; value: number }
  | { kind: "var"; name: string }
  | { kind: "add"; left: Expr; right: Expr }
  | { kind: "mul"; left: Expr; right: Expr }
  | { kind: "neg"; operand: Expr };

export function evaluate(expr: Expr, env: Readonly<Record<string, number>>): number {
  switch (expr.kind) {
    case "lit":
      return expr.value;
    case "var": {
      const value = env[expr.name];
      if (value === undefined) {
        throw new Error(`unknown variable: ${expr.name}`);
      }
      return value;
    }
    case "add":
      return evaluate(expr.left, env) + evaluate(expr.right, env);
    case "mul":
      return evaluate(expr.left, env) * evaluate(expr.right, env);
    case "neg":
      return -evaluate(expr.operand, env);
  }
}

export function render(expr: Expr): string {
  switch (expr.kind) {
    case "lit":
      return String(expr.value);
    case "var":
      return expr.name;
    case "add":
      return `(${render(expr.left)} + ${render(expr.right)})`;
    case "mul":
      return `(${render(expr.left)} * ${render(expr.right)})`;
    case "neg":
      return `-(${render(expr.operand)})`;
  }
}
