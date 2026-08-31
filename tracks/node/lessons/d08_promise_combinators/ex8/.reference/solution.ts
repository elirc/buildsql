// d08_promise_combinators / ex8 - reference solution (author only, used by `dojo verify`).

export function firstQuorum<T>(
  promises: readonly Promise<T>[],
  quorum: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Object.is semantics for the keys, which is what a Map gives you.
    const votes = new Map<T, number>();
    let undecided = promises.length;

    /**
     * The best score any value could still reach: the current leader plus
     * every vote not yet cast. If that is short of the quorum, no further
     * settlement can change the answer.
     */
    const checkImpossible = (): void => {
      let leader = 0;
      for (const count of votes.values()) leader = Math.max(leader, count);
      if (leader + undecided < quorum) reject(new Error("no quorum"));
    };

    if (promises.length === 0) {
      checkImpossible();
      return;
    }

    for (const promise of promises) {
      promise.then(
        (value) => {
          const count = (votes.get(value) ?? 0) + 1;
          votes.set(value, count);
          undecided -= 1;
          if (count >= quorum) resolve(value);
          else checkImpossible();
        },
        () => {
          undecided -= 1;
          checkImpossible();
        },
      );
    }
  });
}
