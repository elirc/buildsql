## Hint 1

The pipeline is filter, group, order the teams, order inside each team,
project. Getting the filter first is what makes the all-negative team vanish
rather than appearing empty.

`Awarded` is one line, and the keyword is `with`.

## Hint 2

```csharp
members
    .Where(member => member.Points > 0)
    .GroupBy(member => member.Team)
    .OrderBy(group => group.Key, StringComparer.Ordinal)
    .Select(group => $"{group.Key}: " + string.Join(", ", group
        .OrderByDescending(member => member.Points)
        .ThenBy(member => member.Name, StringComparer.Ordinal)
        .Select(member => $"{member.Name}({member.Points})")))
```

`member with { Points = member.Points + extra }` produces a copy. The original
is untouched, and the copy is *equal* to the original when nothing changed -
records compare by value, which is exactly why they suit a domain value like
this one.

Mind the separators: `": "` after the team and `", "` between members.
