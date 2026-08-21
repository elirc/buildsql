// Shipped with the lesson - do not edit. The snippet printed in README ex1.

export function run(log: (label: string) => void): void {
  const start = async (): Promise<void> => {
    log("A");
    await Promise.resolve();
    log("B");
  };

  void start();
  process.nextTick(() => log("C"));
  queueMicrotask(() => log("D"));
  log("E");
}
