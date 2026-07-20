## Hint 1
Three constraints on one column: NOT NULL, UNIQUE, and a CHECK with a
LIKE pattern.

## Hint 2
```sql
CREATE TABLE newsletter_subs (
  id    int  PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email LIKE '%@%')
);
```
