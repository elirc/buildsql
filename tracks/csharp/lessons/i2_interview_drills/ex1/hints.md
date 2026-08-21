## Hint 1

Say the rule out loud before you type: for each number, collect the words of
every rule that divides it, in rule order; if you collected nothing, use the
number itself.

That phrasing is already the algorithm, and it has no `if (n % 15 == 0)` in it
— which is the point of the twist. Hard-coding FizzBuzz stops working the
moment the interviewer adds a third rule.

## Hint 2

`Enumerable.Range(from, count)` generates the numbers; the count is
`to - from + 1`, and must not go negative.

For one number:

```csharp
string words = string.Concat(rules.Where(r => number % r.Divisor == 0).Select(r => r.Word));
return words.Length == 0 ? number.ToString() : words;
```

`string.Concat` over an empty sequence gives `""`, which is exactly the "no
rule matched" signal you need — no separate check for it.

## Hint 3

The classic interview follow-up is "now add a rule for 7" — and the answer
should be "pass another rule", with no code change at all. If your solution
cannot do that, it has the shape the question was testing for.

The second follow-up is usually "make it lazy" or "make it handle a billion
numbers". `Enumerable.Range` plus `Select` already is lazy; only the `ToList()`
at the end materialises. Returning `IEnumerable<string>` instead would let the
caller decide.

Left to you: whether to build the words with `string.Concat`, a
`StringBuilder`, or `string.Join("")`. All three are defensible; be ready to say
why you picked yours.
