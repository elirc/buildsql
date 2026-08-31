// d16_transform_pipeline / ex6 - reference solution (author only, used by `dojo verify`).
import { PassThrough, type Readable, type Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function tee(source: Readable, sinks: Writable[]): Promise<void> {
  // One branch per sink. Piping the source itself into two sinks would give
  // each of them roughly half the data: reading a stream consumes it.
  const branches = sinks.map(() => new PassThrough({ objectMode: true }));
  const runs = branches.map((branch, index) => pipeline(branch, sinks[index]));

  const pump = (async () => {
    for await (const chunk of source) {
      for (const branch of branches) branch.write(chunk);
    }
    for (const branch of branches) branch.end();
  })();

  const everything = [pump, ...runs];
  // The first failure is the one reported; the rest would otherwise land as
  // unhandled rejections the moment the teardown destroys their streams.
  for (const promise of everything) promise.catch(() => {});

  try {
    await Promise.all(everything);
  } catch (error) {
    source.destroy();
    for (const branch of branches) branch.destroy();
    for (const sink of sinks) sink.destroy();
    throw error;
  }
}
