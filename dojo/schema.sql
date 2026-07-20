CREATE TABLE customers (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL,
  country     text NOT NULL,           -- ISO 3166-1 alpha-2
  created_at  timestamptz NOT NULL
);

CREATE TABLE products (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  category    text NOT NULL,
  price       numeric(10,2) NOT NULL,
  description text NOT NULL,
  attributes  jsonb NOT NULL           -- {"color": ..., "size": ..., "tags": [...]}
);

CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id),
  status      text NOT NULL,           -- pending | paid | shipped | cancelled
  total       numeric(10,2) NOT NULL,
  created_at  timestamptz NOT NULL
);

CREATE TABLE order_items (
  id          int PRIMARY KEY,
  order_id    int NOT NULL REFERENCES orders(id),
  product_id  int NOT NULL REFERENCES products(id),
  quantity    int NOT NULL,
  price       numeric(10,2) NOT NULL
);

CREATE TABLE reviews (
  id          int PRIMARY KEY,
  product_id  int NOT NULL REFERENCES products(id),
  rating      int NOT NULL,            -- 1..5
  body        text NOT NULL,
  created_at  timestamptz NOT NULL
);

CREATE TABLE events (
  id          bigint PRIMARY KEY,
  customer_id int NOT NULL,
  event_type  text NOT NULL,           -- view | click | add_to_cart | purchase | logout
  payload     jsonb NOT NULL,
  ts          timestamptz NOT NULL     -- strictly increasing with id (ideal for BRIN)
);

CREATE TABLE staff (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  department  text NOT NULL,           -- sales | support | engineering | ops | finance
  manager_id  int REFERENCES staff(id),-- NULL for the CEO; forest depth 3-4
  salary      numeric(10,2) NOT NULL,
  hired_on    date NOT NULL
);
