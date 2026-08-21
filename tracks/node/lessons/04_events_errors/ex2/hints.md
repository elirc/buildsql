## Hint 1

Three outcomes, one callback, and a rule about *when*.

The outcomes: the text is not JSON at all; the text is JSON but has no numeric
`port`; the text is a usable config. The first two call the callback with an
error and nothing else, the third calls it with `null` and the config.

The rule about when: your callback must not run before `parseConfig` has
returned. The gate checks this by looking at the call log immediately after
calling you.

## Hint 2

`JSON.parse` throws on bad input, so it needs a `try`/`catch` - but the
`catch` must not rethrow. Turn the caught error into your own error and hand
it to the callback. That is the whole point of the convention: the caller has
no `try` around you, because you are asynchronous.

To tag an error with a code, either assign the property
(`Object.assign(new Error(msg), { code: "EPARSE" })`) or set it after
construction. Callers branch on `error.code`, never on message text, because
message text changes and codes do not.

To defer, wrap the whole body in `process.nextTick(() => { ... })` or
`queueMicrotask(...)`.

## Hint 3

The skeleton:

```ts
process.nextTick(() => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    callback(/* an Error tagged EPARSE */);
    return;                       // <- do not fall through
  }

  const config = parsed as Config;
  if (/* is there a numeric port? */) {
    callback(/* an Error tagged EMISSING, naming the field */);
    return;
  }
  callback(null, config);
});
```

Two decisions left: the port check (`typeof x === "number"` is stricter than
truthiness, and a port of 0 is a real value), and making sure exactly one
callback call happens on every path. Those `return`s after each callback are
the entire reason error-first code is full of them.
