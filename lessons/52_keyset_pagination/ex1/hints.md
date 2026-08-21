## Hint 1
`OFFSET 200000` does not skip 200,000 rows, it *produces* them and throws
them away. Ask instead: what do you already know about the row where page
10,001 begins? The job just wrote page 10,000, so it holds that page's last
row — and the feed is ordered by `ts`. Turn "start after that row" into a
`WHERE` clause and the executor can seek straight to it.

## Hint 2
The index is sorted by `ts`. A `WHERE` on the bare `ts` column is a descent
into the tree plus a walk of exactly as many entries as you asked for. The
README gives you the cursor: the last row of page 10,000 has
`ts = 2023-11-13 19:33:19+00`. `ORDER BY ts` and `LIMIT 20` stay exactly as
they are; the `OFFSET` goes away entirely.

## Hint 3
```sql
SELECT id, ts
FROM events
WHERE ts ... TIMESTAMPTZ '2023-11-13 19:33:19+00'
ORDER BY ts
LIMIT 20;
```
Two decisions left. Which comparison operator keeps the cursor row itself
*off* the new page? And what happened to the old
`ts >= '2023-11-11 12:00:00+00'` window bound — is it still doing anything?
