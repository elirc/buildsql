## Hint 1

The ref and the effect are already right; the dependency array is the whole
exercise. Write down the two things that must happen — and the one thing that
must not — and see which array describes exactly that.

## Hint 2

`[]` means "once, ever". No array at all means "after every render", which
takes the cursor away from wherever the user has moved it. What you want is
"whenever the thing this box is about changes".
