## Hint 1

`Capitalize<"title">` is `"Title"`. It is built into the compiler - there is no
implementation to write and nothing to import.

## Hint 2

It composes inside a template, so the whole answer is the stub with one wrapper
added. Check `"URL"` before you commit: the intrinsic only touches the first
character, which is what you want here.

Left to you: whether `Uppercase` would do instead. Try it against `"id"` and
read the result out loud.
