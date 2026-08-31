## Hint 1

Since C# 8 an interface member may have a body. Implementers that say nothing
about it inherit that body; implementers that declare their own win.

The feature exists so a library can add a member to a published interface
without breaking every existing implementer - which used to be impossible.

## Hint 2

```csharp
string Summary() => $"{Title}: {Rows.Count} row(s)";
```

inside the interface, and

```csharp
public string Summary() => $"{Title}/{Rows.Count}";
```

inside `TerseReport`.

The catch the gate is checking: a default interface member is **not inherited
into the class**. `new SalesReport(...).Summary()` does not compile - the
method is not a member of `SalesReport` at all - and you have to hold the
object as an `IReportable` to call it. That surprises everyone once, and it is
why default members suit versioning far better than they suit sharing code
between implementers (an abstract base class is still the tool for that).

Notice also that the default body reads `Title` and `Rows` - an interface
member can call the interface's other members, which is what makes the feature
useful at all.
