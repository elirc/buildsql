# Reading — react/d16_context

## Notes

Context answers one question — how does a value get from here to a component a
long way below without every component in between having to carry it — and it
answers it by position in the tree rather than by name in a namespace. Three
consequences run through this whole set. The first is that a provider provides
to what is *inside* it, which is why nesting overrides and why a module-level
variable, which has one value at a time, cannot imitate it. The second is that
reading a context is a subscription: when the value changes, every component
that read it re-renders, and React decides "changed" with `Object.is` — so an
object rebuilt during the provider's render is a change even when nothing about
it is different. That single fact is behind exercises 4 and 5 and behind most
"context made my app slow" complaints. The third is that a provider may read
the same context it is about to provide, which turns context from an assignment
into an accumulation and is how heading levels, themes and preference
inheritance are really built.

## ex1

Tests the three pieces of a context and which one the stub is missing. The
classic mistake is a provider component that takes the value as a prop and then
renders `{children}` without wrapping them, so every consumer silently gets the
default — the code reads as though it works because the word "Provider" is in
the component's name. The model answer wraps the children in
`<UnitsContext.Provider value={units}>`, and keeps `createContext` at module
scope, since a context created during render would be a new channel each time.

## ex2

Tests the default value as a design decision. The classic mistake is choosing a
plausible default — `"Untitled"`, `"light"`, `{}` — which means a component
rendered outside its provider works incorrectly and says nothing; the bug then
surfaces days later as data that is subtly wrong. The model answer makes the
default `null` and puts the check in the custom hook, so the failure is
immediate and the message names the provider that is missing.

## ex3

Tests what "nearest provider" means. The classic mistake is thinking of context
as a global variable with a nicer syntax: the stub's module-level `let` gets
the first two badges right by accident of render order and then fails the third,
because a global has one value at a time while a context has one value per
position in the tree. The model answer publishes with a real provider, which is
what makes nesting an override scoped to a subtree rather than an assignment
that leaks to everything rendered afterwards.

## ex4

Tests splitting a context by who reads what. The classic mistake is one context
carrying `{ value, actions }`, which subscribes the buttons to a number they
never display — in a real app that is every toolbar in the tree re-rendering on
every keystroke. The model answer publishes two contexts from one provider and
writes the actions with the functional updater form so they never close over
the current value, which lets a single memoized object serve for the component's
whole lifetime.

## ex5

Tests context value identity. The classic mistake is building the value inline
in the provider's body, where it is a brand new object every time the provider
renders for any reason at all — including reasons that have nothing to do with
the value. The model answer wraps it in `useMemo` keyed on what the value is
actually derived from, which is the same identity discipline a dependency array
asks for, applied to a prop instead of an effect.

## ex6

Tests a provider that consumes its own context. The classic mistake is
publishing a constant, which is correct at exactly one depth and wrong at every
other; the second mistake is forgetting that HTML stops at `h6`, so a deeply
nested page renders `<h7>` elements that have no heading role at all and vanish
from a screen reader's outline. The model answer reads the inherited level, adds
one, clamps it, and publishes that.

## ex7

Tests packaging the pattern. The tell in the stub is the cast in `useValue`: it
promises TypeScript a `T` while the value may be `null`, which is precisely the
lie exercise 2 was about. The model answer replaces the cast with the check and
builds the message from the `name` captured in the closure, so each context
created by the factory gets a private channel, a matching provider, and an error
that names the right component.

## ex8

Tests inheritance, which is exercise 6's idea applied to an object with
defaults. The classic mistake is merging the overrides onto the hard-coded
defaults, so any nested provider silently resets every setting it did not
mention — the bug is invisible until somebody nests two of them, which is the
only reason to have written a partial override in the first place. The model
answer reads the outer value with `useContext`, merges the partial on top of
that, and lists both in the `useMemo` dependencies.

## Further reading

- [Passing data deeply with context](https://react.dev/learn/passing-data-deeply-with-context)
- [`useContext` reference](https://react.dev/reference/react/useContext)
- [`createContext` reference](https://react.dev/reference/react/createContext)
- [Scaling up with reducer and context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [MDN: heading elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements)
- [MDN: `Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
