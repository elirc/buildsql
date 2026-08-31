## Hint 1

Same idiom as ex2, but keep three per group instead of one: the filter becomes `rn <= 3`.

## Hint 2

Partition by `status`, order by `total DESC, id ASC` inside the window. With half a million orders drawn to the cent, equal totals near the top are a real possibility - the `id` tie-break decides who makes the cut, every time the same way.
