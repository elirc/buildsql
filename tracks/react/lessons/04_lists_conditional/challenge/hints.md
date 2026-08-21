## Hint 1
Do not iterate the tasks. Iterate the **groups** — they are already in the
order the output needs, and they are already in the file as `GROUPS`. For each
one, ask the task list which tasks belong to it.

## Hint 2
Inside that outer map, per group: filter the tasks down to this status, sort
the survivors by title, and if there are none left, render nothing. Returning
`null` from inside a `map` is legal and renders nothing at all — which is
exactly how you skip an empty group.

Note that `filter` already returns a fresh array, so sorting it in place here
is safe. That is not true of the `tasks` prop itself.

## Hint 3
Two nested maps means two sets of keys: the outer elements are keyed by
something stable per group, the inner ones by something stable per task. Both
groups and tasks carry a natural identifier. The remaining decision is what
element wraps each group — the gate only requires a level-3 heading and a list
per group, so the semantics of the container are yours to choose.
