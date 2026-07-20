## Hint 1
Index the function call, parentheses and all - the DDL takes an
expression where a column name would go (note the doubled parens).

## Hint 2
`CREATE INDEX customers_email_lower_idx ON customers (lower(email));`
