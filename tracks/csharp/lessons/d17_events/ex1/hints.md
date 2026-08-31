## Hint 1

An event with no subscribers is `null`, not an empty list, so `Boiled(this,
EventArgs.Empty)` throws the moment nobody is listening. The null-conditional
form is the idiom, and it is what the gate's first assertion is checking.

For the logic: the event fires on the *crossing*, so you need to know the
temperature before as well as after.

## Hint 2

```csharp
bool wasBoiling = _celsius >= 100;
_celsius += degrees;

if (!wasBoiling && _celsius >= 100)
{
    // raise
}
```

`?.Invoke(...)` also copies the delegate into a hidden local before calling it,
which is what makes the pattern safe when another thread could unsubscribe
between the check and the call - a detail that matters more than it looks.

Pass `EventArgs.Empty` rather than `new EventArgs()`: it is a shared, immutable
instance and allocating a fresh one every raise says something it does not
mean.
