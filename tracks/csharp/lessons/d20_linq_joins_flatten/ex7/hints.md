## Hint 1

Two joins chained: enrolments to students, then that result to courses. Each
join carries forward the fields the next stage needs, so an anonymous type in
between is the usual way to hold them.

Then read the two summaries again and notice which sequences each method is
given. They are not the same, and that is deliberate.

## Hint 2

```csharp
enrolments
    .Join(students, e => e.StudentId, s => s.Id, (e, s) => new { e.CourseId, e.Grade, s.Name })
    .Join(courses, r => r.CourseId, c => c.Id, (r, c) => new { r.Name, c.Title, r.Grade })
```

Order after both joins, over the finished rows.

## Hint 3

`CourseAverages` never receives the students, so it cannot filter on them - and
the gate builds one enrolment whose student does not exist but whose course
does. It counts. That is not a trap for its own sake: two figures on the same
report computed over subtly different populations is the most common real bug
in reporting code, and the only defence is to say out loud which rows each
number is over.

The average is integer division - `Sum / Count` truncates towards zero. Whether
that is the right rounding for a grade average is a decision somebody should
make on purpose; here the summary makes it for you.
