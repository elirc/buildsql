## Hint 1

Guard first, then slide. Three inputs produce no windows at all: a window that
is not a whole number, one that is zero or negative, and one longer than the
data. All three answer with an empty array rather than a partial window.

## Hint 2

The slow version rebuilds each window with `slice` and `reduce`. The version an
interviewer is hoping for keeps a running `sum`: add the element entering the
window, subtract the element leaving it, and push an average once the window is
full.

The index bookkeeping is the trick - the element leaving at step `i` is
`values[i - window]`, and the first full window ends at `i === window - 1`.

Left to you: running sum or slice-and-average. If you write the simple one, say
out loud that you know the other exists and what it buys.
