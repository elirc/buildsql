## Hint 1

Three modifiers, three meanings:

- `virtual` - may be overridden.
- `sealed override` - overrides, and stops anyone below overriding again.
- `new` - does not override at all. It declares a *different* member with the
  same name, and which one you get depends on the type of the reference, not
  the type of the object.

`Strobe` cannot override `Kind`, because `Beacon` sealed it. `new` is the only
option left, and the gate is about what that costs.

## Hint 2

```csharp
public sealed override string Kind => "beacon";   // in Beacon
public new string Kind => "strobe";               // in Strobe
```

`Signals.KindOf` takes a `Signal` and reads `signal.Kind` - one line. Predict
its answer for a `Strobe` before running it: the reference is typed `Signal`,
`Signal.Kind` is virtual, the virtual table's entry for it was last filled by
`Beacon`, and `Strobe`'s member is not in that table at all. So the answer is
`"beacon"`.

That is why hiding a member is almost always a mistake in your own code: the
same object answers differently depending on how the caller happens to be
holding it. The compiler warns (CS0108) when you hide without saying `new`,
and writing `new` silences the warning without making the design better - it
only records that you meant it.
