## Hint 1

A namespace can export interfaces, type aliases and values side by side. Only
the values survive to runtime; the types are erased, which is why a namespace of
pure types costs nothing.

## Hint 2

`Api.Id` should be derived rather than repeated: an indexed access into `Row`
means the two cannot drift when the row's id type changes.

Left to you: whether a namespace is the right container at all. Plain module
exports do the same job in modern code; namespaces earn their place in
declaration files, where there is no module to export from.
