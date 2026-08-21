## Hint 1
A table-level CHECK, written after the columns, may reference any of
them: `CHECK (ends_on > starts_on)`.

## Hint 2
```sql
CREATE TABLE bookings (
  id        int  PRIMARY KEY,
  room      text NOT NULL,
  starts_on date NOT NULL,
  ends_on   date NOT NULL,
  CHECK (ends_on > starts_on)
);
```
