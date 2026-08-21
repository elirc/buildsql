## Hint 1

`Select` gives you one output per input. `SelectMany` gives you *many* — you
hand it a lambda returning a sequence, and it concatenates all of them into one
flat sequence.

That is the entire first method. The second one needs to remember which
shipment each item came from, which the first one throws away.

## Hint 2

```csharp
shipments.SelectMany(shipment => shipment.Items)          // flat list of items
```

For the labelled version, the overload with two lambdas is what you want: the
first picks the inner collection, the second is handed the outer row and one
inner item together.

```csharp
shipments.SelectMany(shipment => shipment.Items, (shipment, item) => /* ... */)
```

The label format is the code, a colon, and the item, with no spaces.

## Hint 3

Notice what the empty shipment does: nothing. It contributes zero rows, so it
vanishes from the output rather than appearing as a blank. That is exactly an
INNER JOIN's behaviour, and it is not a coincidence — `SelectMany` over a
sub-collection *is* a join between a row and its children, which is how
`from a in as from b in a.Bs select ...` works in query syntax.

Left to you: `SelectMany` is also how you flatten `List<List<T>>`
(`lists.SelectMany(l => l)`), and .NET 6 added `Enumerable.Chunk` for the
opposite direction. Knowing both names saves you writing a nested loop.
