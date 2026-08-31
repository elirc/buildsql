// d24_mixed_gauntlet / ex4 - reference solution.
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

    // One flag per run of the effect. The cleanup below flips the one
    // belonging to the session it is retiring, and nothing else.
    let current = true;
    setProfile(null);

    loadProfile(userId).then((next) => {
      if (!current) return;
      setProfile(next);
    });

    return () => {
      current = false;
    };
  }, [userId, loadProfile]);

  // Every hook has been called by the time this runs, which is what makes an
  // early return here legal.
  if (userId === null) {
    throw new Error("ProfilePane must be used inside a SessionProvider");
  }
  if (profile === null) {
    return <p role="status">Loading profile</p>;
  }
  return <h2>{profile.name}</h2>;
}
