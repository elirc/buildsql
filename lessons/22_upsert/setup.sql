CREATE TABLE inventory (
  product_id  int PRIMARY KEY REFERENCES products(id),
  stock       int NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT '2023-11-14'
);

INSERT INTO inventory (product_id, stock)
SELECT id, 100 FROM products WHERE id <= 100;

CREATE TABLE price_watch (
  product_id  int PRIMARY KEY REFERENCES products(id),
  best_price  numeric(10,2) NOT NULL
);

INSERT INTO price_watch (product_id, best_price) VALUES
  (10, 50.00), (20, 80.00), (30, 20.00);
