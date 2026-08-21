## Hint 1

Four outcomes, and only three of them are things you write. The fourth —
"anything else" — is what you achieve by *not* writing a catch for it.

The two `TransientException` cases differ by a property on the exception, not
by its type. C# has a way to say that on the catch clause itself.

## Hint 2

An exception *filter*:

```csharp
catch (TransientException failure) when (failure.StatusCode >= 500)
{
    return "retry";
}
catch (TransientException)
{
    return "give up";
}
```

Order matters: the filtered clause must come first, or the unfiltered one
catches everything of that type and the filter never gets a look in.

The `try` block calls `work()` and then returns `"ok"`.

## Hint 3

You could write one catch and an `if` inside it. There is a real difference,
and it is worth knowing for interviews: a `when` filter is evaluated **before**
the stack unwinds, so if no clause matches, the exception continues from its
original throw point with the stack intact. Catching and rethrowing has already
unwound and, if you write `throw ex;` instead of `throw;`, has already reset the
stack trace.

Left to you: whether `"give up"` should be the filtered case instead
(`when (failure.StatusCode < 500)`), leaving the unfiltered clause for the
retryable one. Both work. Which reads better when a third status band appears?
