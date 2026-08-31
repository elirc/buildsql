## Hint 1

The grouping key is text here, not a timestamp - the formatted month is
both the label and the thing you group by.

## Hint 2

`GROUP BY to_char(created_at, 'YYYY-MM')`, repeating the expression. The
reference groups by `date_trunc` and formats afterwards, which is the safer
habit when the format is not sortable.
