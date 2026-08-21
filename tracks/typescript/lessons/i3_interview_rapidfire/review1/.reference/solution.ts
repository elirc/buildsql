// i3_interview_rapidfire / review1 - reference solution (author only).

export type Method = "GET" | "POST";

export const ROUTES = {
  listLessons: { method: "GET", path: "/lessons" },
  submitAttempt: { method: "POST", path: "/attempts" },
} as const satisfies Record<string, { method: Method; path: string }>;

export function describeRoute(name: keyof typeof ROUTES): string {
  const route = ROUTES[name];
  return `${route.method} ${route.path}`;
}
