## Hint 1
Three output columns; the third doesn't exist in the table — you compute it
from `price` with multiplication, and give it a name with `AS`.

## Hint 2
Skeleton:

```sql
SELECT name, price, <expression> AS price_with_tax
FROM products;
```

The expression multiplies `price` by 1.2.

## Hint 3
The expression is `price * 1.2`. Put it in the third position of the SELECT
list with the alias from the prompt.
