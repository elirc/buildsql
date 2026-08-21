## Hint 1

Three bodies to fill in, and the interesting one is `Withdraw`, because it has
to decide *before* it acts. Write it in that order: check, then change.

Notice the two different failure styles the prompt asks for. Not enough money
is an ordinary thing that happens to real accounts, so it is a return value.
A negative deposit is a bug in the calling code, so it is an exception.

## Hint 2

The constructor's job is to leave the object in a state where every other
method can assume things. Assign `Owner` from the parameter — a get-only
auto-property is assignable *inside the constructor*, which is exactly why that
form exists.

`Balance` has a `private set`, so `Balance += amount;` works inside the class
and `account.Balance = 100m;` does not compile outside it. That asymmetry is
the whole point of the exercise.

For the guards, copy the shape from lesson 02 ex4:

```csharp
if (amount <= 0m)
{
    throw new ArgumentOutOfRangeException(nameof(amount), amount, "...");
}
```

## Hint 3

`Withdraw` is:

```csharp
// guard against a non-positive amount, as Deposit does
if (amount > Balance)
{
    return false;      // and nothing else has happened yet
}
// take the money and report success
```

The ordering is the lesson. If you subtract first and check afterwards, there
is a moment where the balance is negative — and in real systems something else
reads it in exactly that moment. Decide what the invariant is ("balance is
never negative") and never let the object exist outside it.
