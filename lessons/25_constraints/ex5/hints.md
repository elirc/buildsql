## Hint 1
Two CREATE TABLE statements in one file, parent first. The policy goes
on the child's FK: `REFERENCES campaigns(id) ON DELETE SET NULL`.

## Hint 2
`campaign_id` must stay nullable - do not add NOT NULL to it, or the
SET NULL policy can never fire.
