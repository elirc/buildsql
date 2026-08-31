## Hint 1

Both records are declared for you. The two methods are one line each.

`Replate` is a `with` expression on a `Vehicle`-typed parameter. Before you
write it, predict what it returns when the argument is really a `Truck`.

## Hint 2

```csharp
public static Vehicle Replate(Vehicle vehicle, string plate) => vehicle with { Plate = plate };
public static int PayloadOf(Vehicle vehicle) => vehicle is Truck truck ? truck.PayloadTonnes : 0;
```

The answer to the prediction: you get a `Truck`. A record generates a
**protected virtual copy constructor**, and `with` calls it through the object,
so the most derived copy constructor runs and nothing is sliced off. Writing
the same thing by hand with `new Vehicle(...)` would silently lose the payload -
which is the bug this arrangement prevents.

The equality assertion is the other half. Record equality compares an
`EqualityContract` - a hidden protected property returning the runtime type -
*before* it compares components, so a `Vehicle` and a `Truck` with the same
plate and wheels are not equal. That is usually what you want, and it is why
records handle inheritance better than a hand-written `Equals` normally does.
