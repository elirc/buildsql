## Hint 1

An `init` accessor is a setter, so it can have a body, and that body can throw.
That is what makes object-initialiser syntax safe for a type with invariants: a
type with no constructor of its own can still refuse to be built badly.

`required` and `init` together give you "must be supplied" and "cannot be
changed afterwards".

## Hint 2

```csharp
public required int Guests
{
    get => _guests;
    init
    {
        if (value < 1)
            throw new ArgumentOutOfRangeException(nameof(value), "...");
        _guests = value;
    }
}
```

Note that `_guests` is `readonly` and this still compiles: an `init` accessor
is allowed to assign readonly fields, exactly as a constructor is.

`WithGuests` is an object initialiser copying the other members:

```csharp
return new Reservation { Name = Name, Guests = guests, Note = Note };
```

which gets the validation for free, because it goes through the same accessor.
That is the same shape a `record`'s `with` expression gives you automatically -
writing it by hand once is a good way to understand what `with` is doing.

Left to you: whether a bad value should throw or be clamped. Compare with ex4,
where clamping was right. The difference is that a volume knob has no wrong
answer and a table for zero people does.
