## Hint 1

Both methods end with "take some of them", and both need an explicit ordering
first — otherwise "the first two" and "the top three" mean whatever order the
source happened to arrive in.

Page numbers start at 1, which means page 1 skips nothing.

## Hint 2

```csharp
orders
    .OrderBy(order => order.Id)
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
```

`Skip` past the end yields nothing rather than throwing, and `Take` more than
there are gives you everything — so neither edge case needs a guard.

`TopIds` orders by amount descending with the customer name as tie-break, takes
`count`, and projects the ids.

## Hint 3

Order **before** you take. `Take(3).OrderByDescending(...)` sorts three
arbitrary rows; `OrderByDescending(...).Take(3)` gives the three biggest. The
same mistake in SQL is putting `LIMIT` before you decide the `ORDER BY`, and it
produces plausible-looking wrong answers rather than errors.

The other habit worth carrying over from the SQL course: **paging without a
unique tie-break is unstable**. If two rows sort equally, nothing says which
page each lands on, so a row can appear on page 1 and again on page 2. Ordering
by the id here makes the paging deterministic; ordering only by amount would
not.

Left to you: what a caller passing `pageNumber = 0` should get. The gate never
asks. Silently returning page 1, returning empty, and throwing are all
defensible — pick one deliberately rather than by accident.
