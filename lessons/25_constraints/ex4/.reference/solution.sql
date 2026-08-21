CREATE TABLE promo_codes (
  id          int           PRIMARY KEY,
  campaign    text          NOT NULL,
  code        text          NOT NULL,
  percent_off numeric(5,2)  NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  UNIQUE (campaign, code)
);
