## Hint 1

This is ex3 with one extra condition. There, any fulfilment resolved; here, only
a fulfilment that passes the predicate does. Everything else — a rejection, or a
value the predicate turns down — is a lost chance, and lost chances are counted.

So: one counter, one `resolve` guarded by the predicate, and one "that was our
last chance" check.

## Hint 2

Note what the counter must **not** be. Counting only rejections would leave the
call hanging when every input fulfils with something unsuitable — the gate has
exactly that case, with `1` and `2` against a predicate of `> 10`.

Count every settlement that failed to produce an answer, whichever kind it was.
Both paths reaching the same helper is the tidy way to guarantee that.

## Hint 3

The empty case cannot match, so it fails immediately for the same reason ex3's
does — there is no chance left.

The remaining decision, and it is a real one: what if the predicate throws? This
version lets it escape into the `.then` handler, which rejects the promise the
handler belongs to and quietly loses that input rather than failing the call.
Decide whether you want that, and say so in the code.
