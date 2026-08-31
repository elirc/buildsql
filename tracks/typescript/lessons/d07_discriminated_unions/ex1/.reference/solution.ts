// d07_discriminated_unions / ex1 - reference solution (author only).

export type Cmd =
  | { kind: "insert"; cents: number }
  | { kind: "select"; slot: string }
  | { kind: "refund" };

export function describeCommand(cmd: Cmd): string {
  switch (cmd.kind) {
    case "insert":
      return `insert ${cmd.cents}c`;
    case "select":
      return `select ${cmd.slot}`;
    case "refund":
      return "refund";
  }
}
