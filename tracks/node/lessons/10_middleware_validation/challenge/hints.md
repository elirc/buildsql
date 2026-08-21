## Hint 1

State: one bucket per key, holding a count and the moment the window started.
A `Map<string, {count, start}>` in the closure the factory creates - the same
closure-state pattern as every other factory in this course.

Per request: work out the key, read the clock **once** (call `options.now()`
one time and use that value throughout, or your comparisons can disagree with
each other), find or create the bucket, and decide.

## Hint 2

A fixed window resets when the clock has moved past `start + windowMs`:

```ts
const bucket =
  existing === undefined || time - existing.start >= options.windowMs
    ? { count: 0, start: time }   // a new window begins now
    : existing;
```

Then two paths. Over the limit: set `retry-after` (in **seconds**, rounded
up, from `start + windowMs - time`) and answer 429. Under it: increment,
set `x-ratelimit-limit` and `x-ratelimit-remaining`, and `next()`.

The key is the `x-api-key` header when it is a string, and `"anonymous"`
otherwise - remember a header can arrive as an array.

## Hint 3

```ts
if (bucket.count >= options.limit) {
  const msLeft = /* how long until this window ends? */;
  res.setHeader("retry-after", String(Math.ceil(msLeft / 1000)));
  res.status(429).json({ error: "too many requests" });
  return;
}

bucket.count += 1;
res.setHeader("x-ratelimit-remaining", String(/* how many are left? */));
next();
```

Two decisions left, and both are arithmetic the gate checks precisely: the
milliseconds remaining (60 seconds at the start of a fresh window, 30 after
half of it has passed) and the remaining count *after* this request is
counted - the first of three leaves 2, not 3.

One honest caveat about the design: a fixed window lets a client send `limit`
requests at the end of one window and `limit` more at the start of the next -
twice the intended rate in an instant. Sliding windows and token buckets fix
that, and knowing why this simple version is not enough is worth as much as
the code.
