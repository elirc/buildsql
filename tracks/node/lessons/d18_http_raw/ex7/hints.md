## Hint 1

Four gates in order, and the order matters: the method, then the path, then
whether the path is inside the root, then whether it is a file. Only the last
one is allowed to touch the disk.

## Hint 2

`url.pathname` is still percent-encoded, and you have to decode it before you
can use it as a filename. That decode is the dangerous moment: `%2f` becomes a
separator that the client's own URL normalisation never had a chance to remove,
which is why `/..%2fsecret.txt` arrives intact where `/../secret.txt` would have
been collapsed before it was ever sent.

So: decode, strip the leading slash, `path.resolve()` against the root, and then
ask whether the result is still under the root — by taking `path.relative()` and
looking at its first **segment**. `startsWith("..")` also rejects `..config`.

## Hint 3

The leading-slash strip is load-bearing and easy to skip. `path.resolve(root,
"/index.html")` is `/index.html` — resolve discards everything to the left of an
absolute argument — so without it every ordinary request escapes the root and
your own site 403s.

`stat()` answers two questions at once: it throws `ENOENT` for a file that is
not there, and `isFile()` is false for a directory. Both are the same 404 here.

What is left to you is which code the traversal gets. This gate wants 403; a
number of real servers answer 404 instead, so as not to confirm that the file
above the root exists at all. Have a reason for the one you pick.
