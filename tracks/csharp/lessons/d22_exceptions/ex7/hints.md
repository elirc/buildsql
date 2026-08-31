## Hint 1

A loop from 1 to `attempts`, logging before each try. Inside, a `try` that
returns the operation's result and a `catch (TransientException)` that
remembers the failure and lets the loop go round again.

Anything that is not a `TransientException` must not be caught at all.

## Hint 2

```csharp
TransientException? last = null;

for (int attempt = 1; attempt <= attempts; attempt++)
{
    log.Add($"attempt:{attempt}");
    try { return operation(); }
    catch (TransientException ex) { last = ex; }
}

throw new InvalidOperationException($"gave up after {attempts} attempts", last);
```

`return` inside the `try` is what makes the loop stop at the first success -
no flag needed.

## Hint 3

Three details the gate checks separately.

`attempts` counts *total* tries, not extra ones, so `Run(op, 3, log)` calls the
operation at most three times and logs `attempt:1` through `attempt:3`.

The argument check happens before the loop, so a bad count logs nothing at all.
Validating inside the loop would already have attempted something.

And the give-up exception carries `last` as its inner exception. Getting that
wrong is the difference between a log entry that says "the payment gateway
returned 503 three times" and one that says "gave up", which tells the person
reading it nothing they can act on.
