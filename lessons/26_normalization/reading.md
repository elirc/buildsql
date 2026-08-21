# Reading - 26_normalization

Normalization has a reputation for being academic, which is unfortunate,
because the whole of it fits in one sentence and the alternative fails in
ways that cost real money.

## Notes

**The one sentence.** *Every non-key column must state a fact about the key,
the whole key, and nothing but the key.* Audit each column against it:

- a fact about something other than the key → it belongs in another table
  (**1NF/2NF/3NF violations, respectively "not atomic", "part of the key",
  "another non-key column"**);
- a fact about the whole key → it stays.

That is third normal form. Boyce-Codd, 4NF and 5NF exist and matter
occasionally; 3NF handles almost everything you will meet.

**The three anomalies are the actual argument.** Normal forms are the rule;
these are the reasons.

- **Update anomaly**: a customer changes their name, and the fact is
  repeated on hundreds of rows. Update them all or the database now
  disagrees with itself — and "update them all" is a script that can die
  halfway.
- **Insertion anomaly**: you cannot record a customer who has not ordered,
  because the only place a customer exists is inside an order row.
- **Deletion anomaly**: deleting the last order erases your only record that
  the customer ever existed.

Each one is a *representable inconsistency*: the schema allows a state that
the business considers impossible. Normalization is the practice of making
those states unrepresentable.

**Denormalization is a real technique, and it comes second.** Duplicating
data for read speed — a cached count, a copied name, a wide reporting table
— is legitimate when you have measured a problem and when you control the
copy with a trigger, a materialized view (lesson 46) or a generated column
(lesson 24). What is not legitimate is *starting* denormalized because it
was convenient. Normalize first; denormalize deliberately, with the
duplication owned by something that cannot forget.

**Snapshots are not denormalization.** `order_items.price` copies the
product's price at order time, and it looks like duplication. It is not: the
price *at the time of the order* is a different fact from the product's
current price, and storing it is the only way to keep history correct.
Distinguishing "a copy of a fact" from "a different fact that happens to
have the same value today" is the judgement call at the centre of most
schema arguments.

**Natural versus surrogate keys.** `n_customers` uses `email` as its primary
key, which is a natural key — meaningful, human-readable, and *mutable*,
which is the problem: when somebody changes their email you have to cascade
the change through every referencing table. Surrogate keys (an integer
identity) never change, which is exactly their virtue and their weakness —
they carry no meaning, so a unique constraint on the natural key is still
required to prevent duplicates. Most production schemas use a surrogate
primary key plus a unique constraint on the natural one.

**JSONB and arrays sit in this conversation too.** A `tags text[]` column is
a 1NF violation by the strictest reading, and it is fine when nothing joins
against it or constrains it. The moment you want "which products have tag X,
with a guarantee that X exists", you have discovered why join tables exist.

## ex1 — the DDL

Three tables, and the keys are the design. `n_customers` keyed by email,
`n_orders` keyed by order id and referencing the customer, `n_lines` keyed
by the pair. Each key answers "what makes this row unique?" and each foreign
key answers "what must already exist for this row to make sense?".

## ex2 — the migration

`SELECT DISTINCT` for the customers, because they appear on many flat rows
and must land once. Parents before children, or the foreign keys stop you —
and being stopped is the constraint doing its job during your own migration,
which is a small preview of how much they are worth.

## ex3 — the update anomaly, cured

One row updated versus thousands. Run both counts and look at the ratio. The
effort argument is the easy one; the risk argument is the real one, because
a partially applied update leaves the database in a state that no query can
detect as wrong.

## ex4 — finish the job

The imperfection the lesson admitted, removed. Note the migration shape —
create, backfill, constrain, drop — because it is the same four steps as
lesson 28's safe ALTER patterns and the same shape as every expand/contract
migration you will ever run. The final step is the one that gets skipped; a
schema full of columns nobody reads is a schema whose migrations were never
finished.

## Further reading

- [Constraints](https://www.postgresql.org/docs/16/ddl-constraints.html) — the mechanical half of everything above; normalization without foreign keys is just filing.
- [`ALTER TABLE`](https://www.postgresql.org/docs/16/sql-altertable.html) — `ADD FOREIGN KEY`, `DROP COLUMN`, and what each one locks. Lesson 28 next.
- [Database Design — Normalization (Wikipedia)](https://en.wikipedia.org/wiki/Database_normalization) — the formal definitions, if you want the normal forms stated precisely rather than as a slogan.
- [Don't Do This](https://wiki.postgresql.org/wiki/Don%27t_Do_This) — read the "Database Encoding" and column-type sections again with a designer's eye.
