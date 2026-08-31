## Hint 1

One row per status, and "which row" is decided by a sort - that is DISTINCT ON in one sentence (lesson 49). The ORDER BY must lead with the status.

## Hint 2

DISTINCT ON (status) ... ORDER BY status, created_at ASC, id ASC. Ascending picks the oldest order of each status; the id settles any same-second tie deterministically.
