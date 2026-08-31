## Hint 1

Write `isTag` as a predicate (`value is Tag`) using the same three-question
preamble as ex3, then two `typeof` checks on the members.

`collectTags` is then one line, and the line is the lesson.

## Hint 2

`Array.prototype.filter` has an overload that takes a type predicate and returns
the narrowed array type - so `values.filter(isTag)` is `Tag[]` with no cast.

Wrapping it (`values.filter((v) => isTag(v))`) throws that away: the arrow's
return type is plain `boolean`, and the overload no longer applies.

Left to you: whether `collectTags` should also deduplicate by name. It is not
asked for - but notice how cheaply the guard makes it possible.
