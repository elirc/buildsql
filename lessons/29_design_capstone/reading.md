# Reading - 29_design_capstone

Part 4 in one exercise: prose in, schema out. The spec never says "foreign
key", "CHECK" or "nullable" — it says "tied to a real order in our system",
"a positive amount, naturally", and "they're physically out there in
people's wallets". Translating those into constraints *is* schema design.

## Notes

**Read a spec for the words that imply a constraint.** "Unique printed
code" is `UNIQUE`. "Obviously never negative" is a `CHECK`. "Tied to a real
order in our system" is a foreign key. "A card can be used across multiple
orders" is a one-to-many relationship and therefore a separate table rather
than a column. Every one of those phrases was delivered as an aside, and
every one of them is load-bearing.

**The property the gate tests is the property that matters.** This lesson's
gates check *behaviour*, not DDL: several correct designs pass. That is how
schema review should work too — the question is never "did you write it the
way I would have" but "is this state representable, and should it be?".

**Attack your own schema before someone else does.** The checklist for any
new table: what is the identity of a row (primary key)? what must already
exist (foreign keys)? what values are impossible (CHECK)? what may be
absent, and does absence mean something (NOT NULL, and if nullable, why)?
what happens to children when a parent is deleted (ON DELETE)? Run the bad
inserts yourself in the lab — negative balance, orphan redemption, duplicate
code, zero-amount redemption — before the gate does.

**Derived values belong in a view, not a column.** The remaining balance is
`initial_balance` minus the sum of redemptions. Storing it as a column
creates a second source of truth that can drift; computing it in a view
cannot. The counter-argument is performance, and the answer to that is a
materialized view (lesson 46) or a generated column when the expression is
row-local (lesson 24) — both of which keep the derivation in one place.

**The NULL traps in a balance view are not incidental.** A card with no
redemptions must show its full balance, not NULL and not a missing row. That
requires a `LEFT JOIN` (lesson 09), `count(r.id)` rather than `count(*)`
(lesson 06), and `coalesce(sum(...), 0)` (lesson 04). Three lessons
converge, and getting any one of them wrong produces a view that is correct
for every card anyone tests and wrong for the ones nobody has used.

**Cross-row and cross-table rules need more than a CHECK.** "A card cannot
be redeemed for more than its balance" cannot be a `CHECK`, because a CHECK
sees only its own row. The options are a trigger, an `EXCLUDE` constraint
(for overlap-style rules), or accepting that the rule is enforced by the
application inside a transaction with `SELECT ... FOR UPDATE`. Knowing which
rules the database *can* enforce, and being explicit about the ones it
cannot, is a large part of designing a system that stays correct.

**Delete policies are domain decisions.** `CASCADE`, `RESTRICT` and `SET
NULL` are three different answers to "what does this deletion mean?", and
the right one comes from the product owner, not the engineer. The schema
just records the answer — but if nobody chooses, the default (`NO ACTION`)
gets chosen for you, and it is right more often than not.

## ex1 — the schema

Two tables, four implied constraints, and one deliberate open question:
`gift_card_redemptions` has no delete policy in the spec, so any is
defensible. Write down which you picked and why — the comment is worth more
than the choice.

Attack it yourself before the gate does. A negative `initial_balance`, a
redemption against card 99999, a second card with an existing code, a
redemption of 0.00: four `INSERT`s in the lab, and if any of them succeeds
you have found a rule the prose implied and your DDL did not. That is the
same exercise a reviewer performs on your migration, done by you first.

## ex2 — the balance view

The trap sprung deliberately. A card with no redemptions is the case that
never appears in a demo and always appears in production — on launch day
every card is unredeemed, so an `INNER JOIN` here produces an empty report
on precisely the day everyone is watching.

The general shape is worth naming: whenever a view reports "X, and its
related Y", ask what the row looks like when there is no Y. If the answer is
"it disappears", you have written an inner join into a question that was
about X.

## ex3 — the usage report

The same trap twice in one view — the count and the sum fail differently,
one giving 1 instead of 0 and the other giving NULL instead of 0. Both look
plausible in a spreadsheet, which is why the gate asserts them separately.

## ex4 — the batch they were printed in

A delete-policy decision handed to you in plain English, plus lesson 28's
add-a-nullable-column shape. Notice that the requirement "the cards must
survive" eliminated two of the three options without anyone naming a
foreign-key policy — which is what it looks like when a spec is complete
without being technical.

**Part 4 complete.** Next: **Part 5** stops asking whether your query is
correct and starts asking what it costs.

## Further reading

- [Constraints](https://www.postgresql.org/docs/16/ddl-constraints.html) — one more pass, now with a design brief in hand.
- [`CREATE VIEW`](https://www.postgresql.org/docs/16/sql-createview.html) — the derived-value half of this lesson.
- [Triggers](https://www.postgresql.org/docs/16/triggers.html) — where rules go when a CHECK cannot express them. Read the section on constraint triggers.
- [Using EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html) — start here before lesson 30. Everything you have designed is about to be measured.
