## Hint 1
The link does two things at once: it tells the browser where to go, and it
tells your app that a click happened. You want the second without the first,
and the browser will do the first unless something stops it.

## Hint 2
The handler receives the event. `event.preventDefault()` cancels the browser
default - here, the page load - while leaving your code to run. Keep the `href`
where it is: it is what makes the element a link to a screen reader and what
makes open-in-a-new-tab work.
