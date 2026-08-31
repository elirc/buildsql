# Reading - node/d22_validation_zod

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **treating a schema as the boundary of your program**
— the one place where unknown input becomes a value the rest of the code can
trust. Two ideas unite all eight answers. First, zod *parses*: `safeParse`
returns a new value, not a verdict, so coercion, defaults and transforms are
part of the schema rather than clean-up code scattered through the handler. Get
that wrong and every route acquires a `Number(req.query.limit) || 10` that
drifts out of step with the next one. Second, an issue is a message to a human
who has to fix something, which makes `issue.path` the load-bearing field: a
failure with no path, or with a path the client cannot map back to a form
control, is a 400 that tells nobody anything. Four of these problems are about
producing the right path, and two are about producing *all* of them in one
response instead of one per round trip.

## ex1 — coercion, and what a default is for

**What it tested:** that you know `req.query` holds strings, and that the
conversion belongs in the schema rather than in front of it.

**The classic mistake:** `z.number()` on a query parameter, which rejects every
request ever sent — followed by the "fix" of parsing by hand before the schema
and losing the range checks. The other one is mapping `issues[0]` into the
response, so a client with two bad parameters learns about them one deploy at a
time.

**Model answer:** `z.coerce.number().int().positive().max(50).default(10)` —
convert, then constrain what was converted, and let `.default()` short-circuit
an absent parameter so the handler needs no fallbacks at all.

## ex2 — the tag is read before the body

**What it tested:** the difference between a union and a *discriminated* union,
and the two distinguishable ways a tagged payload can be wrong.

**The classic mistake:** reaching for `z.union([...])`. It works, and then an
invalid click reports nine issues — three per branch, contradicting each other —
because every branch was tried. Almost as common: collapsing both failures into
one 400, so a client cannot tell "there is no such event type" from "your
keypress is missing its key".

**Model answer:** `z.discriminatedUnion("type", [...])`, and then a single test
on the issue code — `invalid_union_discriminator` means the tag matched nothing,
anything else means the branch it chose was not satisfied.

## ex3 — rules that belong to the object

**What it tested:** where a rule lives when it needs more than one field, and
whether you attach it to something the client can display.

**The classic mistake:** `ctx.addIssue({ code, message })` with no `path`. The
issue is perfectly true and completely unusable — it arrives with an empty path,
the form has nowhere to put it, and it ends up in a toast that says
"Validation failed". The second mistake is assuming a refinement is skipped once
a field has failed, and splitting the rules across two round trips to be safe.

**Model answer:** one `.superRefine` on the object with an explicit `path` per
issue — and a deliberate choice about *which* field "email or phone" is reported
on, since neither is wrong by itself.

## ex4 — the output type is not the input type

**What it tested:** `.transform()` and `.pipe()`, and the fact that a transform
ends the chain unless you reopen it.

**The classic mistake:** `.transform((s) => new Date(s))` with nothing after it.
`new Date("the fourth of May")` does not throw — it returns an Invalid Date,
which passes straight through and lands in the database as `null`, `NaN` or
`1970-01-01` depending on which driver gets to it first. The mirror image is
validating the email *before* trimming it, so `" ADA@Example.COM "` is rejected
for a problem the schema was about to fix.

**Model answer:** `.trim().toLowerCase().pipe(z.string().email())` and
`.transform(...).pipe(z.date())` — tidy first, judge second — with `.default()`
placed before the transform because it answers for a missing *input*.

## ex5 — three defensible answers, chosen on purpose

**What it tested:** that stripping unknown keys is a *decision* zod made for
you, and that you know the two alternatives and when each is right.

**The classic mistake:** never learning that the default strips, and writing a
hand-rolled "reject unknown keys" check that duplicates `.strict()` badly. The
sharper one is reaching for `issue.keys` without narrowing on
`code === "unrecognized_keys"` first — it exists on exactly one member of the
`ZodIssue` union, and a strict schema fails for ordinary reasons too.

**Model answer:** one shape, three schemas derived from it, and a 400 that looks
for the `unrecognized_keys` issue before falling back to the generic report.

## ex6 — a request is three inputs, not one

**What it tested:** validating params, query and body together, and reporting
them in a way that says which was which.

**The classic mistake:** returning as soon as one part fails. It is one `if` and
it costs the client two extra round trips. Close behind, and specific to express
5: assigning the parsed value back to `req.query`. That property is a getter
now, the assignment throws a `TypeError`, and the route answers 500 with a stack
trace that mentions none of this.

**Model answer:** loop the three part names, accumulate issues with the part
name prefixed onto `issue.path`, and put the parsed results on a new property
the framework does not own.

## ex7 — rendering a path a client can use

**What it tested:** turning zod's structured path — an array mixing keys and
array indices — into one string that unambiguously names a field.

**The classic mistake:** `issue.path.join(".")`, giving `items.0.qty`. A client
splitting that back apart cannot tell an index from a key called `0`, and no
form library accepts it as a field name. The other temptation is flattening an
`invalid_union`'s `unionErrors` into the list, which shows the user "expected
string" and "expected number" for the same input and helps nobody.

**Model answer:** a fold over the path where a number appends `[n]` and a string
appends `.key` — with the first segment taking no dot — plus a name for the
empty path, and no sorting, because zod's order is already the schema's order.

## ex8 — recursion, and a rule the nodes cannot see

**What it tested:** `z.lazy()` for a self-referential schema, and the
recognition that a depth limit is a property of the tree rather than of any node
in it.

**The classic mistake:** trying to express the limit on the node schema.
A node genuinely does not know how deep it sits, so this cannot be written, and
the usual next step is a depth *parameter* threaded through a schema factory —
which builds a different schema per level and produces paths that no longer
match the payload. The other one is forgetting the `z.ZodType<Category>`
annotation and watching TypeScript give up on the whole file.

**Model answer:** `z.lazy()` for the node, one `superRefine` on the outside
walking from the root, and a `path` accumulated during the walk so the issue
lands on the node that went too far rather than on the tree that contains it.

## Further reading

- [zod: basic usage and `safeParse`](https://zod.dev/?id=basic-usage) — the parse-do-not-validate model these eight problems are built on.
- [zod: coercion](https://zod.dev/?id=coercion-for-primitives) — `z.coerce`, and why it exists for exactly the ex1 situation.
- [zod: refinements](https://zod.dev/?id=refine) — `.refine`, `.superRefine`, `ctx.addIssue` and the `path` option.
- [zod: `.transform()` and `.pipe()`](https://zod.dev/?id=transform) — including why nothing can follow a transform without a pipe.
- [zod: recursive types](https://zod.dev/?id=recursive-types) — `z.lazy()` and the annotation TypeScript needs.
- [Express 5 migration notes](https://expressjs.com/en/guide/migrating-5.html) — `req.query` is a getter now, which is the ex6 trap.
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) — the standard shape the ex7 document is a step towards.
