## Hint 1

`express()` builds an application object. You register routes on it and return
it - you do **not** call `listen()` here. That is the whole reason the factory
exists: the gate wants an app it can drive in-process, and a real `main.ts`
would call `createApp().listen(port)` itself.

Two routes, both GET, both answering with JSON.

## Hint 2

```ts
const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

return app;
```

`res.json(value)` serialises the value, sets `content-type: application/json`
and ends the response - the three lines you wrote by hand in lesson 08, in
one call.

The handler's first parameter is unused in both routes. Name it `_req` so it
is obvious that ignoring it is deliberate.

## Hint 3

The second route is the same shape with a different path and a different
value. The decision left to you is what to pass to `res.json` for `/orders` -
the array is already in the file, and the gate compares it exactly.

Do not add a 404 handler. Express already has one: any request that reaches
the end of the stack without a response gets a 404 from the built-in final
handler, which is why `DELETE /orders` and `GET /nope` both answer 404 without
you writing anything.
