// 06_effects / ex4 - reference solution.
import { useEffect, useState } from "react";

type User = { name: string };

export function UserBadge({
  userId,
  fetchUser,
}: {
  userId: string;
  fetchUser: (id: string) => Promise<User>;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchUser(userId).then((result) => {
      if (!cancelled) {
        setUser(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, fetchUser]);

  return <p>{user === null ? "" : user.name}</p>;
}
