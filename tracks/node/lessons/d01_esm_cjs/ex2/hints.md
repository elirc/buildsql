## Hint 1

This is ex1 run backwards, and `node:url` has the matching function. Do not
build the string yourself: `"file://" + p` is wrong on Windows (one slash
short), wrong for spaces, and wrong for `#`, `?` and `%`.

## Hint 2

The function you want returns a `URL` object, not a string. The gate compares
strings, so decide which property of a `URL` is the one an `import()` call
wants — `href`, `pathname` and `toString()` are not interchangeable here, and
only one of them survives the round-trip back through `fileURLToPath`.
