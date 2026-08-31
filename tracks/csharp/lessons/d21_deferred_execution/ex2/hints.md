## Hint 1

Read the supplied version and count. `numbers.Count(predicate)` walks the
sequence once; `numbers.Where(predicate).Sum()` walks it again. Two passes, and
the predicate runs on every item both times.

You cannot fix that by rearranging LINQ operators. Both answers have to come
out of the same walk.

## Hint 2

Write the loop:

```csharp
int count = 0;
int total = 0;
foreach (int number in numbers)
{
    if (predicate(number)) { count++; total += number; }
}
return (count, total);
```

That is not a step backwards. LINQ is excellent at expressing one question and
poor at expressing two questions that must share a pass - and a reader of this
loop can see immediately that both numbers are over the same items, which is
exactly the property that goes missing when a report grows one query at a time.

`Aggregate` with a tuple state would also work if you would rather keep it in
one expression. Decide which one you would want to meet in a code review.
