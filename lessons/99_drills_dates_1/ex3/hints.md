## Hint 1

`date_trunc` accepts more bucket names than `day` and `month` - the quarter
is one of them, and the truncated value is the grouping key.

## Hint 2

`GROUP BY date_trunc('quarter', created_at)`, repeating the expression or
using the ordinal. Round the summed revenue, not each order's total.
