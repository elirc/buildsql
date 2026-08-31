## Hint 1

A derived constructor cannot set the base class's get-only properties directly
- it has to ask the base constructor to do it, with `: base(...)` after the
parameter list.

`Play` is `abstract` in the base, which means the base has no body for it and
every concrete subclass must supply one with `override`.

## Hint 2

```csharp
public Guitar(int strings) : base("guitar")
{
    Strings = strings;
}
```

The base constructor runs first, then this body. `Drum` needs the same
`: base("drum")` even though its own body is empty - a derived constructor that
says nothing calls the base's parameterless constructor, and `Instrument` does
not have one.

`Announce` is written for you and is not virtual, yet it produces different
text for a guitar and a drum. That is the whole idea: a non-virtual method
calling a virtual one is how a base class defines a shape and lets subclasses
fill in the holes.
