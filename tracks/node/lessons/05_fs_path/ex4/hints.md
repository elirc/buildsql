## Hint 1

Two failures can happen here and they deserve opposite treatment. "The file is
not there" is a normal state of the world on first run, and the caller gave
you a fallback precisely for it. "The file is there and its contents are
garbage" means something is wrong that a default value would paper over.

So the `try` block must be small enough to tell them apart. If you wrap both
the read and the parse in one `try` and return the fallback from the `catch`,
you have merged the two cases - and that is exactly what the gate checks.

## Hint 2

Node's filesystem errors carry a `code`: `ENOENT` (no such file or
directory), `EACCES` (permission denied), `EISDIR` (that is a directory),
`EMFILE` (too many open files). Branch on the code, never on the message.

In TypeScript the caught value is `unknown`, so you have to narrow it. The
usual idiom in Node code is a cast to `NodeJS.ErrnoException`, which is the
built-in type for exactly these errors.

## Hint 3

```ts
let text: string;
try {
  text = await readFile(file, "utf8");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === /* which code? */) return fallback;
  throw error;                // <- everything else is somebody else's problem
}
return JSON.parse(text) as T;
```

Two decisions left: the code to match, and where the `JSON.parse` goes. Note
it is deliberately *outside* the `try` - that is the whole design, and it is
worth pausing on, because "narrow the try block to the operation whose failure
you actually understand" is a rule that applies far beyond this exercise.
