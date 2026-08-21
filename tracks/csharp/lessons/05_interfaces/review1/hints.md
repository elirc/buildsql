## Hint 1

Three bodies: two implementations of the same one-method interface, and a
consumer that asks the interface for an answer without knowing which one it has.

`FlatRate` is the trivial one — deliberately, because it proves the consumer
really is indifferent.

## Hint 2

`ByWeight` charges 2 per kilogram *or part of a kilogram*, with a minimum of 2.
So 0 g and 1000 g both cost 2, and 1001 g costs 4.

Integer division rounds down, which is the opposite of what you need. The
standard trick for rounding an integer division up is to add one less than the
divisor first:

```csharp
int kilos = (weightGrams + 999) / 1000;
```

Then clamp the minimum so a zero-gram order still pays.

## Hint 3

`Order.TotalFor` is `goods + _rate.For(weightGrams)` and nothing else. No `if`,
no type test, no knowledge of which rate arrived.

The decision left to you is where the minimum charge belongs — inside
`ByWeight.For`, or as a `Math.Max` in `Order`. Put it in the rate: the order
should not know that one particular policy has a floor, or you will be editing
`Order` every time a policy gains a rule.
