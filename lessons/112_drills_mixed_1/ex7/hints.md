## Hint 1

Three topics: a three-table join aggregated to months, a window average over a FRAME that excludes the current row, and a CASE verdict. The benchmark is the average of up to three PRIOR months - the current month must not smooth itself.

## Hint 2

avg(revenue) OVER (ORDER BY month ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING). Ending the frame at 1 PRECEDING is the whole exercise; CURRENT ROW would include this month in its own benchmark.

## Hint 3

January has an empty frame - avg over nothing is NULL - so its prior3_avg and flag are both NULL, no special casing needed. February and March compare against fewer than three months, which the frame handles by averaging what exists. Compare on the unrounded average, display the rounded one.
