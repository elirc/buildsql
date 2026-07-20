CREATE TABLE newsletter_subs (
  id    int  PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email LIKE '%@%')
);
