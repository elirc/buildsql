## Hint 1

The store owns an array and a counter, both in the closure `createTaskStore`
creates, and returns an object of five methods over them. No HTTP, no express,
nothing async - this is the layer that would talk to a database in a real
service, and the reason it is separate is that it can be tested like this:
directly, in microseconds.

Start with `list`, `get` and `remove`. `create` and `update` have the
interesting rules.

## Hint 2

Three rules the gate is strict about.

**Ids belong to the store.** `create` ignores any id the caller offers and
assigns `task-1`, `task-2`, ... in creation order. The counter lives next to
the array.

**Defaults belong to the store too.** A `create` with no status produces
`"todo"`. `input.status ?? "todo"` is the whole rule.

**Everything you hand out is a copy.** `{ ...task }` before you return, and
`.map(copy)` for lists. Otherwise the caller holds a reference to your
internal object and can rewrite your data without going through you - the gate
mutates a task it received and checks the store did not change.

## Hint 3

```ts
const tasks: Task[] = seed.map(copy);
let nextId = 1;

return {
  list(filter) { /* filter if asked, then copy each */ },
  get(id) { /* find, then copy - or undefined */ },
  create(input) { /* build with the next id, push, return a copy */ },
  update(id, patch) { /* find; apply only the fields the patch mentions */ },
  remove(id) { /* findIndex + splice; report whether anything went */ },
};
```

Two decisions left in `update`: how to apply a *partial* patch (a field that
is `undefined` in the patch means "leave it alone", which is not the same as
"set it to undefined"), and what to return when there is nothing to update.
Returning `undefined` rather than throwing is deliberate - it lets the HTTP
layer decide that a missing row means 404, which is a decision the store
should not be making.
