## Hint 1
Same shape with the three-argument split_part call as the expression.

## Hint 2
```sql
CREATE INDEX customers_email_user_idx
  ON customers (split_part(email, '@', 1));
```
