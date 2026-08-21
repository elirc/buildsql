## Hint 1

Sketch the loop before you write anything. You attempt, and one of three
things happens:

- it succeeds, and you return the value immediately;
- it fails and you have attempts left and the error is retryable, so you wait
  and go round again;
- it fails and either of those conditions is false, so you give up and throw.

Note "attempts: 3" means three calls in total, not three retries after the
first one - so the loop runs from 1 to `attempts`, and the *waits* happen
between them, which means there are only `attempts - 1` of them.

## Hint 2

The waiting helper you will want:

```ts
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
```

Exponential backoff means the delay doubles each time: `baseDelayMs`, then
`baseDelayMs * 2`, then `* 4`. With a 1-based attempt counter that is
`baseDelayMs * 2 ** (attempt - 1)`.

Keep the last error in a variable outside the loop. When you fall out of the
loop you have to throw *that* one - the caller wants to know what finally went
wrong, not what went wrong first.

## Hint 3

The skeleton:

```ts
let lastError: unknown;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    return await operation();
  } catch (error) {
    lastError = error;
    if (/* two reasons to stop */) break;
    await wait(/* how long this time? */);
  }
}
throw lastError;
```

Two decisions left: the stopping condition (there are two independent
reasons - reread the prompt) and the delay expression. If your gate run shows
the second attempt happening at 200ms instead of 100ms, you have an
off-by-one in the exponent; if it never happens at all, check that your loop
condition allows attempt numbers up to and including `attempts`.
