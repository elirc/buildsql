// d15_readable_writable / ex7 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export function mergeStreams(sources: Readable[]): Readable {
  const merged = new Readable({ objectMode: true, read() {} });

  let open = sources.length;
  if (open === 0) {
    merged.push(null);
    return merged;
  }

  let failed = false;
  for (const source of sources) {
    source.on("data", (item) => {
      merged.push(item);
    });
    source.on("end", () => {
      // One source ending is not the merge ending - count them down.
      open -= 1;
      if (open === 0 && !failed) merged.push(null);
    });
    source.on("error", (error) => {
      if (failed) return;
      failed = true;
      // The survivors would otherwise keep producing into a dead stream.
      for (const other of sources) {
        if (other !== source) other.destroy();
      }
      merged.destroy(error);
    });
  }

  return merged;
}
