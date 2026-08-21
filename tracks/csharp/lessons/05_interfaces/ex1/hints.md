## Hint 1

Four small bodies. Three of them are one expression each; the fourth is the
loop you have written twice already.

The interesting question is not how to write them but *why the two classes have
nothing in common*. A book and a subscription share no base class, no field, no
constructor — and `Basket.Total` still adds them up.

## Hint 2

`Book.Label` wraps the title in double quotes. Inside a C# string, a double
quote is written `\"`, so the interpolation is `$"\"{Title}\""`. (A raw string
literal, `$"""{Title}"""`, avoids the escaping if you prefer it.)

`Subscription.Price` multiplies the monthly amount by the number of months —
which is the point of a property computing rather than storing.

`Total` is `foreach` over `items`, accumulating `item.Price` into a `decimal`
starting at 0.

## Hint 3

```csharp
public static decimal Total(IEnumerable<IPriced> items)
{
    decimal total = 0m;
    foreach (IPriced item in items)
    {
        // add this one
    }
    return total;
}
```

Notice what `Total` cannot do: it cannot ask for `Title`, or `Months`, because
`IPriced` does not promise them. An interface is a *narrowing* — you trade
access to everything for the ability to accept anything.

One decision left: whether to write `foreach (var item in items)`. Both are
fine. Spelling the interface out is a useful reminder of what you are holding.
