## Hint 1

A loop with a `try` inside it — not a `try` with a loop inside it. Each
iteration is one attempt.

Three ways out: the work returns (success), the work keeps throwing transiently
until the attempts run out (exhausted), or the work throws something else
(which is not yours to handle).

## Hint 2

```csharp
for (int attempt = 1; attempt <= maxAttempts; attempt++)
{
    try
    {
        return (attempt, work(), "ok");
    }
    catch (TransientException) when (attempt < maxAttempts)
    {
        // there are attempts left: fall out of the catch and loop again
    }
    catch (TransientException)
    {
        return (attempt, 0, "exhausted");
    }
}
```

The filter is doing the work: "transient AND there is another attempt" means
carry on; "transient and this was the last one" means report exhaustion.

Note there is no catch for anything else, which is what lets a real bug out.

## Hint 3

The gate counts how many times `work` was called, so an off-by-one shows up
immediately: `maxAttempts` of 3 means exactly three calls, and a fatal
exception means exactly one.

The empty-looking catch block deserves a comment rather than an apology — a
`catch` that deliberately does nothing is fine when the *filter* has already
said what it means, and unreadable when it has not.

Left to you: real retry policies wait between attempts, usually with
exponential backoff and jitter, and that is what Polly does for you in
production. Adding a delay here would make the gate slow and flaky, which is
its own lesson about testable design — the *policy* is what you unit-test, and
the clock belongs behind an interface, exactly as in lesson 05 ex4.
