# Reading - 75_drills_inner_joins_3

Long join paths, and the two failure modes that only appear once a query has
more than one join in it.

## Notes

**A join path is a sentence.** Every problem in this set is a chain of "this
row points at that row": a customer has orders, an order has lines, a line
names a product, a product has reviews. Write the chain out in English before
you type, and the `FROM` clause is just that sentence with `JOIN` between the
nouns and the key equality after each `ON`. Nothing about a five-table query
is harder than a two-table query except keeping the sentence straight.

**Join keys and filters are different things.** `ON` says how two rows
correspond; `WHERE` says which of the resulting rows you want. For inner
joins the two are interchangeable and the planner will not care - which is
exactly why the habit matters: the moment one of these joins becomes an
`OUTER` join (lesson 09, and the next two drill sets), putting a filter in
`ON` instead of `WHERE` changes the answer. Get the habit right while it is
free.

**The measure lives on the line, not on the product.** `order_items.price` is
what the item sold for; `products.price` is what it costs today. In this
dataset they happen to be equal, so a query using the wrong one still passes
the gate here and would be wrong in production the first time somebody
changed a price. Revenue is always `quantity * price` from the line.

**One table, two roles, two aliases.** When one row of your answer needs to
satisfy two conditions that no single row of a detail table can satisfy at
once - an order containing both a book and a laptop - you join the detail
table twice under different aliases. This is the same idea as a self-join
(lesson 10) arriving from a different direction, and it is the single most
common "I don't know how to express this" moment in interviews.

**Fan-out is the silent one.** Join a product to its 100 reviews and every
sales line for that product now appears 100 times. Counts can be repaired
with `count(DISTINCT ...)`; sums cannot be repaired at all. The fix is
structural: aggregate each branch to one row per key first, then join the
summaries. If a total looks implausibly large, count your join paths before
you check your arithmetic.

## ex1 - the three-table chain

The bread-and-butter shape: an entity, a junction table, and the thing on
the other side. `orders` and `products` share no column at all, so no direct
join between them exists; `order_items` is the only row in the database that
knows a given product was on a given order.

The classic mistake is putting `o.customer_id = 88` into an `ON` clause
because it happens to work. It works here and it is a filter, not a join
condition, and the habit will cost you an answer two lessons from now.

The model answer reads the chain left to right - orders, then the lines of
those orders, then the product each line names - and applies the customer
filter once, in `WHERE`.

## ex2 - starting from the far end

Same three tables as ex1, walked in the opposite direction: the filter is on
`products` this time, and the query fans out from a handful of expensive
electronics to every line that ever sold one and then to the orders those
lines sit on.

The classic mistake is a naked `id` in the `SELECT` list. Three of these
tables have a column called `id` and two have a column called `price`;
without aliases Postgres either picks one arbitrarily by position or raises
an ambiguity error, and either outcome wastes a minute. Alias every table,
prefix every column, always.

The model answer joins the same three tables and keeps both product
predicates in `WHERE`, because neither of them describes how a product row
corresponds to a line row.

## ex3 - grouping across three tables

The answer has one row per category, but no single table has all the pieces:
the grouping column is on `products`, the measures are on `order_items`, and
the date filter is on `orders`. That is normal, and it is the reason report
queries are wide - every table in the `FROM` is there to supply exactly one
thing.

The classic mistake is `sum(p.price * oi.quantity)`, using the product's
current price rather than the price the line was sold at. It gives the same
number in this dataset and the wrong number in any real one.

The model answer joins all three, filters the date range half-open
(`>= '2023-10-01' AND < '2023-11-01'`, so nothing on the boundary is counted
twice or missed), then groups by `p.category`.

## ex4 - four tables, one path

Customer to order to line to product. The only new thing compared to ex1 is
that the sentence is one clause longer, which is the whole point: at four
tables people start to feel that something clever is required, and nothing
is.

The classic mistake is joining `customers` to `order_items` directly on some
invented condition because the chain got lost. There is no such link;
`order_items` knows about orders and products only, and the customer is
reachable only through `orders`.

The model answer writes the four-hop chain in one direction and keeps both
product predicates in `WHERE`; which table you start `FROM` makes no
difference to the result or, for an inner join, to the plan.

