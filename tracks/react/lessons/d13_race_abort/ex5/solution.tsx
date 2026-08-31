// d13_race_abort / ex5 - two clicks, no cleanup, still a race.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 5".
import { useEffect, useState } from "react";

export function AccountBalance({
  accountId,
  fetchBalance,
}: {
  accountId: string;
  fetchBalance: (accountId: string) => Promise<number>;
}) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchBalance(accountId).then((next) => {
      setBalance(next);
    });
  }, [accountId, fetchBalance]);

  function refresh() {
    fetchBalance(accountId).then((next) => {
      setBalance(next);
    });
  }

  return (
    <>
      {balance === null ? <p role="status">Loading balance</p> : <p>Balance: {balance}</p>}
      <button type="button" onClick={refresh}>
        Refresh
      </button>
    </>
  );
}
