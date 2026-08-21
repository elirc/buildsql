## Hint 1
The media object is the oldest layout pattern on the web: a picture on one
side, a block of text on the other. `MediaObject` does not know or care what
either one is — it is handed both and only decides which comes first.

## Hint 2
Two slots, rendered in order:

```tsx
<div className="media">
  <div className="media-figure">{/* … */}</div>
  <div className="media-body">{/* … */}</div>
</div>
```

The gate checks document order by comparing the positions of the image and the
body text, so the figure has to be rendered before the body.

## Hint 3
Do not reach into `media` to add an `alt` or a class — the caller already gave
you a finished `<img>`, and reaching inside it is what makes a slot component
stop composing. Render it untouched.
