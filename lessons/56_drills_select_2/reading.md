# Reading - 56_drills_select_2

More projection, with the emphasis on expressions that build on each other
and on `DISTINCT` applied to columns that barely repeat.

## Notes

This set drills the same clause as 55 but pushes on two edges. The first is
**operator precedence inside the SELECT list**: SQL arithmetic follows the
ordinary rules, so `price + price * 0.05` is a five percent markup while
`(price + price) * 0.05` is a tenth of the price, and the two are only one
pair of brackets apart. If a computed column is ever wrong by a suspiciously
round factor, precedence is the first thing to check.

The second edge is **`DISTINCT` over near-unique data**. De-duplication is
cheap to write and expensive to run: PostgreSQL has to sort or hash every
row of the input to prove which ones repeat. When the columns you selected
include anything close to a key, nothing is removed and you have paid for a
sort that changed nothing. The habit worth building is to ask, before typing
`DISTINCT`, *which* duplicates you expect and where they come from - if you
cannot answer, the keyword is probably hiding a modelling mistake rather than
fixing one.

## ex1 - a four-column export

A warm-up that tests reading discipline: four columns, none of them in table
order. The classic mistake is `SELECT *`, which returns the right data in the
wrong shape and would fail the gate on column count alone. The model answer
names the four columns in the requested sequence. Naming columns explicitly
is also the production habit: a `SELECT *` silently changes shape the day
somebody adds a column to the table.

## ex2 - reordering a wide table

This tests projection on a table where the natural column order and the
requested one differ, and where the temptation to de-duplicate is strongest.
The classic mistake here is a reflexive `DISTINCT`, which cannot remove
anything because `id` is unique and costs a full sort or hash of the table.
The model answer projects the three columns and stops; the useful reflex is
asking what duplicates you expect before you ask for them to be removed.

## ex3 - prices in cents

This tests that scaling a `numeric` keeps its scale, which matters the moment
a real payments API rejects `29040.00` where it wanted `29040`. The classic
mistake is adding a cast the prompt did not ask for and changing every value
in the column. The model answer multiplies and stops. In production the cast
belongs there - but deliberately, as `(price * 100)::bigint`, once you have
decided what should happen to fractional cents.

## ex4 - which products have ever sold

This tests `DISTINCT` as a set-extraction tool over a large child table, and
it is the first half of an anti-join. The classic mistake is joining to
`products` because the word "product" appears in the prompt, which adds work
and risks duplicating rows. The model answer reads one column of one table.
Keep the result in mind: it is smaller than the product catalog, and the
missing ids are exactly the never-ordered stock the outer-join lessons hunt.

## ex5 - the rating combinations that occur

This tests multi-column `DISTINCT` on a genuinely large input, where the
answer is neither tiny nor the whole table. The classic mistake is selecting
`id` alongside the pair, which makes every review row unique and defeats the
de-duplication entirely. The model answer names exactly the two columns whose
combinations are wanted. Notice the result size: it is close to the number of
products times five, which tells you nearly every product has collected every
rating.

## ex6 - a coupon that can go negative

This tests the discipline of returning what was asked rather than what seems
sensible, and it previews why real discount logic needs `greatest(price - 5,
0)` or a `CASE`. The classic mistake is filtering out the cheap products so
the column looks tidy, which quietly deletes exactly the rows the analysis
was about. The model answer subtracts and returns everything. Flat discounts
on a catalog with a wide price range always produce this shape.

## ex7 - brackets change the answer

This tests operator precedence, the arithmetic bug that survives review
because both versions run and both return plausible money. The classic
mistake is trusting a computed column because it "looks about right" - a
markup that is twice what it should be still looks like a price. The model
answer writes both forms verbatim so the difference is visible per row.
Precedence in SQL is the ordinary one; the danger is that nothing warns you.

## ex8 - the payroll worksheet

This is the shape a real report query has: a handful of raw columns and a
handful computed from them, all in one pass so that every consumer agrees on
the definitions. The classic mistake is losing track of position in a
seven-item list - most often by repeating the bonus in the package column, so
the total package silently excludes the salary. The model answer writes each
expression as specified and keeps the seven positions straight, which is most
of the work in production reporting.

## Further reading

- [SELECT Lists](https://www.postgresql.org/docs/16/queries-select-lists.html) - column labels, `AS`, and the rules for what a select item may be.
- [Operator Precedence](https://www.postgresql.org/docs/16/sql-syntax-lexical.html#SQL-PRECEDENCE) - the table that settles every argument about brackets in an expression.
- [Value Expressions](https://www.postgresql.org/docs/16/sql-expressions.html) - the full grammar of what can be computed per row, and in what order.
- [Data Type Formatting Functions](https://www.postgresql.org/docs/16/functions-formatting.html) - when a computed column needs to be formatted rather than merely calculated.
