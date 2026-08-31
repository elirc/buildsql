## Hint 1

Three levels, and only the innermost one is filtered. Every director appears,
every film appears, and only the *rooms* are narrowed to `sold < seats` - so
the `Where` sits on `f.Screenings` and nowhere else.

## Hint 2

Build the expression from the inside out: the room list
(`f.Screenings.Where(...).OrderBy(s => s.Room).Select(s => s.Room).ToList()`),
wrapped in `new SlateFilm(f.Title, ...)`, wrapped in
`d.Films.OrderBy(f => f.Title).Select(...).ToList()`, wrapped in
`new DirectorSlate(d.Name, ...)`.

## Hint 3

If Long Meridian or Vinyl Country disappear from your output, the filter has
crept outward: a `Where` on the films or a filtered `Include` changes which
rows *exist*, when the contract only asked which rooms are *listed inside* a
row that still has to be there.
