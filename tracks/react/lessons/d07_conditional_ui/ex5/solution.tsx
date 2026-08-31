// d07_conditional_ui / ex5 - three answers, and only one of them ships the content.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 5".
import type { ReactNode } from "react";

type User = { name: string; entitlements: string[] };

export function AccessGate({
  user,
  feature,
  children,
}: {
  user: User | null;
  feature: string;
  children: ReactNode;
}) {
  return (
    <>
      {user === null && <p>Sign in to continue</p>}
      {children}
    </>
  );
}
