// 07_data_fetching / ex3 - reference solution.
import { useEffect, useState } from "react";

type User = { name: string };

export function ProfileViewer({
  userId,
  fetchUser,
}: {
  userId: string;
  fetchUser: (id: string) => Promise<User>;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true);

    fetchUser(userId).then((result) => {
      if (!current) {
        return;
      }
      setUser(result);
      setLoading(false);
    });

    return () => {
      current = false;
    };
  }, [userId, fetchUser]);

  if (loading) {
    return <p role="status">Loading</p>;
  }
  if (user === null) {
    return null;
  }
  return <h2>{user.name}</h2>;
}
