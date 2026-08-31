// d15_readable_writable / ex8 - a socket pair with no socket.
// See lessons/d15_readable_writable/README.md, "Problem 8".
import { Duplex } from "node:stream";

/**
 * Two Duplex streams wired to each other: what is written to one is readable
 * from the other, in both directions, and ending one side ends the other
 * side's readable half.
 */
export function createDuplexPair(): [Duplex, Duplex] {
  throw new Error("ex8: createDuplexPair() is not implemented yet - edit this file.");
}
