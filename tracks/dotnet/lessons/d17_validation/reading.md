# Reading - dotnet/d17_validation

## Notes

Validation is not "reject bad input". It is **telling a client exactly what to
change**, in a shape its code can act on without a human reading prose. Every
gate in this set reads the `errors` dictionary key by key, because the key is
the message: `"petName"` binds to a form field, `"visits[1].species"` binds to a
row, `""` binds to the form itself, and `"invalid request"` binds to nothing at
all.

Four habits carry the whole set.

**Collect, do not return early.** One dictionary, every check, one decision at
the end. A handler that returns on the first failure turns a form with three
mistakes into three round trips, and the user fixes them one at a time while
wondering what else is waiting.

**Normalise before you judge.** Trim, lowercase, strip punctuation - *then*
decide. A name of three spaces is only empty after trimming, and an email is
only comparable after lowercasing. Echo back the normalised value, because the
form you validated is the form you should store.

**Key the error where the client can use it.** Field errors under the field.
Nested objects under dotted paths. List items under indices. Rules that belong
to a combination of fields under the empty key, which is what ASP.NET Core's
model state uses for model-level errors.

**Know which failures are not 400 at all.** A body the framework cannot parse is
already a 400 before your code runs. A request that is well formed, internally
consistent and still impossible - the vet does not treat rabbits - is a **422**,
because there is no field the client could look at and fix.

## ex1

What this was really testing: whether you build one dictionary or three
responses. The shipped handler is not *wrong* about any individual rule; it is
wrong about how many of them it is willing to talk about at once.

The classic mistake is exactly what is shipped, and it survives code review
because each `if` reads fine on its own. The cost only shows up in the client: a
signup form that can highlight one field per submission, or an integration that
loops "fix, retry, fix, retry" through a payload it could have corrected in one
pass.

The model answer's reasoning: the checks are independent, so run all of them and
decide once. That shape also makes the boundaries easy to get right - 10 and 120
are both legal, 121 is not - because each rule is a single expression rather than
a branch in a chain.

## ex2

What this was really testing: the order of normalisation and validation.
`"   "` is a perfectly non-null, non-empty string, and it is not a name.
`" ADA@Vet.TEST "` is a valid email wearing a disguise. Deciding before cleaning
gets both of those backwards.

The second half is echoing the *normalised* value. Validating the trimmed form
and then storing the raw one is a bug that hides for months: two records that
are obviously the same person do not compare equal, a login lookup misses
because the stored email has a capital letter, and a deduplication job quietly
does nothing.

The classic mistake with phone numbers is validating the punctuation instead of
the digits. `(020) 7946-0991` and `020 7946 0991` are the same number; the rule
belongs to what survives the stripping, not to the format somebody typed.

## ex3

What this was really testing: that some rules belong to no field. 17 is a legal
start hour. Ninety minutes is a legal length. Together they run past closing,
and blaming either one sends the client to change something that is not wrong.

The empty-string key is the answer, and it is not a hack: it is what ASP.NET
Core's `ModelState` uses for model-level errors, and what
`ValidationProblemDetails` serializes them under. Any client already handling
validation problems knows to render it at the top of the form rather than next
to an input.

The subtler half is *when* the rule runs. A start hour of 25 and a length of -3
have no meaningful sum, so a third error about the total would be noise on top of
two real messages. Cross-field rules go last and only fire when the fields they
combine are individually sound - which is also how `IValidatableObject` behaves,
and why it runs after the attribute-level checks.

## ex4

What this was really testing: indexed error keys, and one rule that only exists
across items. `visits[1].species` tells a client which row of its own table to
highlight; a bare `species` tells it nothing, and a single `visits` error makes
it bisect its own payload.

The duplicate rule is the interesting one, because it has to choose a victim.
Reporting index 0 blames the first, legitimate mention and tells the client to
delete the wrong row; reporting index 1 says "this repeat is the mistake", which
is what a user editing a list actually needs. The `HashSet` with
`StringComparer.OrdinalIgnoreCase` does both the detection and the choosing,
because `Add` returns false exactly on the later occurrence.

