## Hint 1
One state object with three keys, and one change handler shared by all three
inputs. The handler has to work out which key it is being asked to change, and
the input can tell it - that is what the `name` attribute is for.

## Hint 2
`{ ...address, [event.target.name]: event.target.value }` is the whole update:
copy what was there, then override one key. Leave out the spread and you have
not edited an address, you have replaced it with an object of one field.
