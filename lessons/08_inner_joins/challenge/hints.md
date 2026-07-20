## Hint 1
Build it in two stages in the lab. Stage 1: the four-table join (customer
4242 → orders → items → products) grouped by (order id, product name) with
`sum(quantity)` — verify 12 rows and sane units. Stage 2: add the reviews
join and watch `sum(quantity)` explode. That explosion is the lesson.

## Hint 2
After the reviews join, each group holds ~100 copies of the same line
item. `avg(r.rating)` is immune (it averages the reviews). For units, use
`round(avg(oi.quantity))::int` — n copies of the same q average back to q.

## Hint 3
```sql
SELECT o.id, p.name, round(avg(oi.quantity))::int AS units,
       round(avg(r.rating), 1) AS avg_rating
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
JOIN reviews r      ON r.product_id = p.id
WHERE c.id = 4242
GROUP BY o.id, p.name;
```

Understand why avg-of-duplicates works before you paste this.