The classic mistake is checking duplicates in a separate pass with a `GroupBy`,
which finds the pairs correctly and then has to work out which index to blame -
and usually blames both.

## ex5

What this was really testing: that the error keys mirror the *shape* of the
body, and that a missing object is one error rather than a cascade. A client
that forgot the whole `owner` block does not need to be told that its name,
address, line 1 and postcode are all missing too - it needs one message saying
`owner`.

That falls out of nesting the checks: the fields inside `owner` are only
reachable once `body.Owner is not null`, so the cascade is impossible by
construction rather than suppressed afterwards.

Dotted paths are the convention every validation library and every form binder
already speaks - `owner.address.postcode` is what MVC's model binder would
produce for that property, so a client written against a controller-based API
needs no changes. The postcode itself is ex2's lesson again: normalise (trim,
uppercase), then match, then echo the normalised form.

## ex6

What this was really testing: conditional requirements, and the half of them
people forget. "A permit is required when the species is exotic" is easy.
"...and forbidden otherwise" is the half that catches the real bug: a client
sending a permit number with a cat has misunderstood something, and silently
dropping the field lets that misunderstanding reach production intact.

Both rules in this exercise are two-directional for the same reason. A sedation
note with no sedation is a contradiction, not a harmless extra. Accepting it
means the record says one thing and the note says another, and the resolution
happens in a meeting six months later.

The classic mistake is trying to express this with attributes.
`[Required]` cannot depend on another property, which is exactly why
`IValidatableObject` and `CustomValidationAttribute` exist - and why, in a
minimal API with no model binder attributes in play, an explicit `if` is not a
step down from anything.

## ex7

What this was really testing: the line between 400 and 422, which is the single
most argued-about distinction in HTTP validation.

Work through the failures in order. A body that is not JSON never reaches the
handler - the framework answers 400 by itself, and the only way to break that is
to wrap the binding in a `try`/`catch` that turns it into a 500. A URL naming a
vet that does not exist is a 404, because the *resource* is missing. A species
that is not a species, an hour outside opening times, a slot that runs past
closing: all 400, because each names something in the request the client can
look at and fix.

And then the one that is none of those. `ash` is a real vet, `rabbit` is a real
species, `09:00` is a real time, thirty minutes is a real length, and Ash Merrow
does not treat rabbits. Nothing in the payload is wrong. There is no field to
key an error under. **422 Unprocessable Content** is the status for exactly
that: well-formed, understood, and not doable.

The pragmatic caveat: plenty of good APIs answer 400 here and document it, and no
client will break. What matters is that the two cases are *distinguishable* -
because "fix your payload" and "ask for something else" are different
instructions, and a client that cannot tell them apart will retry the one that
can never succeed.

## ex8

What this was really testing: layering, and the order the layers run in. Six
kinds of failure in one handler, and the gate's first bad request triggers all of
them at once on purpose.

The order is the content. Field-level checks run first and independently, so
they all report. The cross-field rule runs only if they all passed, because a
round assembled from invalid parts has no meaningful total. The 422 runs last of
all, because it is the only check that cannot be expressed as a bad field, and
raising it before the payload has been shown to be sound would tell a client with
a typo to go and find a different vet.

Note where the vet code lives. In ex7 it was a URL segment, and an unknown one
was a 404. Here it is a field of the body, and an unknown one is a 400 keyed
`vetCode`. The same fact about the world produces a different status because it
arrived in a different part of the request - which is not inconsistency, it is
what those two parts of a request *mean*.

## Further reading

- [Handle errors in minimal API apps](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/handle-errors) - `ValidationProblem`, `Problem`, and the JSON these produce.
- [Model validation in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation) - where the error-key conventions come from, and `IValidatableObject` for cross-field rules.
- [Parameter binding in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding) - what happens to a body the binder cannot read.
- [ProblemDetails and RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) - the wire format for both the 400 and the 422 in this set.
- [RFC 9110 section 15.5.21](https://www.rfc-editor.org/rfc/rfc9110#name-422-unprocessable-content) - what 422 actually claims, in the specification's own words.
