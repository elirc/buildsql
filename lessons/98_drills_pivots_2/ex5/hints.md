## Hint 1

Two stages. Stage one is an ordinary three-column pivot in a CTE. Stage two
takes each of those six rows and turns it into three, one per band, with the
band's name as a value.

## Hint 2

`CROSS JOIN LATERAL (VALUES ('cheap', w.cheap), ('mid', w.mid), ('dear',
w.dear)) AS v(band, products)` expands one row into three. `UNION ALL` of
three selects over the CTE is the same idea written longer.

## Hint 3

Order by `category` then `band` as text, which puts `cheap`, `dear`, `mid`
in that order - alphabetical, not by price. Do not sort by the band's
meaning; sort by what the column contains.
