## Hint 1

`Deconstruct` is a convention, not an interface: any method named `Deconstruct`
that returns `void` and takes only `out` parameters enables
`var (a, b) = thing;` on that type.

Overloads are chosen by *how many* variables the caller writes on the left, so
a two-part and a three-part version can happily coexist.

## Hint 2

```csharp
public void Deconstruct(out double latitude, out double longitude)
{
    latitude = Latitude;
    longitude = Longitude;
}
```

The three-part overload can call the two-part one and then fill in the extra:

```csharp
Deconstruct(out latitude, out longitude);
hemisphere = Latitude >= 0 ? "N" : "S";
```

Passing an `out` parameter straight through as another method's `out` argument
is legal and is the tidiest way to avoid repeating yourself.

The constructor validation is ordinary range checking - but note that the
bounds are *inclusive*, so `new Coordinate(90, 180)` must succeed. Off-by-one
at a boundary is the most common bug in validation code, and writing the test
case before the check is how you avoid it.
