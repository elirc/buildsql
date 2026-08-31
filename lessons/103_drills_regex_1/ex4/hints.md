## Hint 1

Replace the part you do not want with the empty string. Remember the space
in front of the number - it has to disappear too, or every result ends in a
blank.

## Hint 2

`regexp_replace(name, '\s*[0-9]+$', '')` swallows the separator along with
the digits. Replacing only the digits and then calling `btrim()` is the
equally valid two-step version.
