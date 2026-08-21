# Reading - dotnet/06_efcore_relationships

Every ORM's hard problem is the same one: objects are a graph and tables are
sets, and something has to decide how much of the graph a given query drags
along. EF Core's answer is "nothing you did not ask for", which is safe,
explicit, and the source of both the empty-collection surprise and the N+1.

## Notes

**Conventions do the wiring.** A property called `CustomerId` alongside a
navigation called `Customer` is enough for EF to infer a required one-to-many
with `Customer` as the principal and `Order` as the dependent. Make the FK
`int?` and the relationship becomes optional, with `ON DELETE SET NULL` instead
of cascade. Everything conventions infer can be overridden in `OnModelCreating`
with the fluent API — `HasOne(...).WithMany(...).HasForeignKey(...)` — and in a
real project you will, for delete behaviour and indexes if nothing else.

**Many-to-many without a join entity.** Since EF Core 5, two collection
navigations pointing at each other produce a join table EF manages itself, and
the navigations are called *skip navigations* because they skip over it. The
moment the relationship needs a payload of its own — a quantity, a date added,
a role — you promote it to a real entity with two one-to-many relationships, and
the skip navigations become optional sugar on top.

**Split queries.** `Include`ing two collections at once produces a cartesian
product: an order with 3 lines and 4 tags returns 12 rows, and EF de-duplicates
in memory. On wide rows that is real waste, and `AsSplitQuery()` tells EF to
issue one `SELECT` per collection instead — more round trips, far less data.
Neither is universally right, which is why it is a per-query decision. Knowing
the phrase "cartesian explosion" and what to do about it is a good interview
answer.

**Filtered includes.** `Include(c => c.Orders.Where(o => o.IsOpen))` works and
is often what you actually wanted; without the filter you have loaded every
order a customer has ever placed in order to show the three open ones.

**`ExecuteUpdate` / `ExecuteDelete`.** EF 7 added bulk operations that compile to
a single `UPDATE … WHERE` or `DELETE … WHERE` with no loading and no change
tracking. They are dramatically faster for "close all orders older than a year"
and they bypass everything the change tracker would have done — including
concurrency tokens and `SaveChanges` interceptors. Use them deliberately.

**Counting queries is a real technique.** The `CommandCounter` in this lesson's
gate is thirty lines of `ILoggerProvider`. The production versions of the same
idea are EF's `LogTo`, the `Microsoft.EntityFrameworkCore.Database.Command`
category at Information level, and OpenTelemetry spans per command. Putting an
assertion on query count around a hot endpoint is one of the highest-value tests
a team can write, because N+1 regressions are invisible in every other kind of
test.

## ex1 - navigations are empty until you ask

The first time you write this without `Include`, `customer.Orders` comes back as
an empty list and nothing complains. That is worth sitting with, because it is
the shape of a whole family of bugs: EF is not lying to you, it is telling you
about the rows it loaded, and it loaded one row from `Customers`. The empty list
is the truthful answer to a question you did not ask.

Contrast that with lazy loading, which would have silently issued a second query
when you touched `.Orders` — correct output, hidden cost. Off by default is the
right default, and the reason is that "correct but mysteriously slow" is harder
to find than "obviously empty".

The 404-versus-empty-list decision returns from lesson 01, now with a cleaner
test for it: does the *thing named in the URL* exist? `/l06/customers/99` names
a customer that does not exist, so 404. `/l06/customers/3` names one that does,
whose collection happens to be empty, so 200 and `[]`. Linus is in the seed data
precisely to force you to write that distinction.

## ex2 - one join table, two directions

`SelectMany` is the LINQ operator for "walk a collection navigation and flatten
the result", and it is what a `JOIN` looks like from the object side.
`db.Products.Where(p => p.Id == id).SelectMany(p => p.Tags)` becomes a join
through the hidden `ProductTag` table to `Tags`, and the mirror-image query
becomes the same join read the other way. You never named the join table, and if
you look at the generated SQL you will see it there.

The `AnyAsync` existence check before the real query is a second round trip, and
it is worth being clear-eyed about why it is there rather than defending it as
free. An empty list is ambiguous — no tags, or no product — and the API has to
disambiguate. The single-query alternative is to load the product with
`Include(p => p.Tags)` and check for null, which trades a round trip for
loading a row you do not need. Both are defensible; what is not defensible is
returning `[]` for a product that does not exist.

## ex3 - the N+1, named and killed

The shipped implementation is nine queries for four orders: one for the list,
then a customer lookup and a lines lookup per order. Scale that to a page of 50
orders and it is 101 round trips. At a millisecond each on a LAN — optimistic —
that is a tenth of a second of pure latency for a query the database could
answer in one.

