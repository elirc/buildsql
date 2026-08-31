## Hint 1

Three small pieces, each of which you have written before: read a JSON file and
tell "not there" apart from "broken", merge one object onto another
recursively, and freeze a tree. Build them separately and compose them in
`loadConfig`.

## Hint 2

"Not there" is `error.code === "ENOENT"` and nothing else — the base file
missing is fatal, the overlay missing is normal. Catch the parse separately from
the read so the message you throw can name the file rather than the position.

The merge is recursive on **plain objects only**: `Array.isArray` and `null`
both have to be excluded before you decide two values are mergeable, or an
overlay that shortens an array leaves the extra entries behind.

`Object.freeze` is shallow. Walk the values first, then freeze the container.
