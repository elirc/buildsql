## Hint 1

Both methods are two loops, one inside the other, and in both the *bounds of
the inner loop depend on the outer loop's variable*. That dependency is the
whole idea.

For the triangle the inner bound is the row number. For the pairs the inner
loop starts at `i + 1`, which is what makes each unordered pair appear once.

## Hint 2

The separator rule from d02 ex4 comes back: the newline goes *between* rows, so
append it before every row except the first.

```csharp
for (int row = 1; row <= height; row++)
{
    if (row > 1) art.Append('\n');
    for (int column = 0; column < row; column++) art.Append('#');
}
```

A negative height needs no guard - `row <= height` is false immediately.

For `CountPairs`, `for (int j = i + 1; ...)` is the entire trick. Starting `j`
at 0 counts every pair twice and pairs each element with itself; starting at
`i` fixes the double-counting but still lets an element pair with itself. Say
out loud which positions the two loops are visiting before you write them.
