## Hint 1

"Has no screenings" is a predicate over a navigation property, so it belongs in
`Where` - where the database can answer it - not in a `Count() == 0` over rows
you already loaded.

## Hint 2

`db.Films.Where(f => !f.Screenings.Any())`, then order by title and project
into `QuietFilm`. EF emits `NOT EXISTS (SELECT 1 FROM Screenings ...)`, which
stops at the first matching row instead of counting them all.
