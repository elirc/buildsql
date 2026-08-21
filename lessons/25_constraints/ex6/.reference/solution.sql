CREATE TABLE bookings (
  id        int  PRIMARY KEY,
  room      text NOT NULL,
  starts_on date NOT NULL,
  ends_on   date NOT NULL,
  CHECK (ends_on > starts_on)
);
