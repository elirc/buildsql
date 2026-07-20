## Hint 1
The inner side (`customers`) already has its index - the primary key.
The outer side's filter (`orders.customer_id = ?`) is the one you've
indexed twice before in this course.

## Hint 2
`CREATE INDEX orders_customer_id_idx ON orders (customer_id);` - then
read the plan and find `loops=11` on the customers probe.
