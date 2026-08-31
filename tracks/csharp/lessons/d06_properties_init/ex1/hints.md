## Hint 1

Three kinds of property appear in this one class:

- `CapacityMah` - get-only, set by the constructor;
- `ChargeMah` - `{ get; private set; }`, readable by anyone, writable only in
  here;
- `Percent` and `IsFull` - computed, storing nothing.

Clamping is `Math.Min` and `Math.Max`, one each.

## Hint 2

```csharp
ChargeMah = Math.Min(CapacityMah, ChargeMah + mah);
ChargeMah = Math.Max(0, ChargeMah - mah);
```

`Percent` has d01 ex2's trap in it: `ChargeMah * 100 / CapacityMah` in `int`
truncates, so 2 of 3 reads as 66 rather than 67. Multiply by `100.0` to move
into `double`, round away from zero, and cast back:

```csharp
(int)Math.Round(ChargeMah * 100.0 / CapacityMah, MidpointRounding.AwayFromZero)
```

The private setter is the design point worth noticing: `Charge` and `Drain` are
the only ways charge can change, so the clamping cannot be bypassed. A public
setter would let a caller write `battery.ChargeMah = -5` and every rule in the
class would be a suggestion.
