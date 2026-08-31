## Hint 1

`appendJsonl` is three lines: `mkdir` the parent recursively, then `appendFile`
with `JSON.stringify(record)` and a `\n`.

The newline goes *after* every record, not between them. That is what makes the
format appendable at all: a writer never has to look at what is already there.

## Hint 2

`readJsonl` starts with the missing-file case, and the shape of that check
matters. Catch the read, look at `error.code`, and return `[]` **only** for
`ENOENT`. Rethrow everything else — a permissions failure reported as "the log
is empty" is how real damage gets ignored for a week.

Then `split("\n")`, skip lines that are blank after trimming (which is what
makes the trailing newline harmless), and parse the rest.

## Hint 3

The line number is counted over **every** line, including the blank ones you
skipped, and starts at one. So track the index of the loop over the split array
rather than counting the records you have parsed — those are different numbers
the moment there is one blank line in the file.

The remaining decision is about scale, and it is the honest weakness of this
implementation: `readFile` loads the whole log into memory. For a real
append-only log the answer is a line-by-line stream, which is the streams
material later in the track — and worth being able to say so.
