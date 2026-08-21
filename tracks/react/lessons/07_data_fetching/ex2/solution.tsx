// 07_data_fetching / ex2 - the third outcome.
// See tracks/react/lessons/07_data_fetching/README.md, "Exercise 2".
import { useEffect, useState } from "react";

type User = { name: string };

export function Profile({
  userId,
  fetchUser,
}: {
  userId: string;
  fetchUser: (id: string) => Promise<User>;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId).then((result) => {
      setUser(result);
      setLoading(false);
    });
  }, [userId, fetchUser]);

  if (loading) {
    return <p role="status">Loading</p>;
  }
  if (user === null) {
    return null;
  }
  return <h2>{user.name}</h2>;
}
