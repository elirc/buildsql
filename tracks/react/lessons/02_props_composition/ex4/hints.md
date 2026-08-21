## Hint 1
The gate passes five props but `TextField` only has opinions about two of them.
The other three — `type`, `placeholder`, `maxLength` — are plain `<input>`
attributes that this component has no business knowing about, and it should
hand them straight through rather than listing them one at a time.

## Hint 2
Rest destructuring collects "everything I did not name":

```tsx
export function TextField({ label, id, ...rest }: TextFieldProps) {
```

and JSX spread pours an object back out as attributes:

```tsx
<input id={id} {...rest} />
```

## Hint 3
Order matters in a spread: attributes written *after* `{...rest}` win over
whatever `rest` contained, and attributes written before it lose. Decide which
you want for `id` — and remember the label still has to be joined to the input
by `htmlFor`, with no wrapper element around the pair.
