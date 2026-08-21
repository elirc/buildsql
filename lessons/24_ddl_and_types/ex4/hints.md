## Hint 1
`id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY` and
`total numeric(10,2) GENERATED ALWAYS AS (subtotal + tax) STORED` - the
word GENERATED does two different jobs in the same table.

## Hint 2
```sql
CREATE TABLE invoices (
  id       int           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subtotal numeric(10,2) NOT NULL,
  tax      numeric(10,2) NOT NULL,
  total    numeric(10,2) GENERATED ALWAYS AS (subtotal + tax) STORED
);
```
