## Hint 1
Same shape, but the conflict action is the one that does nothing at all.

## Hint 2
```sql
INSERT INTO inventory (product_id, stock)
VALUES (60, 0), (200, 0)
ON CONFLICT (product_id) DO NOTHING;
```

(Why insert 60 with stock 0 at all? Because you don't know it exists —
that's the point of the idiom. The DO NOTHING protects it.)
