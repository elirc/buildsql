## Hint 1
"Only one open at a time" tells you the shape of the state: not a boolean per
section, but a single value naming which section is open — or `null` for none.
One piece of state cannot represent two open sections, which is the point.

## Hint 2
Each header is a real `<button>` carrying two attributes: `aria-expanded`,
which must render `"false"` while closed rather than being absent, and
`aria-controls` pointing at the id of its panel. The panel needs `role="region"`
and `aria-labelledby` pointing back at the header's id, which is what gives it
an accessible name.

```tsx
<button id={headerId} aria-expanded={open} aria-controls={panelId} …>
{open && <div id={panelId} role="region" aria-labelledby={headerId}>…</div>}
```

## Hint 3
Clicking the open header should close it again, so the toggle is not simply
`setOpenId(section.id)`. Two decisions the gate leaves to you and an interviewer
might not: whether the panel is unmounted or merely hidden when closed (they
differ for state, find-in-page and animation), and whether the header should
also respond to arrow keys.
