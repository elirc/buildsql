// Shipped with the lesson - do not edit. This is the snippet printed in
// README ex1. The gate runs it for real and compares your prediction with
// what actually happened.

export function run(log: (label: string) => void): void {
  log("start");

  setTimeout(() => log("timeout"), 0);
  Promise.resolve().then(() => log("promise"));
  process.nextTick(() => log("nextTick"));

  log("end");
}
