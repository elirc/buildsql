## Hint 1

The mirror image of ex2. `.catch(fn)` is sugar for `.then(undefined, fn)`, and
the key fact is what a *rejection handler* does with its return value: returning
normally means "handled", and the promise `.catch` gives back is **fulfilled**
with that value.

That is why `try`/`catch` around an `await` recovers rather than rethrowing, and
it is the answer to the interview question "does `.catch` swallow errors?" — it
does, and that is the point.

## Hint 2

Once you see that, three of the four requirements are free: the fulfilled input
never reaches the handler, a returned promise is adopted, and a throw inside the
handler becomes a new rejection.

The fourth — the fallback receiving the reason — is just the handler's argument.
Decide whether you want `.catch` or the two-argument `.then`, and be ready to
say why one of them can accidentally catch an error thrown by its own success
handler while the other cannot.
