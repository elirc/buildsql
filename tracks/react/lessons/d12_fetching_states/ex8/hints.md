## Hint 1
Three separate bugs live in the stub: a page replaces the list instead of
joining it, a failed page empties the list, and there is no way to ask for the
same page again. Fix them one at a time and rerun the gate between each.

## Hint 2
Appending is the updater form - `setItems((current) => [...current, ...next])` -
because the value you are adding to is the one from the previous state, not the
one this render captured. A failed page should touch the error only; the items
it never received are not evidence about the items you already have.

## Hint 3
Retrying the *same* page means the page number must not change, so the effect
needs a second reason to run. What appears where the Load more button used to
be, while the error is on screen, is a design decision the gate has already
made for you - reread the gate assertions.
