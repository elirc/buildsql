// 07_data_fetching / ex2 - reference solution.
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchUser(userId)
      .then((result) => {
        setUser(result);
      })
      .catch((problem: unknown) => {
        setError(problem instanceof Error ? problem.message : "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, fetchUser]);

  if (loading) {
    return <p role="status">Loading</p>;
  }
  if (error !== null) {
    return <p role="alert">{error}</p>;
  }
  if (user === null) {
    return null;
  }
  return <h2>{user.name}</h2>;
}
