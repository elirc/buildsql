// d13_race_abort / ex5 - reference solution.
import { useCallback, useEffect, useRef, useState } from "react";

export function AccountBalance({
  accountId,
  fetchBalance,
}: {
  accountId: string;
  fetchBalance: (accountId: string) => Promise<number>;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  // A ref, not state: bumping the request number must not render anything, and
  // it has to survive the renders that happen while a request is in flight.
  const latest = useRef(0);

  const request = useCallback(() => {
    latest.current += 1;
    const mine = latest.current;
    fetchBalance(accountId).then((next) => {
      // Not "am I the newest arrival" but "am I the newest question".
      if (mine !== latest.current) return;
      setBalance(next);
    });
  }, [accountId, fetchBalance]);

  useEffect(() => {
    request();
  }, [request]);

  return (
    <>
      {balance === null ? <p role="status">Loading balance</p> : <p>Balance: {balance}</p>}
      <button type="button" onClick={request}>
        Refresh
      </button>
    </>
  );
}
