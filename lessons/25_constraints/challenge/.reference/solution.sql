CREATE TABLE wishlists (
  customer_id int NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id  int NOT NULL REFERENCES products(id),
  PRIMARY KEY (customer_id, product_id)
);
