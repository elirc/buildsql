## Hint 1

The stub fires the request from the change handler, where there is no cleanup
and nothing that knows a later keystroke has happened. Ask what the request is
really keyed on — it is not "a key was pressed", it is "the query is now this".

## Hint 2

Move the request to an effect that depends on the query. Now every keystroke
retires the previous run, and you have exactly the same guard as exercise 1.
Watch the empty string: it is a query that must not be asked, and returning
early from the effect before you declare the flag is fine.
