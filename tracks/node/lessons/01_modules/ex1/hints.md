## Hint 1

You are given a URL and asked for a path. Those are two notations for the same
location, and the difference is not cosmetic: a URL percent-encodes characters
that are perfectly legal in paths (a space becomes `%20`), and on Windows it
grows a leading slash in front of the drive letter (`file:///C:/app`).

So the first question is: which module in the standard library converts
between the two? The answer is not `node:path`.

## Hint 2

`node:url` exports `fileURLToPath`, the inverse of `pathToFileURL`. It handles
the percent-decoding and the Windows drive-letter rule for you, and it throws
if you hand it something that is not a `file:` URL.

That gets you the path of the *file*. The gate asks for the directory that
contains it, which is a one-call job for `node:path`.

## Hint 3

Two calls, composed:

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";

export function moduleDirname(metaUrl: string): string {
  return path./* which function? */(fileURLToPath(metaUrl));
}
```

The decision left to you is which `node:path` function drops the last segment:
`basename` gives you the last segment, `extname` gives you the suffix, and the
one you want is the third of that family. If you are tempted to write
`metaUrl.replace("file://", "")` instead, run it against the `my dojo` case in
the gate and watch what happens to the space.
