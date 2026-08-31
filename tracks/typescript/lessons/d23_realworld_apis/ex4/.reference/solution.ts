// d23_realworld_apis / ex4 - reference solution (author only).

export interface UserDto {
  user_id: string;
  display_name: string;
  created_at: string;
}

type SnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
  : S;

export type CamelKeys<T> = {
  [K in keyof T as SnakeToCamel<K & string>]: T[K];
};

export interface User {
  userId: string;
  displayName: string;
  createdAt: Date;
}

export function toUser(dto: UserDto): User {
  return {
    userId: dto.user_id,
    displayName: dto.display_name,
    createdAt: new Date(dto.created_at),
  };
}
