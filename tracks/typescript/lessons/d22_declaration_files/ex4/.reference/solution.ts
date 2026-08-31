// d22_declaration_files / ex4 - reference solution (author only).

export namespace Api {
  export interface Row {
    id: string;
    amount: number;
  }

  export type Id = Row["id"];

  export const VERSION: number = 2;
}

export function makeRow(id: Api.Id, amount: number): Api.Row {
  return { id, amount };
}
