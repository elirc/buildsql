## Hint 1

Two steps into the document: the `tags` key, then its first element. The
path operators take both steps in one go.

## Hint 2

`attributes #>> '{tags,0}'` returns the first tag as text; `attributes #>
'{tags}'` returns the array as `jsonb`. Array elements are numbered from 0,
not from 1.
