## Hint 1

An interface is a list of members with no bodies. A type that says
`: IWordCount` promises to have them, and the compiler checks.

Note that one of the three implementers is a `struct`. Interfaces are not
limited to classes, and nothing about `Document.Total` needs to know which is
which.

`Text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)` splits on
any whitespace and drops the empties - the same call you used in d02 ex7.

## Hint 2

Each `Words` is one expression; `ImageBlock.Words` is the literal `0`.

`Total` and `Largest` are one `foreach` each over `IEnumerable<IWordCount>`,
reading `part.Words`. `Largest` starts at 0, which gives the right answer for
an empty sequence without a special case.

Worth knowing for the follow-up: putting an `ImageBlock` into an
`IWordCount[]` **boxes** it - the struct is copied onto the heap so the array
can hold a reference. That is the usual cost of a struct implementing an
interface, and it is why the guidance is to keep structs small and to be
careful about interface-typed collections of them.
