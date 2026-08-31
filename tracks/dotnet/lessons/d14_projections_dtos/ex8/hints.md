## Hint 1

Five numbers and a ranking in three queries means nothing may be counted in
memory. Split it the way the database would: one count of films, one grouped
aggregate over all screenings, one ranking query.

## Hint 2

`db.Screenings.GroupBy(s => 1).Select(g => new { Count = g.Count(), Sold =
g.Sum(s => s.Sold), SoldOut = g.Sum(s => s.Sold >= s.Seats ? 1 : 0) })` is the
idiom for aggregating a whole table in one row. `Sum(... ? 1 : 0)` is the
portable way to count a condition inside a group. Handle the empty-table case
(`FirstOrDefaultAsync` can return null).

## Hint 3

The ranking is a projection with `Sum` over the navigation:
`f.Screenings.Sum(s => s.Sold) * 100 / f.Screenings.Sum(s => s.Seats)`,
filtered by `f.Screenings.Any()`, then `OrderByDescending(...).ThenBy(t =>
t.Title).Take(3)` - all before `ToListAsync`, so three rows come back rather
than six. Integer division is not a bug here; it is the specified rounding.
