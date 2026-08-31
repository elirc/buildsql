// d20_satisfies_asconst / ex4 - a route table that publishes its paths.
// See lessons/d20_satisfies_asconst/README.md, "ex4".
//
// The stub annotates the array, so every path widens to string
// and the derived types say nothing.

export const ROUTES: readonly { path: string; method: "GET" | "POST" }[] = [
  { path: "/", method: "GET" },
  { path: "/users", method: "GET" },
  { path: "/users", method: "POST" },
];

export type RoutePath = (typeof ROUTES)[number]["path"];

export type RouteMethod = (typeof ROUTES)[number]["method"];
