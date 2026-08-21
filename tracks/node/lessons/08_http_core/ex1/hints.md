## Hint 1

`createHandler()` does no work itself: it returns the function Node will call
once per request. Everything you write lives inside that returned function,
which receives `(req, res)`.

A route is two facts about the request - `req.method` and `req.url` - and one
response. Write the three cases as three `if`s and a fallthrough, in the order
the README lists them.

## Hint 2

Sending a JSON response is three steps that always go together, so write them
once as a helper and call it three times:

```ts
function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(text);
}
```

`writeHead(status, headers)` sends the status line and the headers; `end(text)`
sends the body and finishes the response. Nothing is sent until one of them
runs, and nothing may be sent after `end`.

## Hint 3

```ts
return (req, res) => {
  if (req.method === "GET" && req.url === /* which path? */) {
    sendJson(res, 200, { status: "ok" });
    return;                                  // <- do not fall through
  }
  // ...the /orders case...
  sendJson(res, 404, { error: "not found" });
};
```

Two decisions left: the paths, and the `return` after each response. Without
them every request tries to send three responses and Node throws
`ERR_HTTP_HEADERS_SENT` on the second - which is the single most common
mistake in hand-written handlers, and worth causing once on purpose so you
recognise the message.
