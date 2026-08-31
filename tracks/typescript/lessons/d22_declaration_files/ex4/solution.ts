// d22_declaration_files / ex4 - a namespace of types and values.
// See lessons/d22_declaration_files/README.md, "ex4".
//
// The stub has a namespace whose members are all unknown, so
// every type it publishes says nothing.

export namespace Api {
  export interface Row {
    id: unknown;
    amount: unknown;
  }

  export type Id = unknown;

  export const VERSION: number = 0;
}

export function makeRow(id: Api.Id, amount: number): Api.Row {
  throw new Error("ex4: makeRow() is not implemented yet - edit this file.");
}
