// Shipped with the lesson - do not edit. The snippet printed in README review.

export function run(log: (label: string) => void): void {
  log("A");

  const job = (async () => {
    log("B");
    await null;
    log("C");
    return "done";
  })();

  job.then((value) => log(`E:${value}`));
  process.nextTick(() => log("D"));
  setTimeout(() => log("F"), 0);

  log("G");
}
