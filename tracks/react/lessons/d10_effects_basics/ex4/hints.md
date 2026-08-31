## Hint 1
The gate hands the component an object literal, so the parent builds a fresh
one on every render. React compares dependencies with `Object.is`, which says
two objects with identical contents are different values.

## Hint 2
You cannot make the parent stop, and you should not compare by hand with
`JSON.stringify`. Depend on the things inside the object instead - pull them
out above the effect and let the array list those.

## Hint 3
Destructuring at the top of the component gives you two stable strings to
depend on, and it also makes the effect honest: those two values really are all
it reads. What it passes onward is up to you, as long as `apply` receives the
current status and sort.
