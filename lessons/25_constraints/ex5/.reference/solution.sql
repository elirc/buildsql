CREATE TABLE campaigns (
  id   int  PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE campaign_items (
  id          int PRIMARY KEY,
  campaign_id int REFERENCES campaigns(id) ON DELETE SET NULL,
  product_id  int NOT NULL REFERENCES products(id)
);
