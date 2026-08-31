## Hint 1

`Run` is on the base class because both kinds do it - that part is ordinary
polymorphism. `MaxRetries` exists only on one subclass, so reading it needs a
runtime test.

`x is SomeType variable` tests and converts in one step, and the variable is in
scope for the rest of the expression.

## Hint 2

```csharp
lines.Add(job is RetryableJob retryable
    ? $"{job.Name} (retries {retryable.MaxRetries})"
    : job.Name);
```

The older shape - `if (job.GetType() == typeof(RetryableJob))` followed by a
cast - is worse in two ways: it needs the cast written twice, and it is false
for a class derived from `RetryableJob`, which `is` handles correctly.

Worth stopping on: this exercise deliberately shows the *acceptable* use of a
type test. Reaching for `is` because only some members of a hierarchy have a
capability is normal; reaching for it to work out behaviour that could have
been a virtual method (ex4's switch) is the smell. If `Describe` grew a third
and fourth special case, the right move would be a virtual `DescribeSuffix()`
on `Job` returning `""` by default.
