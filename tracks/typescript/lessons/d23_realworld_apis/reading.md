# Reading - typescript/d23_realworld_apis

The debrief. Per problem: what the boundary was really being asked to guarantee,
the shortcut that works until a particular value arrives, and one sentence on
the model answer.

## Notes

**This set is about the layer where the types stop being true.** Everything
inside your program is checked; everything arriving from outside it - a
response body, a query string, a url, a clock - is a promise somebody else made.
The job of a boundary function is to turn that promise into something the
compiler can rely on, and to be honest about what happens when it cannot.

**Model failure as data, not as an exception, when the caller has a decision to
make.** `Result` (ex1) and the tagged failure in `getJson` (ex2) exist because
"the server said 404" and "the server sent nonsense" want different handling,
and an exception flattens them into one. The discriminant is what makes the
handling checkable.

**Derive types from the one place the fact is written.** The endpoint table
(ex8), the route path (ex7) and the DTO shape (ex4) are each a single source of
truth with types read out of them - by `keyof typeof`, by a template-literal
recursion, by a key remap. The alternative is writing the same fact twice and
finding out later that only one copy was updated.

**Inject every collaborator.** The fetcher, the clock and the sender are all
parameters here, which is why the whole set runs in milliseconds with no
network, no timers and no mocking framework. It is also better design
independently of testing: a cache that takes a clock can be driven by a test, by
a simulation, or by a monotonic timer, and none of that is the cache's business.

**And read the edge cases as requirements, not as trivia.** `0` and `""` and
`false` are values (ex1, ex3). `201` is a success (ex2). Exactly at the ttl the
entry has gone (ex5). An empty body is a body (ex6). A path's last parameter has
no trailing slash (ex7). Each of these is one character in the implementation
and one incident in production.

## ex1 - a result you have to look inside

What this was testing: the discriminated union as an error-handling shape, and
`never` as the "this branch is impossible" type in a constructor's signature.
The narrowing is the whole ergonomics of the pattern - `if (result.ok)` gives
you `value` and nothing else, and the `else` gives you `error` and nothing else.

The classic mistake is `result.value ?? fallback`, which is correct until the
value is legitimately `undefined`, and `result.value || fallback`, which is
wrong for `0`, `""` and `false` as well. Both compile only if `value` is read
without narrowing, which is a second smell.

The model answer returns object literals from `ok` and `err` with `never` on the
unused side, and `unwrapOr` is a single ternary on the discriminant.

## ex2 - bad status against bad payload

What this was testing: an async boundary function whose success type comes from
an injected guard, and the discipline of distinguishing failures that mean
different things. "The server said no" and "the server said yes and sent
something unexpected" have different fixes and different owners.

The classic mistake is `if (response.status === 200)`, which rejects every 201,
204 and 202 the API is entitled to send. The second is trusting the body because
the status was fine, which is how `undefined is not a function` ends up three
layers away from the request that caused it.

The model answer checks the range, then the guard, then returns the narrowed
body - and the fact that `data` is typed `T` at the call site with no cast is
entirely the guard's doing.

## ex3 - build the query string

What this was testing: a small pure function with a long tail of edge cases,
which is what most boundary code turns out to be. Nothing here is difficult; all
of it is easy to get subtly wrong, and each mistake is invisible until a
particular value shows up.

The classic mistake is `if (!params[key]) continue`, which silently drops
`flag=false` and `n=0`. The second is `encodeURIComponent` applied to the whole
string at the end, which escapes the `&` and `=` that were supposed to be
structural.

The model answer sorts, filters on `undefined`, encodes each half separately and
joins - four steps in a chain, each of which is one of the requirements written
out.

## ex4 - dto in, domain model out

What this was testing: the anti-corruption layer - a wire shape, a domain shape,
and an explicit function between them - plus the mapped type that describes the
mechanical half of the difference. The type-level renaming is satisfying; the
lesson is that it stops exactly where the semantics begin.

The classic mistake is shipping the DTO into the application and letting
`user.created_at` spread through the codebase as a string, at which point every
consumer parses it (or forgets to). The second is trying to make `CamelKeys`
convert the date too, which no key-remapping type can do.

The model answer renames with a key remap over a recursive template literal, and
converts with three plain assignments - and `new Date(...)` sits in exactly one
place.

## ex5 - a cache that can tell the time

What this was testing: injecting the clock. Every property this cache has is
time-dependent, and with `Date.now()` inside there is no way to test any of them
without sleeping - so the parameter is not ceremony, it is the difference
between a testable component and a flaky one.

The classic mistake is `>` rather than `>=` on the age comparison, which leaves
the entry alive for one extra millisecond at exactly the boundary; the gate sets
the clock to precisely `ttlMs` after the write to catch it. The second is
returning `undefined` without deleting, so a cache of expired entries grows
forever.

The model answer keeps the write time per entry, deletes on the expired read,
and reports `entries.size` - and `now` is called, never captured, so a clock
that moves is seen.

## ex6 - the method decides the arity

What this was testing: a conditional type in a rest-parameter position, which is
how a single function can have argument lists that depend on an earlier
argument. It is the lighter-weight cousin of overloads, and it composes with
generics in a way overloads do not.

The classic mistake is an optional parameter, which accepts both wrong calls and
pushes the check to runtime - the stub is that version. The second is checking
`if (body)` inside, which treats an empty body as absent.

The model answer puts the conditional on the rest tuple and asserts once when
destructuring it, because the implementation genuinely cannot know which branch
the caller resolved to.

## ex7 - a route that types its own params

What this was testing: template literal types earning their keep. The whole
value of this function is that `params.userId` is checked and `params.slug` is
an error, and that both facts come from the string the caller typed - no schema,
no duplication, no code generation.

The classic mistake is a single recursive pattern requiring a trailing slash,
which drops the last parameter of every path; `"/users/:id"` then hands the
handler an empty object. The second is annotating `path: string`, which throws
away the literal and makes the whole derivation produce `never`.

The model answer collects names with two patterns, maps them once into an
object of strings, and matches segment by segment at runtime - with exactly one
cast, at the boundary where a loop-built object meets a derived type.

## ex8 - a client built from an endpoint table

What this was testing: the set as a whole, and most of the track with it. A
frozen table checked with `satisfies` (d20), `keyof typeof` to name the
endpoints (d11), a template-literal recursion to read each path's parameters
(d17), a mapped type to turn them into an object (d14), and a generic that ties
the two arguments together so that a wrong pair does not compile.

The classic mistake is the annotation on `ENDPOINTS`. It looks like
documentation and it is a demolition: `EndpointName` becomes `string`, every
path becomes `string`, `PathParams` produces an index signature, and the client
accepts any name with any params - which is precisely the client you were trying
not to write.

The model answer keeps one source of truth and derives everything from it, so
adding a fourth endpoint is one line and the type errors appear at exactly the
call sites that need updating.

## Further reading

- [MDN: encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) - what it escapes and why it goes around each key and value separately (ex3).
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - the 2xx range ex2 has to accept in full.
- [Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) - the path-parameter extraction in ex7 and ex8.
- [Handbook: Mapped Types - key remapping](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as) - the `as` clause that renames the DTO keys in ex4.
- [Handbook: Narrowing - discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) - the shape behind `Result` in ex1 and the tagged failures in ex2.
