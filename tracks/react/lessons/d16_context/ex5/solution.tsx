// d16_context / ex5 - a new object describing the same thing.
// See tracks/react/lessons/d16_context/README.md, "Exercise 5".
import { createContext, useContext, useState, type ReactNode } from "react";

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

  const value: Account = { name, initials: initialsOf(name) };

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
