CREATE TABLE subscriptions (
  id          int         PRIMARY KEY,
  customer_id int         NOT NULL REFERENCES customers(id),
  plan        text        NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  is_active   boolean     NOT NULL DEFAULT true,
  started_at  timestamptz NOT NULL,
  renews_on   date
);
