## Hint 1

The algorithm is a list of candidates tried in a fixed order, and the first one
that exists **as a file** wins. Write the list out before you write any code:
the bare path, the three extensions, the two index files. Now the function is a
loop over that list.

## Hint 2

Two traps live in the details.

`existsSync`-style checks answer "is there something here", not "is there a
*file* here" — and the directory case needs the difference, or `./lib` matches
the directory `lib` itself and stops. `stat()` gives you `isFile()`.

`stat()` on a missing path rejects, so the candidate test has to swallow that
rejection and answer `false`. That is one of the rare places a bare `catch`
with no rethrow is the right call — say out loud why, because an interviewer
will ask.

## Hint 3

Build the base path with `path.resolve(dir, specifier)` rather than string
concatenation: it makes the result absolute, normalises the separators for the
platform, and removes the leading `./` in one step.

The remaining decision is what to do when a candidate exists but is a
directory: you have to keep going rather than return it, and the order in which
you keep going is what the last two assertions in the gate are about.
