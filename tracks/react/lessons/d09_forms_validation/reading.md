# Reading — react/d09_forms_validation

## Notes

Validation is three questions, and mixing them up is where most form code goes
wrong. *What is the rule?* — that is a pure function of the values, so it belongs
in the render body, derived, never copied into state. *When may the user be told?*
— that is separate state (`touched`, `attempted`) and it is what stops a form
shouting at somebody who has typed one letter. *Where does the message go?* — on
the field that can fix it, connected with `aria-describedby` so it becomes that
field's accessible description, plus `aria-invalid` so the state is announced
even when the message is out of view. The set ends with the two async cases,
because in real forms half the rules live on a server, and the moment between
asking and knowing is a state your UI has to have a name for.

## ex1

Tests the wiring rather than the rule. Anyone can render a red paragraph; the
question is whether the field and the paragraph know about each other. The
classic mistake is exactly what the stub does — a correct message floating beside
an input that still claims to be valid, which for a screen-reader user is a form
that silently refuses to submit. The model answer computes `aria-invalid` and
`aria-describedby` from the error state, so both appear and disappear with it,
and trims the value before it decides anything.

## ex2

Tests timing. The rule is checkable from the first keystroke, but applying it
then produces a form that calls you wrong before you have finished being right.
The classic mistake is validating in `onChange` from the start; the equally
classic over-correction is validating only on blur, which then makes the user
leave the field again to discover they fixed it. The model answer derives the
error every render and gates the *display* on a `touched` flag set in `onBlur` —
late to complain, quick to forgive.

## ex3

Tests where a cross-field error lives. The mismatch is a fact about two boxes,
but only one of them is worth retyping, and marking both makes the user delete a
password they had right. The classic mistake is the shared banner, which is
announced once and connected to nothing. The second is complaining that the
confirmation does not match when the password is empty, which is technically
true and useless. The model answer orders the rules and attaches each message to
exactly one field.

## ex4

Tests the pattern every long form needs: a summary and a jump. `role="alert"`
gets the list announced, and focusing the first invalid control means the
keyboard user does not have to hunt for the field the summary is talking about.
The classic mistake is a summary in a plain `<div>`, which is announced to nobody,
and the second is leaving focus on the submit button. The model answer validates
into a record keyed by field, keeps one array defining field order, and reads
both the summary and the focus target from it.

## ex5

Tests the order of normalisation and judgement. Users type with caps lock off and
paste with spaces attached; a validator that judges the raw string rejects codes
that are perfectly correct. The classic mistake is validating `value` and then
passing `value.trim().toUpperCase()` to the callback, or the reverse — the two
have to be the same string, computed once. The model answer normalises at the top
of the handler and lets nothing downstream see the raw value.

## ex6

Tests a comparison and a boundary. ISO date strings compare correctly with `<`,
so reaching for `Date` objects here adds timezone bugs and nothing else. The
classic mistake is `<=`, which rejects a one-day booking that every hotel in the
world sells. The second is disabling the button when the range is invalid, which
removes the only way to find out why. The model answer disables only for
incompleteness and reports the ordering rule as an error on the end field.

## ex7

Tests whether you have a name for "asking". A remote rule has three states, not
two — unchecked, checking, judged — and Save is only legal in one of them. The
classic mistake is firing the check on every keystroke, which is a request per
letter; the second is leaving the previous verdict on screen while the user edits
the value it was about, so the form says "taken" about a handle nobody typed. The
model answer checks on blur, clears everything in the change handler, and gates
Save on a verdict rather than on the absence of an error.

## ex8

Tests the whole loop, and in particular the two flags people collapse into one.
`attempted` decides whether errors may be shown; `saving` decides whether the
form may be submitted again. The classic mistake is a single `submitted` boolean
doing both jobs, which either shows errors too early or lets a slow save be
started twice — and a double-submitted checkout is a real charge, twice. The
model answer keeps them separate, disables the button while the promise is in
flight, and clears `saving` in a `finally` so a rejected save cannot strand the
button on "Saving" forever.

## Further reading

- [Reacting to input with state](https://react.dev/learn/reacting-to-input-with-state)
- [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [MDN: `aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid)
- [MDN: `aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby)
- [MDN: client-side form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
