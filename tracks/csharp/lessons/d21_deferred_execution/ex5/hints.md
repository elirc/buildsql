## Hint 1

Both methods are short LINQ chains. The exercise is not writing them - it is
knowing, before you run the test, how many items each one will read.

`Where` and `Take` process one item at a time. `OrderByDescending` cannot
produce its first item until it has seen the last one.

## Hint 2

```csharp
numbers.Where(predicate).Take(count).ToList();
numbers.Where(predicate).OrderByDescending(n => n).Take(count).ToList();
```

The first stops as soon as `Take` has what it wanted, so ten items in the
source does not mean ten items read. Put a `.ToList()` in the middle of that
chain and you have thrown the property away.

The second cannot stop early no matter how it is arranged, because "largest"
is a question about the whole sequence. That is not a flaw to optimise around;
it is what the operator means, and knowing which operators are like that is the
actual content of this exercise.

The `Take(0)` case in the gate is worth predicting before you run it.
