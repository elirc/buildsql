## Hint 1

Three bugs to avoid, and the fixed version is three lines. Name each bug before
you write anything:

1. blocking on `.Result` instead of awaiting;
2. accepting a `CancellationToken` and never looking at it;
3. `catch (Exception) { return 0; }` — a failure reported as a valid answer.

## Hint 2

```csharp
token.ThrowIfCancellationRequested();

int[] counts = await Task.WhenAll(pages).WaitAsync(token);
return counts.Sum();
```

The first line handles "already cancelled — do nothing". The `WaitAsync(token)`
handles "cancelled while we were waiting". And there is no `catch` at all, which
is what lets a failing page reach the caller.

## Hint 3

Bug 3 is the one candidates defend and should not. Returning 0 from a failed
total means the caller cannot tell "no pages" from "the database was down", and
the report goes out with a zero in it. If you cannot handle a failure, let it
travel to somebody who can.

Be ready for *"why not just `catch` and log?"* — because logging is not
handling: the caller still gets a wrong answer. Log **and rethrow**, or do not
catch.

Left to you: whether `ThrowIfCancellationRequested` at the top is redundant
given the `WaitAsync`. It is not quite — `WhenAll` over already-completed tasks
can finish before the token is ever consulted, and the gate checks that an
already-cancelled request does no work. Being able to explain that distinction
is worth more than the line itself.
