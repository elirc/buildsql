// d16_context / ex5 - reference solution.
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Account = { name: string; initials: string };

const AccountContext = createContext<Account | null>(null);

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("");
}

export function AccountProvider({ name, children }: { name: string; children: ReactNode }) {
  const [synced, setSynced] = useState(0);

  // The account only changes when the name does. Without this the provider
  // hands out a different object on every render of its own, and React - which
  // compares context values with Object.is - tells every consumer to redraw.
  const value = useMemo<Account>(() => ({ name, initials: initialsOf(name) }), [name]);

  return (
    <AccountContext.Provider value={value}>
      <p role="status">
        Synced {synced} {synced === 1 ? "time" : "times"}
      </p>
      <button type="button" onClick={() => setSynced((current) => current + 1)}>
        Refresh
      </button>
      {children}
    </AccountContext.Provider>
  );
}

export function AccountChip({ onRender }: { onRender: () => void }) {
  onRender();
  const account = useContext(AccountContext);
  if (account === null) return null;
  return (
    <p>
      {account.initials} - {account.name}
    </p>
  );
}
