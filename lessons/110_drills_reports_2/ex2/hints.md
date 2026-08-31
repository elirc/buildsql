## Hint 1

Group the whole customer table by a computed calendar bucket - lesson 18's date_trunc, at quarter grain.

## Hint 2

GROUP BY date_trunc('quarter', created_at), count per group, ordered ascending. The first and last quarters are partial (signups start and stop mid-quarter); a chart reader deserves that footnote.
