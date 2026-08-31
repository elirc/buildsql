## Hint 1

Dates plus a derived boolean: group by the ISO day of week (lesson 18 - Monday is 1, Sunday is 7), and compute the weekend flag from the same expression.

## Hint 2

GROUP BY extract(isodow FROM created_at)::int; the flag is that expression >= 6, which is legal in SELECT because it is built from the grouped expression. Seven rows, Monday first.
