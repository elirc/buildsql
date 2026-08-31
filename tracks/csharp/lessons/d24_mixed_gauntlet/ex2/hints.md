## Hint 1

`where T : IPriced` is what lets the method say `item.Price` while the caller
keeps their own type on the way out. No casting, no `object`, and `Cheapest`
returns a `Widget` when you hand it widgets.

For `PriceList`, decide first what a repeated name *means* here. The summary
says.

## Hint 2

`Cheapest` is a loop that keeps the best item seen so far; use a strict `<` so
the first of a tie wins, and a `bool found` flag rather than comparing against
`default(T)` - `T` might be a value type with no meaningful default.
`items.MinBy(item => item.Price)` is also a fair answer; check what it does
about the empty case before you rely on it.

`Total` is `items.Sum(item => item.Price)`, and `Sum` already returns zero for
an empty sequence.

`PriceList` uses the indexer:

```csharp
prices[widget.Name] = widget.Price;
```

`Add` would throw on the repeat and `ToDictionary` would too - which was the
right answer in d19, where a duplicate meant a broken assumption. Here the
overwrite is intended, and the indexer is how you say so.
