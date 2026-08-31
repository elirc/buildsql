## Hint 1

The piece that moves a file between two trees is the **relative** path: what the
file is called *from* the source root. Once you have that, the output path is
that same relative path joined onto the output root.

## Hint 2

`path.join(outRoot, file)` is the version that looks right and puts your build
output in `dist/home/ada/work/site/pages/index.html`. It is `path.relative()`
first, every time.

Two of the three answers are `null`, and they are the same test you would write
for any "is this inside that" question — including the `..`-as-a-segment care
that a directory called `..config` needs.

## Hint 3

The extension change is the ex2 problem again: parse, replace `ext`, format —
and remember that `path.format()` ignores `name` and `ext` if you also hand it
`base`. `options.ext` being *absent* and being the *empty string* are two
different requests: one keeps the extension, the other removes it. `??` will not
tell them apart; `=== undefined` will.
