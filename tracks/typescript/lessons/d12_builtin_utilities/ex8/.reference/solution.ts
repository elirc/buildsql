// d12_builtin_utilities / ex8 - reference solution (author only).

export type Status = "draft" | "open" | "paused" | "closed" | "archived";

export interface Posting {
  id: string;
  title: string;
  status: Status;
  internalNotes: string;
  recruiterEmail: string;
}

export type PublicPosting = Readonly<Omit<Posting, "internalNotes" | "recruiterEmail">>;

export function publish(postings: readonly Posting[]): PublicPosting[] {
  const published: PublicPosting[] = [];
  for (const posting of postings) {
    if (posting.status === "closed" || posting.status === "archived") {
      continue;
    }
    const { internalNotes, recruiterEmail, ...rest } = posting;
    published.push(rest);
  }
  return published;
}
