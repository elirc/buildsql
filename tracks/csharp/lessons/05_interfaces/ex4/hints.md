## Hint 1

Two bodies, both short. The constructor stores what it is handed; `Receipt`
asks its two collaborators for their answers and formats the result.

The rule to hold on to: `Checkout` must never say `DateTime.Now` and never say
`new SomethingDiscountPolicy()`. Everything variable arrives through the
constructor.

## Hint 2

The fields are already declared and already `readonly` — assign both in the
constructor and the compiler will stop anyone (including you) from repointing
them later.

The receipt is one interpolated string with a format specifier on the date:

```csharp
return $"{_clock.Now:yyyy-MM-dd}: {/* the discounted amount */}";
```

That colon inside the braces separates the value from its format string; it is
not the literal colon in the output, which comes after the closing brace.

## Hint 3

The amount comes from `_policy.Apply(amount)`, not from any arithmetic of your
own. If `Checkout` knew that a discount is "ten percent", the whole exercise
would be pointless — the interface exists so that the policy can be a flat
amount, a percentage, a loyalty table or nothing at all, without `Checkout`
changing.

Read the gate's little `FixedClock` and `TenOff` classes before you run it.
They are three lines each, they live in the test file, and they are the reason
this design is testable: a clock you can pin to a date, a policy that takes
exactly 10 off. Try to test a class that calls `DateTime.Now` directly and you
will understand why this pattern is everywhere.
