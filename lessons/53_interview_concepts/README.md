# 53 — Interview concepts: the question bank

You have written a few hundred queries by now. An interview is a different
sport. Nobody hands you a schema tour, a `dojo lab` prompt and twenty
minutes of quiet — somebody says "so, what's the difference between `WHERE`
and `HAVING`?" and waits, and forty seconds of silence reads as *doesn't
know it*. The knowledge and the ability to produce the knowledge on demand
are two separate skills, and only one of them is trained by doing exercises.

This lesson trains the other one. Its centre of gravity is not the four
exercises below but `reading.md`, which carries **62 questions with model
answers**, grouped by topic and tagged by how often they actually come up:
⭐⭐⭐ means expect it in most SQL screens, ⭐⭐ means common, ⭐ means it
shows up when the interviewer is going deep or the role is senior. Every
answer is written the way a strong candidate would *say* it — three to six
sentences, one concrete example from this course's schema, and the follow-up
question the interviewer will almost certainly ask next.

Work it like flashcards, out loud. Read a question, cover the answer, say
your version to the wall, then read the model answer and note what you left
out. What you left out is the thing you will leave out under pressure.
Every answer ends with a pointer back into the course — "weak here → redo
`09_outer_joins`" — because the cure for a shaky answer is not rereading the
answer, it is redoing the lesson.

The four graded exercises exist because some things cannot be checked by
talking. They are the concepts most likely to be handed to you as a live
query on a shared screen: the `NOT IN` NULL trap, the anti-join, top-N per
group, and the semi-join that must not duplicate rows. You have met all four
before. The point is meeting them **cold**, with no lesson title above them
telling you which tool to reach for.

## Concept — the four shapes an interviewer actually tests

Almost every "write me a query" moment in a SQL screen is one of a small
number of shapes. Learn to recognise the shape from the English and the SQL
writes itself.

**"Which X have no Y?"** — an anti-join. Two idioms, and you should be able
to write both:

```sql
-- NOT EXISTS: says the thing directly, immune to NULLs
SELECT p.id FROM products p
WHERE NOT EXISTS (SELECT 1 FROM reviews r WHERE r.product_id = p.id);

-- LEFT JOIN ... IS NULL: the older idiom, same plan in PostgreSQL
SELECT p.id FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
WHERE r.id IS NULL;
```

**"Which X have at least one Y?"** — a semi-join, and the trap is row
multiplication. `EXISTS` returns each `X` once no matter how many `Y` match;
an ordinary join returns it once *per match*, and reaching for `DISTINCT` to
paper over that is the answer that loses points.

**"The top N per group"** — a window function. `ROW_NUMBER() OVER (PARTITION
BY g ORDER BY measure DESC)` in one layer, `WHERE rn <= N` in the next,
because you cannot filter on a window function in the `SELECT` that computes
it. The interviewer's follow-up is always *what if there's a tie* — which is
the difference between `ROW_NUMBER` (arbitrary winner), `RANK` (both, and a
gap afterwards) and `DENSE_RANK` (both, no gap).

**"Anything with the word *never*, *no* or *not* in it"** — stop and look
for NULLs. `NOT IN` against a subquery that can return a NULL returns zero
rows, always, silently. That single fact has probably ended more interviews
than any other item in this document.

## Exercise 1 — the trap, cold

Here is a query an interviewer slides across the table. It is supposed to
list the staff who manage nobody. It returns **zero rows**, and there are
500 people in the table.

```sql
SELECT s.id, s.name, s.department
FROM staff s
WHERE s.id NOT IN (SELECT manager_id FROM staff);
```

Edit `ex1/solution.sql` and make it answer the question. Columns: `id`,
`name`, `department`. Any row order. (404 of the 500 manage nobody; 96 do.)

Before you write, be able to say *why* it returns nothing — the reading's
NULL section has the sentence you want. Then fix it, and know both fixes.

Run: `uv run dojo test 53_interview_concepts ex1`

## Exercise 2 — "customers who bought X but never Y"

A recruiter's favourite, because it needs one positive and one negative fact
about the same customer and there is no way to fake it.

Edit `ex2/solution.sql`. Every customer who has bought at least one
**electronics** product and has **never** bought a **books** product.
Columns: `id`, `name`. Any row order. (1,623 customers qualify.)

A product's category lives on `products`, so both facts travel
`orders → order_items → products`. Note that a customer's electronics
purchase and their (absent) books purchase are different rows — no single
join can see both at once, which is exactly why this question is asked.

Run: `uv run dojo test 53_interview_concepts ex2`

## Exercise 3 — top N per group, on the clock

Edit `ex3/solution.sql`. For each product category, the **two** most-reviewed
products: `category`, `id`, `name`, and the review count aliased
**`reviews`**. Ties on review count are broken by lower `id` first.

**Ordered by `category` ascending, then `reviews` descending, then `id`
ascending.** (12 rows — six categories, two each.)

Run: `uv run dojo test 53_interview_concepts ex3`

## Exercise 4 — one row per customer, no `DISTINCT`

Edit `ex4/solution.sql`. Every Japanese (`'JP'`) customer who has had at
least one order cancelled — **one row each**, however many of their orders
were cancelled. Columns: `id`, `name`. Any row order. (2,247 customers.)

The gate counts rows, so a join that duplicates a customer fails it. Solve
it as a semi-join rather than by deduplicating after the fact; `DISTINCT`
would pass the gate here and lose you the point in the room, because it
tells the interviewer you produced wrong rows and then hid them.

Run: `uv run dojo test 53_interview_concepts ex4`

## Spaced review

`review1/`: every customer who has placed at least one order but has
**never** had one cancelled — columns `id`, `name`, any order. One positive
fact and one negative fact about the same customer, which is the shape ex2
and ex4 were teaching you to spot.

## The gate

```python
"""Gates for 53_interview_concepts. Quoted verbatim in README.md."""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)

def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

Each gate runs the reference query and your query against the same database
clone and compares the rows. Four of the five compare as *sets* — get the
rows right and the order is yours. `test_ex3` passes `ordered=True`, so its
rows must arrive in the sequence the prompt specifies; if you have the right
twelve rows in the wrong sequence the failure message says exactly that.
Both queries run against the same clone, so nothing you write here can leak
into the next exercise.

## The teaching point

Interviewers are not really testing recall. They are testing whether you
have a *model* — whether, when they say "customers with no orders", a shape
appears in your head before the syntax does. That is why the question bank
pairs every answer with the follow-up: the follow-up is where the model
either holds or falls over, and it is the part candidates never rehearse.

Two habits pay for themselves in every screen you will ever sit. Say the
question back before you write ("so, one row per customer, even if they have
five cancelled orders — yes?"), because clarifying is scored as a positive
and guessing wrong is not. And narrate the trade-off you *didn't* take
("`NOT EXISTS` here rather than `NOT IN`, because `manager_id` is nullable
and `NOT IN` would return nothing") — an answer that names the alternative
sounds like experience, because it is.

Next: **54_interview_drills** — the same material with a clock running.
