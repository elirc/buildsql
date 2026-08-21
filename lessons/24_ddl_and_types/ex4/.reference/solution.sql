CREATE TABLE invoices (
  id       int           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subtotal numeric(10,2) NOT NULL,
  tax      numeric(10,2) NOT NULL,
  total    numeric(10,2) GENERATED ALWAYS AS (subtotal + tax) STORED
);
