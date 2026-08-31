// d12_builtin_utilities / ex8 - Omit and Readonly, composed.
// See lessons/d12_builtin_utilities/README.md, "ex8".
//
// A public posting is not a whole posting, and it is not writable.

export type Status = "draft" | "open" | "paused" | "closed" | "archived";

export interface Posting {
  id: string;
  title: string;
  status: Status;
  internalNotes: string;
  recruiterEmail: string;
}

export type PublicPosting = Posting;

export function publish(postings: readonly Posting[]): PublicPosting[] {
  throw new Error("ex8: publish() is not implemented yet - edit this file.");
}
