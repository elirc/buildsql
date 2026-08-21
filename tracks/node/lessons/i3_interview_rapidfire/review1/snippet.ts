// Shipped with the lesson - do not edit. The snippet printed in README review.

export function run(log: (label: string) => void): void {
  log("start");

  Promise.resolve()
    .then(() => {
      log("p1");
    })
    .then(() => {
      log("p2");
    });

  process.nextTick(() => log("tick"));

  setTimeout(() => {
    log("timer");
    process.nextTick(() => log("tick-in-timer"));
  }, 0);

  log("end");
}
