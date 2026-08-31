// d11_keyof_indexed_access / ex6 - derive both the keys and the values.
// See lessons/d11_keyof_indexed_access/README.md, "ex6".
//
// Two derived types to write, and the table needs `as const` first.

export const ROLES = { admin: 3, editor: 2, viewer: 1 };

export type Role = string;

export type RoleLevel = number;

export function roleFor(level: RoleLevel): Role {
  throw new Error("ex6: roleFor() is not implemented yet - edit this file.");
}

export function atLeastRole(role: Role, min: Role): boolean {
  throw new Error("ex6: atLeastRole() is not implemented yet - edit this file.");
}
