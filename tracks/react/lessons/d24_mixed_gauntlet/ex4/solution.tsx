// d24_mixed_gauntlet / ex4 - context + a request + the race between two of them.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 4".
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const SessionContext = createContext<string | null>(null);

export function SessionProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={userId}>{children}</SessionContext.Provider>;
}

export type SessionProfile = { name: string };

export function ProfilePane({
  loadProfile,
}: {
  loadProfile: (userId: string) => Promise<SessionProfile>;
}) {
  const userId = useContext(SessionContext);
  const [profile, setProfile] = useState<SessionProfile | null>(null);

  useEffect(() => {
    if (userId === null) return;
    setProfile(null);
    loadProfile(userId).then((next) => {
      setProfile(next);
    });
  }, [userId, loadProfile]);

  if (userId === null) {
    throw new Error("ProfilePane must be used inside a SessionProvider");
  }
  if (profile === null) {
    return <p role="status">Loading profile</p>;
  }
  return <h2>{profile.name}</h2>;
}
