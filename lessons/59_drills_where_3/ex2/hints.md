## Hint 1
The wildcard goes at the front this time, because the fixed part of the
pattern is at the end.

## Hint 2
A leading `%` means no B-tree index can help - PostgreSQL must read every
row. That is fine on a catalog this size and would not be on one a thousand
times larger.
