CREATE INDEX customers_email_user_idx
  ON customers (split_part(email, '@', 1));
