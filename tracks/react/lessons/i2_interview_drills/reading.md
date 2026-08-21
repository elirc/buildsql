# Reading — react/i2_interview_drills

## Notes

A live coding round is scored on more than the code. Interviewers are watching
for a repeatable process: restate the task, enumerate the state out loud, build
the simplest version that renders, then layer on the requirements one at a time,
running as you go. Candidates who type in silence read as guessing even when
they are right, and candidates who name the trade-off they are not implementing
("I'd debounce this and I'd also want the stale-response guard") read as senior
even when they run out of time. Every drill on this page has at least one
requirement that was deliberately left out of the prompt — noticing it unasked
is the whole test.

## ex1 — the debounced search box

This is the most-given React drill in existence, because it touches state,
effects, cleanup, async and API etiquette in about twenty lines.

The mechanism worth being able to narrate: the effect schedules the request with
`setTimeout` and returns a cleanup that clears it. Because React runs the
previous cleanup before the next effect, a keystroke arriving inside the window
cancels the request that was about to go out. You are not writing a queue or
comparing timestamps — the effect lifecycle already has debounce semantics, and
saying that out loud is worth more than the code.

The unasked requirement is the stale-response guard. Debouncing reduces how
often two requests overlap; it does not prevent it. Pause, type, pause, and two
requests are in flight, and the first can still answer last. The `let current`
flag inside the effect body handles it. If the interviewer does not raise it,
you should.

The empty-query case is the other thing candidates skip. An empty box that still
shows the last search's results is a small bug with a big smell, and firing a
request for `""` is worse — many APIs interpret it as "everything".

Two follow-ups to have ready. *"Would you extract this?"* — yes, into
`useDebouncedValue` (you wrote it in lesson 10), which separates "when to ask"
from "what to do with the answer". *"What would you use in production?"* —
TanStack Query or SWR, which give you the debounce-adjacent parts you have not
built: caching by key, deduplication, retries and revalidation.

## ex2 — the paginated list

The design pressure is what counts as state. The user changes exactly one thing
— the page number — and everything else either arrives from the server as a unit
or is computed during render. Candidates who store `items`, `page`, `hasNext`,
`pageCount` and `loading` as five independent pieces of state spend the rest of
the drill keeping them in step, and an interviewer watching that happen has
already made their assessment.

Two details separate a working answer from a good one. Replacing the items
rather than appending them is what distinguishes pagination from infinite
scroll, and the bug where a "load more" implementation is reused for pages is
common enough to be worth mentioning unprompted. And the race applies here as
much as in drill 1: two quick clicks on Next put two page requests in flight, and
the slower one can leave you on a page whose number does not match its contents.

The product question worth raising: what does the user see while a page loads?
The old page greyed out, a skeleton, or an empty list? All three ship in real
products, and having an opinion is better than not noticing there was a choice.

## ex3 — the validated form

The structural move is to keep validation as a pure function of the values,
outside the component. It becomes readable, testable and reusable on the server,
and the component shrinks to "run it, decide whether to show the results, decide
whether to submit".

The timing requirement is the interesting part and the one that reveals whether
you have shipped a form somebody used. Showing errors before the first submit
means telling people their email is invalid while they are still typing it, which
is hostile. Requiring a second submit before an error clears is worse — the user
fixes the field, the message stays, and they cannot tell whether they fixed it.
The standard answer is: quiet until the first submit, live afterwards. One
boolean plus a derived `errors` object gets you both, and deriving rather than
storing the errors is what makes the "live afterwards" half free.

The accessibility half is where most candidates lose points without knowing it.
An error message that is visually next to a field is *not* connected to it —
`aria-describedby` is what makes it the field's accessible description, so that
tabbing in announces "Email, edit text, invalid entry, Enter a valid email
address". `aria-invalid="false"` rather than an absent attribute lets a test —
and a screen reader — tell "checked and fine" from "not checked yet".

The follow-up: *"anything else you'd add?"* A `role="alert"` summary at the top
listing every problem, and moving focus to the first invalid field on a failed
submit. Say it even if you do not build it.

## ex4 — the accessible accordion

"Only one open at a time" is a statement about the shape of the state, and
recognising that immediately is the fastest way to look like you have done this
before: one value naming the open section, not a boolean per section. A boolean
map can represent two open panels, which is a state you have just been told is
illegal — making illegal states unrepresentable is a principle worth naming.

The ARIA is the assessed part. `aria-expanded` on the header button is what tells
a screen-reader user whether the panel is open before they try; it must be
present and `"false"` when closed, because an absent attribute means "this is not
expandable". `aria-controls` names the panel it operates. The panel's
`role="region"` plus `aria-labelledby` back to the header gives it a name, which
is what puts it in the landmarks list a screen-reader user navigates by.

