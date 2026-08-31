## Hint 1

`Above` is the naive version and it is already right: write the obvious
`Where` that reads `threshold.Value`, and it will follow the object because the
lambda captured the object and the query runs afresh each time.

`AboveFixed` needs one extra line *before* the query.

## Hint 2

```csharp
int fixedValue = threshold.Value;
return numbers.Where(number => number > fixedValue);
```

The lambda now captures a local that nobody outside this method can reach, so
nothing can change it afterwards. The read of `threshold.Value` happened when
the method was called, which is what "fixed" means.

This is the same mechanism as the famous captured-loop-variable surprise, seen
from the useful side: a query that follows a mutable object is a genuinely good
tool when it is what you meant, and a very confusing bug when it is not. The
only way to tell them apart is to have chosen.
