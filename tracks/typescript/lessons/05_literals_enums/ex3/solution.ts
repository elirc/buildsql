// 05_literals_enums / ex3 - the one place an enum earns its keep.
// See lessons/05_literals_enums/README.md, "Exercise 3".
//
// Two members are missing, and statusLabel() has to cover all three.

export enum Status {
  Draft = "draft",
}

export function statusLabel(status: Status): string {
  throw new Error("ex3: statusLabel() is not implemented yet - edit this file.");
}
