// 08_utility_types / ex2 - reference solution (author only).

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export type UserSummary = Pick<User, "id" | "email">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest;
}

export function toSummary(user: User): UserSummary {
  return { id: user.id, email: user.email };
}
