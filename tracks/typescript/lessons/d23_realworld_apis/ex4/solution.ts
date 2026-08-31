// d23_realworld_apis / ex4 - dto in, domain model out.
// See lessons/d23_realworld_apis/README.md, "ex4".
//
// The stub renames nothing - CamelKeys is the identity - and
// toUser throws.

export interface UserDto {
  user_id: string;
  display_name: string;
  created_at: string;
}

export type CamelKeys<T> = { [K in keyof T]: T[K] };

export interface User {
  userId: string;
  displayName: string;
  createdAt: Date;
}

export function toUser(dto: UserDto): User {
  throw new Error("ex4: toUser() is not implemented yet - edit this file.");
}
