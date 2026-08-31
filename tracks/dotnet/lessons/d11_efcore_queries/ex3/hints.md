## Hint 1

The gate wants one SQL command, so the grouping and the arithmetic both have to
happen in the database. That rules out fetching the courses and grouping the
list.

LINQ's grouping operator translates — as long as what you project out of each
group is an aggregate, and as long as you project it into a shape EF is willing
to build.

## Hint 2

```csharp
var grouped = await db.Courses
    .GroupBy(c => c.Subject)
    .Select(g => new
    {
        Subject = g.Key,
        Courses = g.Count(),
        TotalCredits = g.Sum(c => c.Credits),
    })
    .OrderBy(t => t.Subject)
    .ToListAsync();
```

`g.Key` is the subject, and `Count`/`Sum` inside the projection become `COUNT`
and `SUM` in the `GROUP BY`.

Then map the two materialised rows onto `SubjectTotals` afterwards. That last
step is in memory and costs nothing — you are converting two rows, not a table.

## Hint 3

The reason for the anonymous type is worth knowing, because the error message is
long and the cause is not obvious: EF **cannot translate a group projection
whose aggregates are arguments to a constructor**. Writing
`.Select(g => new SubjectTotals(g.Key, g.Count(), …))` throws
`InvalidOperationException: The LINQ expression … could not be translated`.

Project into an anonymous type (or an object initialiser) inside the query, and
build the record after `ToListAsync`.

Worth knowing too: EF only translates a `GroupBy` you *aggregate*. Grouping and
then asking for the groups themselves cannot be expressed in SQL, and EF will
refuse rather than quietly doing it in memory — a deliberate change from the
days of silent client evaluation.

Left for you: the mapping step, and checking the command count is still one.
