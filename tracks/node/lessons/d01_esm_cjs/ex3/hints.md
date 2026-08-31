## Hint 1

An ES module cannot call `require` — the identifier does not exist. `node:module`
sells you one: `createRequire(someUrl)` returns a real `require` whose relative
specifiers resolve against that URL. The URL you have to hand is
`import.meta.url`.

## Hint 2

Build the `require` once, at module scope, and require the `.cjs` file once —
the module body runs on first require and never again, so paying for it per
call buys you nothing.

Two details the gate is checking. `ruleNames()` must read `Object.keys` of the
exported `RULES` object rather than a list you typed out, and `applyRule` must
call the exported `apply` rather than reaching into `RULES` yourself — that is
what makes the unknown-rule message come out of the legacy module instead of
out of you.
