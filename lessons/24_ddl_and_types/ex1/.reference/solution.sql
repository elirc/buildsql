CREATE TABLE coupons (
  code        text          PRIMARY KEY,
  percent_off numeric(5,2)  NOT NULL,
  starts_on   date          NOT NULL,
  expires_on  date          NOT NULL,
  notes       text
);
