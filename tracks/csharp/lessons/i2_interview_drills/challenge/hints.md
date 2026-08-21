## Hint 1

Treat this like the real thing: read the whole specification first, write down
the rules, and only then start typing. There are four members and about eight
rules between them, and the ones people lose are the validation cases.

Order of attack that works: `Place` (storage plus validation), `TotalFor`,
`Dispose`, then `TopCustomers` last, because it is the only one that needs
thinking about.

## Hint 2

Storage: the dictionary field is already declared, keyed by id and holding the
customer and the lines. Ids are `$"ORD-{_nextId}"` with `_nextId` incremented
after use.

Validation order in `Place`: disposed first, then the customer, then the lines
being non-empty, then each line's quantity. Guard clauses, one per rule, in that
order — so the most fundamental problem is the one reported.

`TopCustomers` is lesson 11: group the stored orders by customer, sum
`Quantity * UnitPrice` across their lines, order by total descending with the
name as tie-break, take, and format `"name: total"`.

## Hint 3

Three details the gate checks and interviewers notice.

**`ObjectDisposedException.ThrowIf(_disposed, this)` at the top of every public
member.** Half-alive objects that quietly return empty results are worse than
ones that throw.

**The right exception per rule**: `ArgumentException` for a missing customer or
no lines, `ArgumentOutOfRangeException` for a bad quantity, `KeyNotFoundException`
for an unknown id. Using the precise type is free and tells the caller what to
fix.

**Copy the lines on the way in** (`lines.ToList()`). You were handed a
collection the caller still owns; if they mutate it afterwards, your stored
order changes underneath you. That single `ToList()` is the kind of thing a
senior interviewer looks for specifically.

Left to you: whether `Dispose` should clear the dictionary at all. It releases
nothing unmanaged, so the argument for it is "make the failure obvious"; the
argument against is that `IDisposable` is for resources, not for lifecycle. Have
an opinion ready — that question is the interview.
