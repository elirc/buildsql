## Hint 1
The stub fires both requests at once, which is fast, wrong, and impossible when
the second request needs a value only the first one can give you. Draw the
dependency before you write anything: which call cannot start until which
answer exists?

## Hint 2
Chaining is what `then` is for: returning a promise from inside a `then`
callback makes the outer promise wait for it. Build one object at the end -
name and orders together - so the component has a single "everything arrived"
value to check.

## Hint 3
Two rejections, one handler. If either step fails, the same error branch has to
run, and the second request must never have gone out. That falls out for free
when the second call lives inside the first `then` rather than beside it.
