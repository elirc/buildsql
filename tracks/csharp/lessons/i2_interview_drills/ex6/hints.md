## Hint 1

`IEqualityComparer<T>` is how you tell a `HashSet`, a `Dictionary` or LINQ's
`Distinct` what "the same" means, without changing the type itself. Two methods,
and they must agree exactly as `Equals`/`GetHashCode` on a type must.

The definition of "same" here is: the email, trimmed, compared without regard
to case.

## Hint 2

Write a tiny private helper that produces the comparison key — `contact.Email.Trim()`
— and use it in both methods. That guarantees they cannot drift apart, which is
the usual bug.

```csharp
public bool Equals(Contact? x, Contact? y)
{
    if (x is null || y is null) { return ReferenceEquals(x, y); }
    return string.Equals(Key(x), Key(y), StringComparison.OrdinalIgnoreCase);
}
```

For the hash, `StringComparer.OrdinalIgnoreCase.GetHashCode(Key(obj))` — the
framework's comparer already knows how to hash case-insensitively, and hashing
`ToLowerInvariant()` yourself would allocate a string per lookup.

`DistinctPeople` is `new HashSet<Contact>(contacts, new EmailComparer()).Count`.

## Hint 3

The null handling matters: the framework really does call `Equals(x, null)`
while probing buckets, and a comparer that throws there crashes on real data.
`ReferenceEquals(x, y)` covers both "one is null" (false) and "both are null"
(true) in one line.

The interviewer's follow-up is usually *"why not just override `Equals` on
`Contact`?"* — because the type may not be yours to change, because a type has
only one definition of equality and this is one of several (by email, by id, by
name), and because a comparer keeps the policy at the point of use.

Left to you: LINQ's `Distinct` also takes a comparer, so `DistinctPeople` could
be `contacts.Distinct(new EmailComparer()).Count()`. Same answer; pick one and
know why.
