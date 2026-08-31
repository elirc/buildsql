## Hint 1
There are two ways to join a label to a control: `htmlFor` pointing at an id,
and putting the control inside the label. Only one of them works when you have
never seen the control and cannot give it an id.

## Hint 2
A `<label>` element that contains a form control labels it implicitly - no ids,
no `useId`, nothing for the caller to remember. That is what makes this wrapper
work for an input it was handed as `children`.
