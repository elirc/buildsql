## Hint 1

Do the cleaning first, into three local variables, and let every check - and
every value you echo back - be about those locals rather than about `body`.
`"   "` is only empty once it has been trimmed.

## Hint 2

- name: `body.Name?.Trim() ?? ""`, then check `Length == 0`
- email: `.Trim().ToLowerInvariant()`, then `Split('@')` and require exactly
  two halves, neither of them empty
- phone: `Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "")`,
  then require 10 to 13 characters and `All(char.IsAsciiDigit)`

Return `new OwnerAccepted(name, email, phone)` from those locals - the gate
checks the normalised values, not the ones that were sent.
