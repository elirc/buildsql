## Hint 1
Say what the state is before you write anything — interviewers ask. Exactly one
thing here changes because the user did something: the page number. The items
and the total are the *answer* for that page, and both arrive together.

## Hint 2
```tsx
const [page, setPage] = useState(1);
const [data, setData] = useState<Page | null>(null);

useEffect(() => { /* fetch this page, store the result */ }, [page, fetchPage]);
```

The buttons do not fetch. They move `page`, and the effect notices.

## Hint 3
The page count comes from the server's `total` and the `pageSize` you were
given — `Math.ceil` — and both `disabled` values are derived during render
rather than stored. Two things worth getting right because they are the ones
that get probed: replace the items instead of appending them, and carry the
cleanup guard across, because two quick clicks on Next put two requests in
flight.
