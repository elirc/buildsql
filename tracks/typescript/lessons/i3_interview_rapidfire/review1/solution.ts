// i3_interview_rapidfire / review1 - 60 seconds: satisfies, one more time.
// See lessons/i3_interview_rapidfire/README.md, "Review".

export type Method = "GET" | "POST";

export const ROUTES: Record<string, { method: Method; path: string }> = {
  listLessons: { method: "GET", path: "/lessons" },
  submitAttempt: { method: "POST", path: "/attempts" },
};

export function describeRoute(name: keyof typeof ROUTES): string {
  throw new Error("review1: describeRoute() is not implemented yet - edit this file.");
}
