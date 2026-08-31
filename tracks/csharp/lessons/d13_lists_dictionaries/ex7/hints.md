## Hint 1

The outer dictionary maps student -> inner dictionary; the inner maps
subject -> score. `Record` must get-or-create the inner one: try to fetch it,
and on a miss create it AND store it in the outer dictionary before writing
the score through it.

## Hint 2

`ScoreOf` chains two `TryGetValue` calls - the second only runs when the
first succeeded:

```csharp
return book.TryGetValue(student, out var subjects)
       && subjects.TryGetValue(subject, out int score)
    ? score : null;
```

## Hint 3

`SubjectAverage` never touches students who lack the subject: filter
`book.Values` with `ContainsKey(subject)`, project to the score as `double`,
and call `Average()`. Do not catch the empty case - `Average` throwing
InvalidOperationException is exactly the contract the gate asks for. The one
decision left: which level of the book you iterate to get there.
