## Hint 1

The join key is the foreign key: `orders.customer_id` points at `customers.id`. Everything else in the prompt is a filter or an output column.

## Hint 2

Alias both tables (`orders o`, `customers c`) and qualify every column. With two tables that both have an `id`, unqualified names are ambiguous and PostgreSQL will say so.
