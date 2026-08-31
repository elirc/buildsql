## Hint 1

Load the student with their enrolments and each enrolment's course — two levels,
so two calls. Then one line switches between the two execution strategies.

Use `Include`/`ThenInclude`, not a projection: a projection would not show the
difference the gate is measuring.

## Hint 2

```csharp
var query = db.Students
    .Include(s => s.Enrolments)
    .ThenInclude(e => e.Course)
    .Where(s => s.Id == id);

query = split == true ? query.AsSplitQuery() : query.AsSingleQuery();
```

`AsSingleQuery()` is the default, so naming it explicitly is for the reader
rather than the compiler.

Then materialise, null-check for the 404, and sort the titles in memory — they
are already loaded, so there is nothing to gain from doing it in SQL.

## Hint 3

The reason `AsSplitQuery` exists is not this query — it is the one with **two**
collections on the same root. `Include(o => o.Lines).Include(o => o.Addresses)`
in a single query JOINs both, so ten lines and ten addresses come back as a
hundred rows, each repeating the order's columns. That is the cartesian
explosion, and splitting is the cure.

The caveat to know: split queries are not run in one transaction by default, so
another writer can change the data between them. That is why single query is
still the default.

Left for you: the sort, and deciding which you would ship for this shape. (One
collection, small: single.)
