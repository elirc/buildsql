## Hint 1

`StockLowEventArgs` is an ordinary class that derives from `EventArgs` and has
get-only properties set in the constructor. That is all `EventHandler<T>` asks
of it.

`Ship` does three things in a fixed order. Work out what they are before you
write the method - one of them being out of place is the mistake this exercise
is built around.

## Hint 2

The order is: validate, mutate, raise.

```csharp
int remaining = Remaining(sku);
if (quantity > remaining) { throw new InvalidOperationException(...); }
remaining -= quantity;
_stock[sku] = remaining;
if (remaining < Threshold) { /* raise with the count that is LEFT */ }
```

Validating first is what makes a refused shipment leave no trace. Raising last
is what lets a handler call back into `warehouse.Remaining(sku)` and see the
number the event just told it about.

`Remaining` should use `TryGetValue` so an unknown SKU reads as zero rather
than throwing - `_stock[sku]` on a missing key is a `KeyNotFoundException`.
