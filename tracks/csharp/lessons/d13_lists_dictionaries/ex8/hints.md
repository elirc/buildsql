## Hint 1

One pass. For each position i, ask: "have I already seen the value
`target - numbers[i]`?" A dictionary from value -> the position it was FIRST
seen at answers that in constant time. If yes, you have your pair; if no,
record this value and move on.

## Hint 2

Order matters twice. Look up the complement BEFORE storing the current value
- that is what prevents position i from pairing with itself. And store only
the FIRST position of each value (guard with `ContainsKey`, or use `TryAdd`)
so `[1, 4, 1, 5]` pairs the 5 with the 1 at position 0.

## Hint 3

The skeleton, minus one line you decide:

```csharp
Dictionary<int, int> earliest = new Dictionary<int, int>();
for (int i = 0; i < numbers.Count; i++)
{
    if (earliest.TryGetValue(target - numbers[i], out int j)) { return (j, i); }
    // remember numbers[i] -> i, but only the first time
}
return null;
```

`HasPairSummingTo` should not repeat any of this - one call, one pattern test.
