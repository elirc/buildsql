## Hint 1

Two paths cannot be compared until they mean the same thing, so `path.resolve()`
every entry before you look at any of them. After that the problem is a longest
common prefix — of **segments**, not of characters.

## Hint 2

Split each resolved path on `path.sep`, then fold: start with the first path's
segments and, for every other path, cut the running answer down to the point
where the two arrays first disagree.

The character-prefix version passes every test you would think to write by hand
and then reports `/var/log` as an ancestor of `/var/logging`, which sends a
deploy script into the wrong directory. The gate has that exact pair in it.

Joining the segments back together needs one moment of care on POSIX, where the
first segment of an absolute path is the empty string.
