## Hint 1
The stub renders the right rows in the right order and still fails. Read the
second assertion: the complaint is about the array the caller still holds a
reference to, not about anything on screen.

## Hint 2
`sort` and `reverse` are both in-place: they rearrange the array you called
them on and return that same array. Props are other people's data, and
rendering is supposed to be free of side effects - so make a copy first, with
a spread or `slice()`, and rank the copy.
