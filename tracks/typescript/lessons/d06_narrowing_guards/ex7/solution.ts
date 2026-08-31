// d06_narrowing_guards / ex7 - narrow unknown into a real shape, in order.
// See lessons/d06_narrowing_guards/README.md, "ex7".
//
// The return type is `unknown`, which is what came in. Return a Config.

export interface Config {
  host: string;
  port: number;
  tls: boolean;
}

export function readConfig(raw: unknown): unknown {
  throw new Error("ex7: readConfig() is not implemented yet - edit this file.");
}
