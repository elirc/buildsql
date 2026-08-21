// 08_utility_types / ex2 - Pick and Omit, derived instead of duplicated.
// See lessons/08_utility_types/README.md, "Exercise 2".
//
// Both aliases below are lies: they are the whole User.

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export type PublicUser = User;

export type UserSummary = User;

export function toPublicUser(user: User): PublicUser {
  throw new Error("ex2: toPublicUser() is not implemented yet - edit this file.");
}

export function toSummary(user: User): UserSummary {
  throw new Error("ex2: toSummary() is not implemented yet - edit this file.");
}
