## Hint 1
Six columns. The interesting ones are `plan text NOT NULL CHECK (plan
IN ('free','pro','team'))` and `is_active boolean NOT NULL DEFAULT true`.

## Hint 2
```sql
CREATE TABLE subscriptions (
  id          int         PRIMARY KEY,
  customer_id int         NOT NULL REFERENCES customers(id),
  plan        text        NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  is_active   boolean     NOT NULL DEFAULT true,
  started_at  timestamptz NOT NULL,
  renews_on   date
);
```
