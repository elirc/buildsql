## Hint 1

Two aggregates over the same filtered set, and neither of them should
materialise an enrolment. Build the filtered query once and ask it two questions.

One of the two questions has no answer when the set is empty. Run the gate's
Rhetoric case and see what happens.

## Hint 2

```csharp
var enrolments = db.Enrolments.Where(e => e.CourseId == id);

int enrolled = await enrolments.CountAsync();
double average = await enrolments.Select(e => (int?)e.Score).AverageAsync() ?? 0;
```

The cast to `int?` is the whole trick: averaging a nullable lets the database's
`NULL` come back as `null`, where averaging an `int` over no rows throws
`InvalidOperationException`.

The same applies to `MaxAsync` and `MinAsync`, and it is a very common way for a
reports endpoint to 500 on the first day of a month.
