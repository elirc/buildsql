## Hint 1
One INSERT, three parenthesized value tuples, columns listed explicitly.
The attributes column takes the JSON as a quoted string literal.

## Hint 2
```sql
INSERT INTO products (id, name, category, price, description, attributes)
VALUES
  (20001, 'Dojo Tee', 'clothing', 25.00, 'Official SQL Dojo t-shirt',
   '{"color": "black", "size": "l", "tags": ["new", "limited"]}'),
  (20002, ...),
  (20003, ...);
```

Copy the remaining two rows from the README table, exactly.
