// 07_data_fetching / ex4 - asking again.
// See tracks/react/lessons/07_data_fetching/README.md, "Exercise 4".
import { useEffect, useState } from "react";

type User = { name: string };

export function RetryableUser({
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
      .then(setUser)
      .catch((problem: unknown) => {
        setError(problem instanceof Error ? problem.message : "Something went wrong");
      })
      .finally(() => setLoading(false));
  }, [userId, fetchUser]);

  if (loading) {
    return <p role="status">Loading</p>;
  }
  if (error !== null) {
    return (
      <>
        <p role="alert">{error}</p>
        <button type="button">Try again</button>
      </>
    );
  }
  if (user === null) {
    return null;
  }
  return <h2>{user.name}</h2>;
}
