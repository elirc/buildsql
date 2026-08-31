## Hint 1
Only the toolbar gets a listener. Since the click reaches it by travelling
outwards from whatever was actually clicked, the event already knows where it
started - your job is to ask.

## Hint 2
`event.target` is the deepest element the click landed on, which may be
something inside the button rather than the button. `closest("button")` walks
back up from there, and returns `null` when the click was not inside one at all.

## Hint 3
Read the command from the button rather than from a list you keep in parallel:
a `data-command` attribute is available as `button.dataset.command`. Handle the
`null` case deliberately - decide whether an unrecognised click should be
ignored silently or is worth complaining about.
