// 07_data_fetching / ex1 - loading, then data.
// See tracks/react/lessons/07_data_fetching/README.md, "Exercise 1".
import { useState } from "react";

type User = { name: string };

export function UserCard({
  userId,
  fetchUser,
}: {
  userId: string;
  fetchUser: (id: string) => Promise<User>;
}) {
  const [user, setUser] = useState<User | null>(null);

  if (user === null) {
    return null;
  }
  return <h2>{user.name}</h2>;
}
