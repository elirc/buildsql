## Hint 1

The handler's signature is the bug. `?zone=north&zone=south` is one key with two
values, and a `string` parameter can only hold one of them.

## Hint 2

Bind `string[] zone` instead. Minimal APIs fill it with every value of that key,
and with an empty array when the key is absent - which is exactly your "no
filter" case, so `zone.Length == 0` replaces the null check.

For the case-insensitive match, build a
`new HashSet<string>(zone, StringComparer.OrdinalIgnoreCase)` once and ask it
whether it contains the station's zone.
