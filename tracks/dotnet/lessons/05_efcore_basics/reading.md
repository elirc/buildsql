# Reading - dotnet/05_efcore_basics

EF Core is two things wearing one name: a **query translator** that turns
expression trees into SQL, and a **change tracker** that turns object mutation
into `UPDATE` statements. Almost everything surprising about it comes from not
knowing which of the two you are currently talking to.

## Notes

**Deferred execution, and where the boundary is.** `db.Products.Where(...)` does
not query anything; it returns an `IQueryable<Product>`, which is an expression
tree plus a provider that knows how to translate it. The translation happens at
the terminal operator — `ToListAsync`, `FirstOrDefaultAsync`, `CountAsync`,
`AnyAsync` — and everything before that boundary becomes SQL. Everything *after*
it happens in your process, on rows already fetched. Being able to point at that
boundary in someone else's code is most of what "understanding EF" means.

**Client evaluation is now an error, and that is good.** In EF Core 2, a `Where`
the provider could not translate would be silently evaluated in memory, after
loading the whole table. Since EF Core 3 it throws instead, with a message
naming the expression it could not translate. Fixing it usually means calling a
translatable method (`EF.Functions.Like`), restructuring the predicate, or
deciding that this genuinely is client-side work and calling `AsEnumerable()` to
say so out loud.

**Parameterisation is automatic.** `Where(p => p.Name == name)` becomes
`WHERE "Name" = @__name_0` with the value bound, not interpolated — so LINQ
queries are structurally immune to SQL injection. The exception is
`FromSqlRaw("... " + input)`, which is exactly as dangerous as it looks;
`FromSql($"...{input}")` with an interpolated *FormattableString* is the safe
form, because EF turns the holes into parameters.

**The context is scoped, short-lived and not thread-safe.** One per request is
the rule, and it is enforced by `AddDbContext`'s default lifetime. Two concurrent
operations on one context throw `InvalidOperationException: A second operation
was started on this context instance before a previous operation completed` —
which in practice means you forgot an `await`, or you fanned out with
`Task.WhenAll` over the same context. For background work, resolve a fresh
context inside a fresh scope (lesson 02) or use `AddDbContextFactory`.

**Async all the way, for real reasons.** A database round trip is milliseconds
of doing nothing. `ToList()` parks a thread-pool thread for the duration;
`ToListAsync()` returns it to the pool. Under load the difference is the
difference between a service that scales and one that thread-pool-starves. The
rule "if there is an async version, use it, and await it" has almost no
exceptions in web code.

**`EnsureCreated` versus migrations.** `EnsureCreated()` builds the schema from
the current model in one shot and records nothing; it is for tests and throwaway
demos, and it cannot update a database that already exists. Migrations
(`dotnet ef migrations add`, `dotnet ef database update`) generate versioned,
reviewable, ordered deltas and a `__EFMigrationsHistory` table. Real projects use
migrations, apply them in a deployment step rather than at application startup,
and treat a migration as code that gets reviewed like any other.

## ex1 - projection is the whole lesson

`Select` before `ToListAsync` puts the projection *inside* the SQL:

```sql
SELECT "p"."Id", "p"."Name", "p"."PriceCents" FROM "Products" AS "p" ORDER BY "p"."Name"
```

`Select` after `ToListAsync` fetches every column of every row, materialises a
full entity graph, tracks all of it, and then throws most of it away in memory.
On five rows with four columns you cannot measure the difference. On a table
with a `text` blob column, or a hundred thousand rows, it is the difference
between a fast endpoint and an incident. It also stops entities leaking into
your response contract, which lesson 07 turns into a rule.

The ordering half is worth stating plainly because it catches people in every
language: **a `SELECT` without an `ORDER BY` has no defined order.** Not
"insertion order", not "primary key order" — undefined. It will often *look*
like primary key order on a small table, right up until the query planner picks
an index scan and it does not. If the order matters to your API, it is part of
your API and you write it down.

## ex2 - four ways to load one row

`FirstOrDefaultAsync` takes a predicate and returns `null` when nothing matches.
`FirstAsync` throws `InvalidOperationException`. `SingleOrDefaultAsync` returns
null for zero rows and *throws* for two — which makes it the right choice when
"more than one" would mean your data is corrupt, and the wrong one for a query
you expect to filter loosely. `FindAsync(key)` is different in kind: it checks
the change tracker first and only queries if the entity is not already loaded,
so it is the cheapest lookup by primary key and the only one that can return
without touching the database.

The 404 decision is the same one as lesson 01, and the reason to repeat it is
that the ORM makes the wrong answer easier: returning the nullable entity
directly gives a 200 with `null`, compiles fine, and pushes the problem onto
every caller.

## ex3 - what `SaveChangesAsync` actually does

