// d11_keyof_indexed_access / ex6 - reference solution (author only).

export const ROLES = { admin: 3, editor: 2, viewer: 1 } as const;

export type Role = keyof typeof ROLES;

export type RoleLevel = (typeof ROLES)[Role];

export function roleFor(level: RoleLevel): Role {
  for (const role of Object.keys(ROLES) as Role[]) {
    if (ROLES[role] === level) {
      return role;
    }
  }
  return "viewer";
}

export function atLeastRole(role: Role, min: Role): boolean {
  return ROLES[role] >= ROLES[min];
}
