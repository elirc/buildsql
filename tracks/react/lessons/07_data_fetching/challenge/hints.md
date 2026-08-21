## Hint 1
Only one thing is really state here: the page number. The items and the
`hasMore` flag are the *answer* for that page — they arrive from the server and
get replaced wholesale when the page changes. Buttons do not fetch; buttons
change the page number, and the effect notices.

## Hint 2
That gives you the shape:

```tsx
const [page, setPage] = useState(1);
const [data, setData] = useState<Page | null>(null);

useEffect(() => {
  // fetch this page, store the result
}, [page, fetchPage]);
```

`Previous` and `Next` are one line each — they only move `page`. Both buttons'
`disabled` values are derived during render, not stored: `page === 1` for one,
and something about the last response for the other.

## Hint 3
Two details decide whether this is production quality. Replacing `data` rather
than appending is what stops page 1 and page 2 being on screen together. And
the same race you fixed in ex3 applies here — click Next twice quickly and two
requests are in flight — so carry the cleanup guard across. What to show while
a page is loading (the spinner, the previous page, both) is a real product
decision the gate leaves to you.
