# Reading - 62_drills_expressions_1

Numeric expressions, drilled. Each of these is one function call wide; the
difficulty is knowing exactly which rounding rule you just applied.

## Notes

Four functions do almost all of the work here and they are not
interchangeable. **`round(x)`** goes to the nearest integer, with halves away
from zero on `numeric`. **`trunc(x)`** cuts the fractional part off, which is
the same as `floor` for positive numbers and the opposite of it for negative
ones. **`floor(x)`** goes down, **`ceil(x)`** goes up, both regardless of
sign. Confusing `trunc` with `floor` costs nothing on a price list and
everything on a ledger that contains refunds.

**`round(x, n)` takes a second argument**, and it may be negative. `round(x,
2)` gives cents; `round(x, -3)` rounds to the nearest thousand. The negative
form is the one people never learn and then reimplement badly as `round(x /
1000) * 1000`.

**A cast is not a truncation.** `price::int` rounds to nearest - it does not
chop - which surprises everyone arriving from C or Java. And once a value has
become an `integer`, `/` becomes integer division: `290::int / 3` is `96`,
not `96.8`. That single conversion is behind most "the percentages are all
zero" reports.

## ex1 - to the nearest dollar

The baseline: rounding to the nearest integer, so the later problems have
something to contrast with. The classic mistake is reaching for a cast or for
`trunc`, both of which look right on a sample of cheap products and diverge
on anything ending above .50. The model answer calls `round` with no second
argument. `round(x, 0)` is the same call written explicitly, which is worth
seeing before ex3 makes the second argument do real work.

## ex2 - monthly pay, to the cent

This tests the two-argument form of `round` and the order of operations
around it. The classic mistake is rounding the input instead of the output,
which both fails to shorten the result and quietly changes it. The model
answer divides, then rounds once. Rounding once at the end is the general
rule: every intermediate rounding is an error you have chosen to introduce
and then propagate.

## ex3 - rounding left of the point

This tests the negative-scale form of `round`, which most people never meet
and then reimplement as `round(x / 100) * 100`. The classic mistake is
assuming a negative argument truncates - it does not, it still rounds to
nearest, which is why a 54.46 product lands on 100 and not on 0. The model
answer passes `-1` and `-2` directly. Histogram buckets usually want `floor`
semantics instead; know which you asked for.

## ex4 - cutting versus casting

This tests the difference between truncation and a rounding cast, and it is
the single most useful fact in this lesson. The classic mistake is assuming
`::int` chops like C's `(int)` does, so an exporter that "drops the cents"
silently rounds half the catalog upwards. The model answer returns both so
the divergence is visible per row. The reference substitutes `floor`, which
equals `trunc` here only because every price is positive.

## ex5 - down and up

This tests directional rounding, the pair you want whenever a business rule
says "always round up" (shipping units) or "always round down" (loyalty
points). The classic mistake is using `round` for either, which is right on
average and wrong on every individual row that matters. The model answer
calls each function directly; `ceiling` in the reference is a documented
alias for `ceil`, and `trunc` matches `floor` here because prices are
positive.

## ex6 - how far from the band

This tests composing an expression out of one you have already written, and
the discipline of not tidying away a sign. The classic mistake is `abs`,
which destroys exactly the fact HR is looking for. The model answer subtracts
the rounded band from the raw salary. Note that `round` to the nearest
thousand can move a value in either direction, which is why roughly half the
drifts come back negative.

## ex7 - rounded and raw, side by side

This tests where the precision in a `numeric` calculation actually goes, and
it is the reason a discount total computed per line can differ by cents from
one computed on the invoice. The classic mistake is assuming the two columns
must be identical because "money has two decimals" - the type does not
enforce that, the multiplication grows the scale, and only `round` shortens
it. The model answer shows both so the third digit is visible.

## ex8 - three ways to divide by three

The composite, and a fair interview question: it combines the rounding cast
from ex4 with integer division and with a `numeric` division rounded at the
end. This tests whether you can predict the type of every intermediate value,
because each type change silently rewrites the arithmetic. The classic
mistake is casting early "to keep it tidy" and losing both the fraction and
the remainder. The model answer computes each column exactly as specified so
the three answers can be compared row by row.

## Further reading

- [Mathematical Functions and Operators](https://www.postgresql.org/docs/16/functions-math.html) - round, trunc, floor, ceil and the exact rounding rule each one applies.
- [Numeric Types](https://www.postgresql.org/docs/16/datatype-numeric.html) - why `numeric` is exact, what scale a division produces, and when integer division bites.
- [Type Conversion](https://www.postgresql.org/docs/16/typeconv.html) - how PostgreSQL resolves the types in a mixed expression before evaluating it.
- [CREATE CAST / cast syntax](https://www.postgresql.org/docs/16/sql-createcast.html) - the machinery behind `::`, and a reminder that numeric-to-integer casts round.
