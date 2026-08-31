## Hint 1

`: this(...)` after a constructor's parameter list runs another constructor of
the same class *before* this one's body. It is the class-level version of "do
not repeat yourself", and it means validation written once applies everywhere.

The cube constructor should have an empty body.

## Hint 2

```csharp
public Box(int side) : this(side, side, side)
{
}
```

The gate checks that `new Box(0)` throws, which only happens if the cube
constructor really delegates - a version that copies the three assignments
compiles, passes the ordinary tests, and silently skips the validation.

`Volume` and `IsCube` are computed, not stored: expression-bodied properties
(`=>`) that read the three fields every time they are asked. Storing them would
mean keeping them in step, and there is nothing to keep them in step with here
because the dimensions never change.
