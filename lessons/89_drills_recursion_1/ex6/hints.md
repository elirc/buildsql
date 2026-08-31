## Hint 1

Instead of starting from the CEO, start from everybody at once - and remember, for every row you reach, which person you started from.

## Hint 2

Anchor: `SELECT id AS root, id FROM staff`. Step: `SELECT t.root, s.id FROM staff s JOIN tree t ON s.manager_id = t.id`. The result is one row per ancestor/descendant pair, plus every node paired with itself.

## Hint 3

Group by `root` and count. Subtract 1 for the self-pair, and use `HAVING count(*) > 1` to drop the people who have no descendants at all.
