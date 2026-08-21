## Hint 1

State: a token count and the timestamp of the last refill, both in the closure
the factory creates. Per request: work out how many tokens have dripped in
since that timestamp, add them (capped), and then either spend one or refuse.

Say the difference from a fixed window out loud, because it is why an
interviewer asks for this one: a token bucket refills *continuously*, so it
smooths the rate instead of resetting on a boundary, and its capacity is
exactly the burst you are willing to allow.

## Hint 2

The refill is arithmetic, not a timer:

```ts
const time = options.now();
const gained = ((time - lastRefill) / 1000) * options.refillPerSecond;
tokens = Math.min(options.capacity, tokens + gained);
lastRefill = time;
```

Tokens are fractional, and that is fine - you spend one only when you have a
whole one. The `Math.min` is the cap, and it is the assertion the gate makes
after sixty idle seconds: sixty seconds of refill at one per second is sixty
tokens, but a bucket of capacity two holds two.

For the refusal, `Retry-After` is the time until one whole token exists:
`(1 - tokens) / refillPerSecond` seconds, rounded up, and never below 1.

## Hint 3

```ts
if (tokens < 1) {
  const seconds = /* until one token exists */;
  res.setHeader("retry-after", String(Math.max(1, Math.ceil(seconds))));
  res.status(429).json({ error: "too many requests" });
  return;
}

tokens -= 1;
res.setHeader("x-ratelimit-remaining", String(/* how many whole ones are left? */));
next();
```

Two decisions left, and both are checked precisely. Note the shape of the
answer to "how would you test this?" - the clock is an argument, so the gate
moves time by returning a different number. Any logic that reads
`Date.now()` directly is logic you cannot test without sleeping.
