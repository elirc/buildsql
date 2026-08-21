## Hint 1
`UNIQUE (campaign, code)` written as a table-level constraint (after
the column list) rather than beside a single column.

## Hint 2
```sql
CREATE TABLE promo_codes (
  id          int          PRIMARY KEY,
  campaign    text         NOT NULL,
  code        text         NOT NULL,
  percent_off numeric(5,2) NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  UNIQUE (campaign, code)
);
```
