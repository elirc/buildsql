## Hint 1

The order of events when you write `new Panel("Home")`:

1. `Panel`'s field initialisers run (there are none with values here).
2. The base constructor is entered: `Widget`'s field initialisers run - so
   `Trace` exists - and then `Widget`'s body runs.
3. `Panel`'s constructor body runs.

`Widget`'s body calls `Configure()`, which is virtual, so it lands on `Panel`'s
override - during step 2, before step 3 has assigned `_title`.

## Hint 2

Write the three methods exactly as described and let the trace tell you the
truth:

```csharp
protected Widget()
{
    Trace.Add("Widget ctor");
    Configure();
}
```

```csharp
protected override void Configure()
{
    Trace.Add("Panel.Configure sees title=" + (_title ?? "null"));
}
```

The `?? "null"` is doing real work: at the moment it runs, `_title` genuinely
is null, because `Panel`'s constructor body has not started.

This is why "do not call a virtual method from a constructor" is a standard
rule, and why the compiler cannot help you with it. The escape routes are: make
the method non-virtual, make the class sealed, or move the call to an
initialisation method the caller invokes after construction.
