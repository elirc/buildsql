## Hint 1

One route, four query parameters, and an order of operations that matters:

1. **validate** everything first, and return the right 400 before doing any
   work;
2. **filter** (this decides `total`);
3. **sort**;
4. **slice** the page out.

Doing them in a different order gives wrong answers that look plausible: sort
before filter wastes work, paginate before filter gives a `total` that is a
lie, and validating late means an invalid page can still hit your data.

## Hint 2

Every value in `req.query` is `string | string[] | undefined` (a client can
send `?sort=a&sort=b`), so narrow with `typeof value === "string"` before you
use it. A small helper - "give me this parameter as a string, or this default"
- keeps the four reads readable.

The three validation rules from the README:

- `sort` must be `id` or `amount`, default `id`;
- `order` must be `asc` or `desc`, default `asc`;
- `page` >= 1 and `perPage` between 1 and 50, both integers.

Each has its own message, and the gate checks all three.

## Hint 3

The last two steps:

```ts
const sorted = filtered.sort((a, b) => {
  const comparison = sort === "amount" ? a.amount - b.amount : a.id.localeCompare(b.id);
  return direction === "desc" ? -comparison : comparison;
});

const start = /* which index does this page start at? */;
res.json({
  items: sorted.slice(start, start + perPage),
  page,
  perPage,
  total: /* the count of what, exactly? */,
});
```

Two decisions left: the offset arithmetic (pages are 1-based; page 1 starts at
0) and which array's length is the total. One caveat worth noticing:
`Array.prototype.sort` mutates. Sorting `ORDERS` in place would reorder the
shared fixture for every later request in the same process, which is the kind
of bug that only shows up on the second call - the reference copies with
`[...ORDERS]` when there is no filter.