The rewrite is one `Select`, and what makes it work is that everything inside it
is an *expression*, translated rather than executed:

```sql
SELECT "o"."Id", "c"."Name",
       (SELECT COUNT(*) FROM "OrderLines" AS "l" WHERE "o"."Id" = "l"."OrderId"),
       (SELECT COALESCE(SUM("l"."Quantity" * "l"."UnitPriceCents"), 0) FROM "OrderLines" …)
FROM "Orders" AS "o"
INNER JOIN "Customers" AS "c" ON "o"."CustomerId" = "c"."Id"
ORDER BY "o"."Id"
```

Four rows, four columns, one round trip, and the arithmetic done by the engine
that is holding the data. If you did the SQL course, this is the same lesson
from the other side: the fastest way to move data is not to move it.

Two things to watch for when you write it. `o.Customer!.Name` needs the
null-forgiving `!` because the navigation is declared nullable, but nothing is
dereferenced at runtime — it is an expression tree, and the `!` is purely a
message to the compiler. And the projection must stay inside the `IQueryable`;
one stray `ToListAsync()` before the `Select` and you are back to loading
everything.

## ex4 - the identity map

A tracked query keeps a dictionary from (entity type, primary key) to object.
When a row for `Customer` id 1 comes back a second time — as the parent of a
second order, say — EF finds the existing instance and reuses it rather than
materialising a new one. That is the identity map, and it is what makes
`ReferenceEquals` return true.

Three consequences worth carrying:

- **Consistency.** In a tracked graph there is exactly one object per row, so an
  edit is visible everywhere that row appears. Untracked, you can hold two
  copies of the same customer with different values and save neither.
- **Memory.** A tracked query over 10,000 order lines materialises each distinct
  product once. The same query untracked materialises one product object per
  line. For read-heavy endpoints over wide graphs that difference is measurable.
- **The middle option.** `AsNoTrackingWithIdentityResolution()` gives you the
  de-duplication without the change tracking, at the cost of maintaining the map.
  It exists exactly for "read-only, but I care about the graph".

So the rule of thumb is not "always use AsNoTracking". It is: no-tracking for
read-only queries that project or return flat lists; tracking when you intend to
save; identity resolution when you want a coherent read-only graph.

## challenge - the aggregate, and why it would not translate

The interesting failure in this exercise is not the SQL, it is the LINQ
provider. This does not translate:

```csharp
.Select(c => new CustomerSpend(c.Id, c.Name, total))
.OrderByDescending(s => s.TotalCents)     // ← s is a CustomerSpend, in memory
```

EF has to turn `OrderByDescending` into `ORDER BY`, and to do that it must map
`s.TotalCents` back to a column or expression. It cannot see inside your
record's constructor, so the whole tree becomes untranslatable and you get an
exception naming the expression. Project to an **anonymous type** instead — EF
does know how to look inside those — sort, take, and build the record in memory
afterwards. That is a genuinely useful piece of EF folklore.

The other half is the left join. `db.Customers.Select(c => … c.Orders …)` starts
from customers, so a customer with no orders still produces a row, with a sum
of 0. Starting from orders and grouping by customer — the more obvious way to
write it — silently drops Linus, and reports that are missing the zero rows are
a bug that survives review remarkably often, because the numbers that *are* there
are all correct.

## review1 - two hops in one projection

`l.Product!.Name` from an `OrderLine` is a single join, and putting it inside the
`Select` means the product's name is a column in the result rather than a
`Product` entity you loaded and then read one field from.

The trap this exercise sets is the ordering, and it is the same one the challenge
sets: `OrderBy` has to come *before* the projection into `LineDetail`, or the
provider cannot translate it. Ordering by `l.Product!.Name` on the entity side
translates to `ORDER BY "p"."Name"`; ordering by `l.ProductName` on the record
side does not translate at all. Order first, project last.

## Further reading

- [Relationships in EF Core](https://learn.microsoft.com/en-us/ef/core/modeling/relationships) — conventions, foreign keys, navigations and the fluent overrides.
- [Loading related data](https://learn.microsoft.com/en-us/ef/core/querying/related-data/) — eager, explicit and lazy loading, filtered includes, and `ThenInclude`.
- [Single vs. split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries) — the cartesian explosion and `AsSplitQuery`.
- [Efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) — projection, N+1, buffering and the round-trip habits.
- [Many-to-many relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/many-to-many) — skip navigations, the implicit join entity, and when to make it explicit.
