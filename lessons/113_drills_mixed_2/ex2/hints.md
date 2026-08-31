## Hint 1

Date arithmetic feeding an aggregate: date minus date is already an integer number of days (lesson 18), and the snapshot date is the dataset's last day, 2023-11-14.

## Hint 2

avg(DATE '2023-11-14' - created_at::date) over WHERE status = 'pending', rounded to 1. Cast created_at to date first - subtracting a timestamptz from a date measures intervals, not whole days.