## ex5 - the grain is at the far end

Four tables again, but now the grouping column (`c.country`) is at one end of
the chain and the measure (`oi.quantity * oi.price`) is in the middle. This
is the shape of most real reports and the one worth being fluent in: the
dimension and the fact usually live in different tables.

The classic mistake is `o.status IN ('paid', 'shipped')` when the prompt said
"not cancelled". Those are different sets - `pending` orders are not
cancelled - and quietly substituting the filter you expected for the filter
you were given is how reporting bugs are born.

The model answer joins the chain, applies the category and both order
predicates in `WHERE`, and groups by `c.country`; the tie-break in the
`ORDER BY` matters because two countries could in principle land on the same
revenue.

## ex6 - the same table twice

One order has to contain a books line and an electronics line. No single row
of `order_items` can do both, so a single copy of the table can never satisfy
both conditions at once - you need two copies, aliased differently, joined to
the same order.

The classic mistake is `WHERE p.category = 'books' AND p.category =
'electronics'`, which is a contradiction and returns nothing at all. The
second classic mistake is remembering the two aliases but forgetting that an
order with two books and three laptops now produces six identical rows.

The model answer joins `order_items` twice (each with its own `products`
alias) on the same `order_id` and collapses the duplicates with `DISTINCT`;
the reference solution does the same job with two `EXISTS` subqueries, which
never duplicates in the first place and is usually the better production
answer.

## ex7 - five tables, and one hop that is not about you

The full chain: customer, orders, lines, products, reviews. The trap is the
last hop. Reviews attach to the **product**, not to the order and not to the
customer, so once you have reached `products` you are done with customer 17 -
every review of those products belongs in the answer, whoever wrote it.

The classic mistake is duplication. If customer 17 bought the same product on
three different orders, the join produces each of that product's reviews
three times, and the row count triples without a single wrong row appearing.
Duplicates from a join are always a sign that the grain of your `FROM` is
finer than the grain of your question.

The model answer walks the chain and dedupes; the reference reaches the same
place by collecting the customer's product ids in an `IN` subquery first,
which makes the grain explicit and cannot duplicate.

## ex8 - the fan-out that cannot be repaired

Two independent branches hang off `products` here: the sales branch
(orders, customers, lines) and the reviews branch. Join both in one `FROM`
and every sales line is repeated once per review - around a hundred times in
this dataset - so `sum(oi.quantity)` reports a number roughly a hundred times
too large while looking perfectly reasonable.

The classic mistake is reaching for `DISTINCT` to fix it. `count(DISTINCT
o.customer_id)` genuinely does survive the fan-out, which is what makes the
trap so convincing; but `sum(DISTINCT oi.quantity)` is meaningless - it would
add up the distinct *values*, so two lines of 3 units become 3 - and there is
no incantation that recovers the true total from a multiplied join.

The model answer aggregates the sales branch to one row per product first, in
a subquery or CTE, and only then attaches the review count; the `>= 2 buyers`
restriction is a condition on that aggregate, so it lives in `HAVING` inside
the subquery or in `WHERE` outside it. Notice that the reference solution
pre-aggregates *both* branches - that shape, "summarise each side, then join
the summaries", is what report SQL looks like once you stop being surprised
by fan-out.

## Further reading

- [PostgreSQL - Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) - the reference definition of `ON` versus `WHERE` and of how a chain of joins is evaluated. Behind every exercise here.
- [PostgreSQL - Table Aliases](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-TABLE-ALIASES) - why the same table can appear twice in one `FROM` and how aliases keep the two copies apart. The mechanism behind ex6.
- [PostgreSQL - Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - `count(DISTINCT ...)`, and the exact semantics that make `sum(DISTINCT ...)` the wrong tool in ex8.
- [PostgreSQL - Subqueries in FROM](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-SUBQUERIES) - pre-aggregating one branch before joining it, which is the structural fix for fan-out.
- [Modern SQL - join fan-out and duplicate rows](https://modern-sql.com/use-case/pivot) - a short tour of why joining two one-to-many branches multiplies rows, with the same fix from another angle.
