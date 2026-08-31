// d07_conditional_ui / ex5 - reference solution.
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
  if (user === null) {
    return <p>Sign in to continue</p>;
  }

  if (!user.entitlements.includes(feature)) {
    return <p>Upgrade to Pro</p>;
  }

  return <>{children}</>;
}
