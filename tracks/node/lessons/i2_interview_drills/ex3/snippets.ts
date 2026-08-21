// Shipped with the lesson - do not edit. The three snippets printed in
// README drill 3, plus the harness that runs them for real.
//
// Each one is scheduled from inside a timer callback, which is the ordinary
// context for server code and the one where the checkpoint order is
// nextTick-queue-then-microtasks.

type Log = (label: string) => void;

function one(log: Log): void {
  log("a");
  process.nextTick(() => log("b"));
  Promise.resolve().then(() => log("c"));
  log("d");
}

function two(log: Log): void {
  const job = async (): Promise<void> => {
    log("1");
    await null;
    log("2");
  };
  void job();
  Promise.resolve().then(() => log("3"));
  log("4");
}

function three(log: Log): void {
  setTimeout(() => log("t1"), 0);
  Promise.resolve().then(() => {
    log("m1");
    process.nextTick(() => log("n1"));
  });
  process.nextTick(() => {
    log("n0");
    Promise.resolve().then(() => log("m0"));
  });
  log("sync");
}

export const SNIPPETS = [one, two, three];

const settle = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

export async function run(): Promise<string[][]> {
  const runs: string[][] = [];
  for (const snippet of SNIPPETS) {
    const seen: string[] = [];
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        snippet((label) => seen.push(label));
        resolve();
      }, 0);
    });
    await settle();
    await settle();
    await settle();
    runs.push(seen);
  }
  return runs;
}
