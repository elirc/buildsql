// 06_effects / ex4 - fetching on mount, and when the id changes.
// See tracks/react/lessons/06_effects/README.md, "Exercise 4".
import { useState } from "react";

type User = { name: string };

export function UserBadge({
  userId,
  fetchUser,
}: {
  userId: string;
  fetchUser: (id: string) => Promise<User>;
}) {
  const [user, setUser] = useState<User | null>(null);

  return <p>{user === null ? "" : user.name}</p>;
}
