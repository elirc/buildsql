## Hint 1
Statement 1 is a three-column CREATE TABLE. Statement 2 can be a single
INSERT with ten tuples `(1, 0.1, 0.1), (2, 0.1, 0.1), ...` — or use
`INSERT ... SELECT gs, 0.1, 0.1 FROM generate_series(1, 10) gs;`.

## Hint 2
```sql
CREATE TABLE ledger (
  id             int PRIMARY KEY,
  amount_float   double precision NOT NULL,
  amount_numeric numeric(10,2)    NOT NULL
);

INSERT INTO ledger (id, amount_float, amount_numeric)
SELECT gs, 0.1, 0.1 FROM generate_series(1, 10) AS gs;
```
