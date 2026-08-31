// d20_satisfies_asconst / ex4 - reference solution (author only).

export const ROUTES = [
  { path: "/", method: "GET" },
  { path: "/users", method: "GET" },
  { path: "/users", method: "POST" },
] as const satisfies readonly { path: string; method: "GET" | "POST" }[];

export type RoutePath = (typeof ROUTES)[number]["path"];

export type RouteMethod = (typeof ROUTES)[number]["method"];