The follow-up that separates candidates: *"should the closed panel be unmounted
or hidden?"* Unmounting destroys any state inside it and takes it out of
find-in-page; `hidden` keeps both and keeps it out of the accessibility tree;
CSS-only hiding (`height: 0`) leaves it focusable, which is a genuine bug. All
three ship; the right answer depends on whether the content is expensive and
whether it holds state.

## ex5 — the cart editor

The two habits being checked are both from earlier lessons. The total is
derived, not stored, so it cannot disagree with the lines. And the updates
produce new arrays — `map` to change a line, `filter` to drop it — because React
compares by reference.

The requirement that decreasing to zero *removes* the line rather than showing a
quantity of zero is a small business rule, and where you put it matters. In the
handler it has to be repeated everywhere quantity changes; folded into the one
update function (or a reducer) it is true by construction. If an interviewer asks
you to extend this — a coupon, a minimum order, stock limits — the version with
one place for the rules is the one you can extend in front of them.

The accessible names on the buttons are the unasked requirement. A row of `+`
and `−` buttons is a column of identical controls to anyone not looking at the
layout. `Increase Apple` costs nothing and is the difference between a usable
cart and an unusable one.

The follow-up worth pre-empting: *"is `toFixed(2)` how you'd do money?"* No —
floating point cannot represent most decimal fractions, so prices are usually
held in integer minor units (cents) and formatted with `Intl.NumberFormat`,
which also handles currency symbols and locales.

## ex6 — the confirm dialog

The markup was already right, which is deliberate: it puts the whole drill on
the keyboard, where the real work is. The two moves of focus fail in different
ways and both are invisible if you only use a mouse. Opening without moving
focus leaves a keyboard user parked behind the dialog, tabbing through the page
underneath it. Closing without restoring focus removes the focused element from
the document, so the browser resets focus to `<body>` and the next Tab starts
from the top of the page — users describe this as "it jumped".

The two timings are the technical content. Focusing something *inside* the
dialog has to wait until it exists, so it goes in an effect keyed on `open`.
Restoring focus to the trigger can happen directly in the handler, because that
button never left the document. Routing every close path — Cancel, Escape,
Confirm — through one `close()` function is what stops one of them forgetting.

Focusing Cancel rather than Confirm is a deliberate choice worth saying out
loud: focus goes to the safe option in a destructive dialog, so that a stray
Enter does not delete anything.

The follow-up: *"what's still missing?"* Trapping Tab inside the dialog, making
the rest of the page inert, and — the honest senior answer — using the native
`<dialog>` element or a maintained library, because a hand-rolled modal is
almost never fully correct.

## challenge — the typeahead

This is the composite task, and the enumeration of state is where it is won or
lost. Three pieces: the query, the options, the highlighted index. "Is the list
open" is derived from the options; storing it as a fourth piece gives you two
things to keep in step and an interviewer a thing to ask about.

The combobox pattern is the part most candidates have never implemented, and
the reason it exists is worth stating: **focus must stay in the text box**,
because the user is still typing. So you cannot move focus to the options.
Instead the input carries `aria-activedescendant` holding the id of the
highlighted option, which is the ARIA mechanism for "focus is here, but *this*
is the active item". That is why every option needs a stable, unique id, and why
the highlight is an index in state rather than a DOM focus.

The rest is the earlier drills stacked: the debounce and the race guard from
drill 1, keyboard handling from drill 6, list rendering with keys from lesson 04.
`preventDefault()` on the arrow keys is the small detail people miss — without
it the caret jumps to the start or end of the text while you navigate.

Design decisions the gate leaves open, each a fine thing to narrate: whether
arrowing wraps around at the ends, whether the first option is highlighted
automatically when results arrive (convenient, but Enter then selects something
the user never looked at), whether hovering changes the highlight, and whether
selecting fires a fresh search for the selected text (the reference lets it, and
a production version would suppress it).

## review1 — the live filter

Drill 1 stripped to its two ideas, so that the review ladder can keep bringing
them back: the cleanup that cancels a pending timer, and the flag that retires a
superseded request. The delay is different (200ms) and the shape is different,
which is the point — a review variant you can pattern-match is not a review.

The question to answer before you move on, because it is the one that gets asked:
if the debounce already means you rarely have two requests in flight, why keep
the guard? Because "rarely" is not "never", and the failure it prevents is
silent and unreproducible — the user sees results for a query they abandoned,
blames the search, and nobody can make it happen again on a fast connection.

## Further reading

- [react.dev — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — the reference for drills 2, 3 and 5, where the temptation is an effect that syncs derived state.
- [react.dev — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) — the debounce and the race, from the source.
- [WAI-ARIA Authoring Practices — Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — the exact pattern the challenge implements, including `aria-activedescendant`.
- [WAI-ARIA Authoring Practices — Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) and [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — drills 4 and 6, with the keyboard contracts in full.
- [MDN — `aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) and [`aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid) — the two attributes drill 3 turns on.
- [MDN — `Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) — the honest answer to the money follow-up in drill 5.
