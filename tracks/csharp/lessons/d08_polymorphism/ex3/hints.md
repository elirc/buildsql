## Hint 1

`Run` keeps a running amount and reassigns it once per adjustment. That is the
whole method, and the "no adjustments" case needs no special handling - the
loop simply does not run and the starting amount is returned.

Each `Apply` is one expression. `Math.Max` and `Math.Floor` do two of them.

## Hint 2

```csharp
decimal running = amount;
foreach (Adjustment adjustment in adjustments) running = adjustment.Apply(running);
return running;
```

The classic mistake is applying every adjustment to the ORIGINAL amount and
adding up the differences - which gives a different answer as soon as two
percentage steps are involved, and is why the gate runs the same two steps in
both orders.

`PercentOff` rounds to 2 dp away from zero, so its output is always a money
amount rather than a long tail of decimals; `RoundDownToWhole` uses
`Math.Floor`, which is *not* the same as `Math.Truncate` for negative numbers.
Since nothing here goes negative, either works - but know the difference, and
which one you meant.
