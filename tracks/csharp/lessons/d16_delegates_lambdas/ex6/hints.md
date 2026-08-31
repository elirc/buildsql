## Hint 1

One local variable, two lambdas, both mentioning it. That is the whole design.
The moment two lambdas use the same local, the compiler puts that local on a
single hidden object and gives both delegates a reference to it - so a write
through one is visible through the other.

Do not copy the balance into anything.

## Hint 2

```csharp
public static (Action<int> Deposit, Func<int> Balance) MakeAccount(int opening)
{
    int balance = opening;

    Action<int> deposit = amount => { /* guard, then balance += amount; */ };
    Func<int> read = () => balance;

    return (deposit, read);
}
```

The guard belongs *inside* the deposit lambda, because the lambda is the only
way anyone can reach `balance` - and it has to throw before the `+=`, so a
refused deposit leaves no trace.

Each call to `MakeAccount` runs the `int balance = opening;` line again, which
is what makes two accounts independent. If you find yourself reaching for a
static field to hold the balance, you have written a class the hard way.
