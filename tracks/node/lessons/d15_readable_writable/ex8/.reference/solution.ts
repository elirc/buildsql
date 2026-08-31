// d15_readable_writable / ex8 - reference solution (author only, used by `dojo verify`).
import { Duplex } from "node:stream";

export function createDuplexPair(): [Duplex, Duplex] {
  // Each side's write() pushes into the OTHER side's readable half - the
  // closures read `a` and `b` at call time, so the forward references are fine.
  const a: Duplex = new Duplex({
    read() {},
    write(chunk, _encoding, callback) {
      b.push(chunk);
      callback();
    },
    // end() on this side is push(null) on the other: that is how the far end
    // of a socket learns you have finished sending.
    final(callback) {
      b.push(null);
      callback();
    },
  });

  const b: Duplex = new Duplex({
    read() {},
    write(chunk, _encoding, callback) {
      a.push(chunk);
      callback();
    },
    final(callback) {
      a.push(null);
      callback();
    },
  });

  return [a, b];
}
