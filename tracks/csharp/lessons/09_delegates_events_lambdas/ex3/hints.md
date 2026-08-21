## Hint 1

One method, three decisions in it: is this actually a change, what do the
subscribers need to know, and what happens when nobody is listening.

Take them in that order and the body writes itself. Note the order matters in
one more way — you need the *old* price for the event arguments, so capture it
before you overwrite it.

## Hint 2

The null-safe raise is the idiom to learn:

```csharp
PriceChanged?.Invoke(this, new PriceChangedEventArgs(oldPrice, newPrice));
```

An event with no subscribers is `null`, so a bare `PriceChanged(...)` would
throw. `?.Invoke` is the standard form, and by convention the first argument is
`this` — the object raising the event.

The "only when it changed" guard is an early `return` at the top.

## Hint 3

The shape:

```csharp
if (/* nothing changed */) { return; }

decimal oldPrice = Price;
Price = newPrice;
// tell whoever is listening
```

Raising *after* the state is updated is deliberate: a subscriber that reads
`ticker.Price` inside its handler should see the new value, not a half-applied
change.

Left to you: the thread-safe version of the raise copies the event to a local
first (`var handler = PriceChanged; handler?.Invoke(...)`), so that a
subscriber unsubscribing on another thread between the null check and the call
cannot cause a `NullReferenceException`. `?.Invoke` already does that copy for
you — which is one reason it is the recommended form.
