## Hint 1

PostgreSQL treats NULL as larger than every non-NULL value when sorting. Under `ASC` that puts NULLs last; under `DESC` it puts them first.

## Hint 2

The default is not what this prompt wants, so say so explicitly: `ORDER BY manager_id DESC NULLS LAST, id`.