On save, EF walks the change tracker, finds every entity whose state is Added,
Modified or Deleted, generates the corresponding `INSERT`/`UPDATE`/`DELETE`,
opens a transaction, executes them in dependency order, commits, and updates the
tracked entities with anything the database generated. That last step is why
`product.Id` is populated after the save and not before: the column is
`INTEGER PRIMARY KEY AUTOINCREMENT` and only the database knows the value.

The transaction is free and implicit, and it is the reason the unit-of-work
shape matters. Two `Add` calls and one `SaveChangesAsync` is atomic; two `Add`
calls each followed by its own save is not, and a failure in the middle leaves
half a change behind.

`Remove` requires a loaded entity because EF needs the key and, for concurrency
tokens, the original values. The pattern "load, check for null, remove, save" is
therefore also the pattern that gives you a free 404. (For bulk work, EF 7 and
later add `ExecuteDeleteAsync`/`ExecuteUpdateAsync`, which issue a single SQL
statement and bypass the change tracker entirely — much faster, and they do not
give you the 404.)

The validation-before-`Add` ordering matters more than it looks. `Add` on a
context whose request then returns 400 is usually harmless, because nobody
saves — but "usually" is doing work there, and any later code that calls
`SaveChangesAsync` for its own reasons would flush your rejected entity too.
Validate first, then touch the context.

## ex4 - the AsNoTracking trap

When EF materialises a tracked entity it stores a snapshot of every property in
the change tracker. `SaveChangesAsync` compares current values against that
snapshot; the differences become the `SET` clause of an `UPDATE`. That is why
you never call `Update()` on an entity you loaded, and why an untracked entity is
invisible to save: there is no snapshot, so there is nothing to compare, so EF
believes there is nothing to write.

The failure mode is the worst kind: *silent*. `changes` is 0, no exception is
thrown, no warning is logged, and the response looks fine because the in-memory
object really does have the new name. The bug surfaces later, as "the edit
didn't stick", usually from a user.

So when should you use `AsNoTracking()`? On every read-only query, and that is
most of them. It skips snapshotting, uses less memory, and is measurably faster
on large result sets. Note that a **projection** to a non-entity type
(`Select(p => new ProductSummary(...))`) is not tracked either — there is no
entity to track — which means ex1's query already had the benefit without asking
for it. `AsNoTracking` is for when you want whole entities and know you will not
change them.

The related trick worth knowing: `AsNoTrackingWithIdentityResolution()` gives you
untracked entities that still share instances for the same key, which matters for
graphs. Lesson 06 measures exactly that difference.

## challenge - paging, and the two queries you are allowed

`Skip((page - 1) * size).Take(size)` translates to `LIMIT`/`OFFSET`. Two things
to know about it. First, `OFFSET` gets slower as it grows, because the database
still walks the skipped rows; deep paging on a big table is a real problem, and
the professional answer is *keyset* (or "cursor") pagination — `WHERE Name >
@lastSeen ORDER BY Name LIMIT 20` — which stays fast at any depth and is what
"infinite scroll" APIs actually do. Offset paging is fine for a UI with page
numbers over a modest table, which is why it is still everywhere.

Second, `total` costs a second query. That is the honest price of "page 3 of 47"
and there is no way around it; APIs that cannot afford it return "has more" by
fetching `size + 1` rows and checking whether the extra one came back. Both
answers are defensible, and being able to name the trade is worth more than
knowing one of them.

The `size > 50` rejection is the security half. Any endpoint with a
caller-controlled result size and no cap has a denial-of-service switch on it,
and "nobody would do that" is not a control. Cap it, document the cap, and
return 400 rather than silently clamping — silently clamping means a client that
asked for 1000 and got 50 has no idea it is missing data.

## review1 - filter, order, limit, project

The one new operator is `ThenBy`, and it is there because ties in an ordering are
where non-deterministic APIs come from. Two products at the same price with no
tie-breaker can come back in either order, on either run, and the test that
depends on it will fail exactly once a month. Any `ORDER BY` that does not end
in something unique — a name, an id — is a flaky ordering waiting to happen.

`Take` before or after `OrderBy` is the other thing to be careful about: `Take`
first means "any three rows, then sort those three", which is almost never what
anyone wants. LINQ composes in the order you write it, and so does the SQL.

## Further reading

- [Entity Framework Core documentation](https://learn.microsoft.com/en-us/ef/core/) — the front door; the "Querying" and "Saving Data" sections cover this lesson.
- [Tracking vs. no-tracking queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking) — snapshots, identity resolution, and when to turn tracking off.
- [Saving data — basic save](https://learn.microsoft.com/en-us/ef/core/saving/basic) — `Add`/`Update`/`Remove`, `SaveChanges`, and what the return value means.
- [Migrations overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/) — what this course skipped, and how real schema changes ship.
- [Efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) — projection, paging, tracking and the round-trip habits that keep EF fast.
