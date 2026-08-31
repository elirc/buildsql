## Hint 1

Split on spaces (`StringSplitOptions.RemoveEmptyEntries`). For each token:
a number is pushed; an operator pops TWO values, computes, and pushes the
result. At the end, exactly one value may remain - that is the answer.

## Hint 2

Pop order is the classic trap: the first pop is the RIGHT operand (it was
pushed last), the second is the left.

```csharp
int right = stack.Pop();
int left = stack.Pop();
stack.Push(token switch { "+" => left + right, "-" => left - right, ... });
```

## Hint 3

You barely need to write error handling. `Pop` on an empty `Stack<int>`
already throws `InvalidOperationException`, which is the required behaviour
for "2 +" - so do NOT wrap it in try/catch. That leaves two checks of your
own: a token that is neither operator nor parseable int throws
`FormatException` (mention the token in the message), and after the loop a
stack whose `Count != 1` throws `InvalidOperationException`. Distinguishing
number from operator - `int.TryParse` versus matching the four operator
strings, and in which order - is the decision left to you.
