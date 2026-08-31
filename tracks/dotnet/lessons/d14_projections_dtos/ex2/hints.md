## Hint 1

A nested collection is allowed *inside* a projection, and EF plans it together
with the outer shape. That is what makes "the name and the titles" one query
rather than two.

## Hint 2

`db.Directors.Where(d => d.Id == id).Select(d => new DirectorFilms(d.Name,
d.Films.OrderBy(f => f.Year).Select(f => f.Title).ToList()))` and then
`FirstOrDefaultAsync()`. A missing director projects to `null`, so the 404 is
just a null check - no separate existence query.
