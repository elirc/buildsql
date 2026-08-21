## Hint 1

Two bodies. The base one divides; the derived one adds a bonus to whatever the
base one produced.

That second sentence is the exercise. There is a way to say "whatever the base
one produced" without retyping the division, and using it means a change to the
pay formula happens in one place.

## Hint 2

`base.MonthlyPay()` calls the base class's version of the method you are
currently overriding — the one you would otherwise have replaced entirely.

The division needs rounding to the cent, exactly like lesson 01 ex4:
`Math.Round(value, 2, MidpointRounding.AwayFromZero)`. Keep it in `decimal`
throughout; this is money.

Note the constructor is already written and already says `: base(name, annualSalary)`.
Read it: that is how the base class gets the chance to initialise the state it
owns before your constructor body runs.

## Hint 3

```csharp
public override decimal MonthlyPay()
{
    return base.MonthlyPay() + MonthlyBonus;
}
```

Without `base.`, writing `MonthlyPay()` inside `Manager.MonthlyPay` would call
*itself*, and the stack overflow would tell you so within a second. That is a
mistake worth making once deliberately, in a scratch project, so you recognise
the exception when it happens for real.

The last check in the gate assigns the manager to an `Employee` variable and
calls the method again. Predict the answer before you run it.
