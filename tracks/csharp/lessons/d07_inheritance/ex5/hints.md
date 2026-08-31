## Hint 1

`private` means "this class only" - a derived class cannot see it. `protected`
means "this class and anything derived from it". The field here is private and
the two mutators are protected, so `AuditedStock` can change the stock but only
through methods that enforce the rules.

`Ship` has to *read* what `Decrease` returned rather than assuming it worked.

## Hint 2

```csharp
public bool Ship(int amount)
{
    if (!Decrease(amount)) return false;
    Movements++;
    return true;
}
```

If you write `Decrease(amount); Movements++; return true;` the counter climbs on
refused shipments and the audit log lies - which is the failure the gate is
looking for.

`Receive` is simpler, because `Increase` cannot fail: call it, then count.

The design point worth taking away: `protected` is part of your public API. Any
member you mark protected is one you have promised to keep working for
subclasses you have never seen, so the smallest useful protected surface is the
right one. A protected *field* would have let `AuditedStock` write
`_units = -50` and every rule in `Stock` would be advisory.
