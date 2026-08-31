## Hint 1

The failure is not a bug in the query - the query is fine. It is that a `Film`
is not a wire shape. `FilmCard` already exists in `Model.cs` and names exactly
the four fields the contract promises.

## Hint 2

`Select` before `ToListAsync`, after the ordering:
`.Select(f => new FilmCard(f.Id, f.Title, f.Year, f.Director!.Name))`. Once
that is there the `Include` is dead - EF sees the navigation inside the
projection and joins for it, so delete the `Include` line too.
