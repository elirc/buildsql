## Hint 1

Three registrations, in order, and the order is the exercise:

1. `express.json()` - the built-in body parser. Without it `req.body` is
   `undefined`, because reading the body is a stream operation somebody has to
   perform (you did it by hand in lesson 08 ex3).
2. your logging middleware.
3. the `/echo` route.

`createApp` takes the log function as an argument rather than importing a
logger. That is dependency injection, and it is why the gate can assert on
what was logged.

## Hint 2

The logger cannot log when it runs. At that moment the status code is still
the default 200 and no handler has done anything. What you want is to register
a listener and let the request continue:

```ts
app.use((req, res, next) => {
  res.on("finish", () => { /* now the status is real */ });
  next();
});
```

`res` is a stream (lesson 06), and `"finish"` fires when the response has been
fully written. `req.path` is the path without the query string, and
`res.statusCode` is whatever was finally sent.

## Hint 3

```ts
res.on("finish", () => {
  log(`${req.method} ${/* which property? */} ${res.statusCode}`);
});
next();
```

Two decisions left: the middle field of the log line (the gate wants
`POST /echo 200`), and where in the stack this middleware goes. It has to run
for requests that match no route as well - which, as in lesson 09 ex3, means
`app.use` registered before the routes rather than after them.
