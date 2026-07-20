## Hint 1
Three CREATE TABLEs in dependency order: customers first (no FKs), then
orders (FK to customers), then lines (FK to orders, composite PK). The
README's target-schema block is the spec — translate each line to DDL.

## Hint 2
```sql
CREATE TABLE n_customers (
  email   text PRIMARY KEY,
  name    text NOT NULL,
  country text NOT NULL
);

CREATE TABLE n_orders (
  order_id       int  PRIMARY KEY,
  customer_email text NOT NULL REFERENCES n_customers(email)
);

CREATE TABLE n_lines (
  order_id     int           NOT NULL REFERENCES n_orders(order_id),
  product_name text          NOT NULL,
  category     text          NOT NULL,
  quantity     bigint        NOT NULL,
  unit_price   numeric(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_name)
);
```
