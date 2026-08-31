## Hint 1

An explicit implementation names the interface in the declaration and takes no
accessibility modifier:

```csharp
string IPersistable.ToRow() => ...;
int IPersistable.Version => 2;
```

The member then does **not** exist on `Customer`'s own surface. Only code
holding an `IPersistable` reference can call it.

## Hint 2

The three reasons to reach for this are worth knowing, because interviewers ask:

1. **Keeping an infrastructure concern off the domain type's API**, which is
   this exercise. `customer.ToRow()` would invite ordinary code to serialise
   things by hand.
2. **Two interfaces declaring the same member** with different meanings - each
   gets its own explicit implementation.
3. **Implementing an old, awkward interface** (the non-generic `IEnumerable`,
   say) alongside the modern one without cluttering the type.

`Persistence.Save` takes `IPersistable`, so passing a `Customer` converts
implicitly and the members become reachable - no cast is needed at the call
site.

Note the cost: an explicit implementation on a *struct* is reached only by
boxing, and a caller who has your concrete type has to know to cast. That is a
real trade-off, not a free tidy-up.
