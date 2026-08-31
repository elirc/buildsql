# Reading - dotnet/d12_efcore_relationships

## Notes

A navigation property is a **relationship**, not a field that is always there.
EF gives you three ways to fill one — `Include`, a projection, or explicit
loading — and exactly none of them happen by default. A collection you did not
ask for is empty, not null and not lazily fetched, which is why "the author has
no books" is the single most common first bug in this area.

The second idea is that **a foreign key and a navigation are two views of the
same thing**. Setting `book.AuthorId = 1` and setting `book.Author = ada` do the
same work; the FK is enough when you already have the id, and it saves a query.

The third is that relationships have **behaviour**, not just shape. A required
relationship cascades on delete by convention. A many-to-many keeps a join table
you never named and never query directly. Knowing what EF does for you here is
most of what separates a working data layer from a surprising one.

## ex1

Three ways to load the "many" side, and this exercise uses the one that fetches
least: **project the collection**. `a.Books.Select(...)` inside a `Select`
becomes part of the SQL, so you get exactly the columns you named and nothing is
tracked.

`Include(a => a.Books)` is the other route and is right when you need the
entities themselves — to change them, or because you are going to save.

The classic mistake is neither: a plain `FirstOrDefaultAsync` and then reading
`author.Books`, which is an empty list and no error at all. Lazy loading would
have papered over it, which is exactly why it is off by default.

## ex2

The join table exists in the database and not in your model, and `SelectMany`
over the skip navigation walks it in whichever direction you start from.
`db.Books.Where(…).SelectMany(b => b.Genres)` and
`db.Genres.Where(…).SelectMany(g => g.Books)` are the same table, read two ways.

The design decision worth noticing is the 404s. A book with no genres is a 200
with `[]`; a book that does not exist is a 404 — the same empty-versus-missing
rule as everywhere else, and the reason the model answer checks existence
separately before projecting.

## ex3

Setting `AuthorId` is enough. The navigation property is optional sugar: EF fixes
it up when both ends are tracked, and skipping it saves loading the author at
all.

The model answer still checks the author exists, and the reason is the error
message. Inserting with an author id nobody has produces a foreign-key violation
— a `DbUpdateException` wrapping a provider-specific message, which is a 500
that tells the caller nothing. One `AnyAsync` turns it into a 404 that does.

The other route is `author.Books.Add(book)` on a loaded author, which is
natural when you already have the parent in hand.

## ex4

`Review.BookId` is a non-nullable `int`, so EF makes the relationship required,
and a required relationship is **cascade delete** by convention: deleting the
book deletes its reviews, and the join rows go with it.

Two things to know before relying on it. The database enforces this only if the
FK was created with `ON DELETE CASCADE` — EF's migrations do that, and on SQLite
the provider turns foreign keys on for you. And EF *also* cascades in the change
tracker for children it has loaded, which is why a delete can behave differently
depending on what happened to be in memory.

Make the FK nullable and the convention changes to `ClientSetNull`: the children
survive with a null parent. Neither default is wrong; the point is to have
chosen. `OnDelete(DeleteBehavior.Restrict)` is the third option, and it is the
right one whenever "delete this and everything under it" should require a human
to say so twice.

## ex5

Filtered include — `Include(b => b.Reviews.Where(...))` — has been available
since EF Core 5, and the projection form used here does the same job with less
ceremony. Either way the filter is in the SQL, so the rows that did not qualify
never cross the wire.

The classic mistake is loading the collection and filtering the materialised
list. Identical JSON, and every review of every book fetched — which is fine at
six rows and ruinous on a book with ten thousand.

The restriction worth knowing about filtered includes: they can only use
`Where`, `OrderBy`, `Skip` and `Take`, and the *same* navigation must be
filtered identically everywhere in one query, or EF throws.

## ex6

Two hops and an aggregate, in one query. `a.Books.SelectMany(b => b.Reviews)`
inside a projection translates into a correlated subquery, so the database does
the averaging and three rows come back.

Two details do the work. The **left join**: starting from `Authors` means Linus
appears with zero books, where starting from `Reviews` and grouping would have
dropped him — and "the customer who has never ordered" is the classic instance of
that bug. And the **nullable average**: `Average(r => (double?)r.Stars) ?? 0`,
because averaging an empty set throws, exactly as in d11 ex4.

## ex7

A projection with a collection inside a collection is still one query. EF sends
the JOINed rows and reassembles the object graph on the way back — you do not
have to choose between "one query" and "the shape I actually want".

The classic mistake is the readable-looking loop: fetch the authors, then for
each one fetch the books, then for each book fetch the genres. That is the N+1
squared, and it looks fine in a test with three authors.

The caveat that connects this to d11 ex7: JOINing two collections at the same
level multiplies rows, so a wide projection can move a surprising amount of data
even in one round trip. One query is usually right; `AsSplitQuery` is the escape
hatch when the multiplication gets out of hand.

## ex8

Replacing a many-to-many set is `Clear()` then `AddRange()`, and EF works out
which join rows to insert and which to delete. That only works if the current
set was **loaded** — `Include(b => b.Genres)` — because there is nothing to clear
otherwise, and a `Clear()` on an unloaded collection silently removes nothing.

The order matters as much as the mechanics: validate every name *before*
clearing. Clearing and then discovering an unknown genre leaves the book with no
genres and the caller with a 400, which is the worst of both.

The design decision is refusing to invent a genre. A `PUT` that creates
vocabulary on the fly means one typo becomes a permanent tag that nothing else
uses — the classic failure of free-text tagging systems. A 400 quoting the name
is friendlier than it looks.

## Further reading

- [Relationships in EF Core](https://learn.microsoft.com/en-us/ef/core/modeling/relationships) — conventions for one-to-many, many-to-many, and what a required FK implies.
- [Loading related data](https://learn.microsoft.com/en-us/ef/core/querying/related-data/) — eager, explicit and lazy loading, and filtered includes.
- [Cascade delete](https://learn.microsoft.com/en-us/ef/core/saving/cascade-delete) — the conventions, the database side, and `DeleteBehavior`.
- [Many-to-many relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/many-to-many) — skip navigations and the join entity you did not write.
- [Efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) — projections over includes, and the cost of JOINing two collections.
