## Hint 1
Work inside-out: `upper(name)`, then `left(..., 12)`, then concatenate the
literal `' — $'`, then the price. The only failure you should hit is the
type error — read it; it names the two types it can't concatenate.

## Hint 2
The cast: `price::text`. Full expression:

```sql
left(upper(name), 12) || ' — $' || price::text AS card
```

One column, FROM products. (The dash is an em dash — copy it from the
README, or from this hint.)
