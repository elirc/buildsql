## Hint 1

`age(a, b)` returns an `interval` expressed in calendar units - years,
months and days - rather than a raw number of days.

## Hint 2

`extract(year FROM age(DATE '2023-11-14', hired_on))` pulls the years field
out of that interval. It returns `numeric`, so cast the result to `int`.
Extracting from `hired_on` itself would give you the hire year instead.
