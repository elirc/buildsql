## Hint 1
The three parts never see each other in the JSX, so the shared id cannot travel
as a prop. Something has to make it available to whatever is rendered inside
`FormField`, at any depth.

## Hint 2
That is context: `createContext`, a provider in `FormFieldRoot` holding the ids from
`useId`, and `useContext` in each part. `Object.assign(FormFieldRoot, { Label,
Control, Hint })` is what lets the caller write `FormField.Label`.

## Hint 3
The last requirement is the interesting one: the control may only carry
`aria-describedby` when a hint is actually there. `FormFieldRoot` can see its own
children, and you already know how to ask whether one of them is a particular
component - decide what the context should carry when the answer is no.
