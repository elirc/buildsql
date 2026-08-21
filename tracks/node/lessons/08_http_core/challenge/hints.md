## Hint 1

Two structures and one algorithm.

The structures: a list of registered routes, each holding a method, the
pattern *already split into segments*, and the handler. Splitting at
registration time rather than per request is the small optimisation that also
makes the matching code readable.

The algorithm: for each route, does its segment list match the request's
segment list? Same length, and each pattern segment either starts with `:`
(matches anything, and records the value) or must be equal.

## Hint 2

Matching, as a function that returns the parameters or `null`:

```ts
function match(route: Route, segments: string[]): RouteParams | null {
  if (route.segments.length !== segments.length) return null;
  const params: RouteParams = {};
  for (const [index, pattern] of route.segments.entries()) {
    if (pattern.startsWith(":")) params[pattern.slice(1)] = segments[index];
    else if (pattern !== segments[index]) return null;
  }
  return params;
}
```

Then the dispatch loop has to do two things at once: find a route whose
*method and path* both match, and - if it does not find one - remember which
methods matched the path anyway. That set is the `Allow` header of the 405.

## Hint 3

```ts
const allowed = new Set<string>();

for (const route of routes) {
  const params = match(route, segments);
  if (params === null) continue;
  if (route.method === req.method) { route.handler(req, res, params); return; }
  allowed.add(route.method);
}

if (allowed.size > 0) { /* 405, with the Allow header */ return; }
/* 404 */
```

Two decisions left: what goes in the `Allow` header (the gate splits it on
commas, so `"GET, POST"` and `"GET,POST"` both pass) and where the segments
come from - remember `req.url` carries the query string, so the pathname has
to come out of a `URL` first or `/orders/42?expand=lines` will never match.
