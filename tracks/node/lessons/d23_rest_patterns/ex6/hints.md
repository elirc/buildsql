## Hint 1

Keep a map from key to **what you answered**, not merely to "this key has been
used". A replay has to reproduce the original status and the original body, and
you cannot reproduce them from a boolean.

Three fields per entry are enough: a fingerprint of the request, the status, and
the body.

## Hint 2

The fingerprint is what separates a retry from a mistake. The same key with the
same body is the network having eaten your response — replay it. The same key
with a *different* body is a client bug, and answering it with the old payment
would report success for a payment that was never attempted: that is the 409.

Two more things the gate checks. The replayed response carries
`Idempotency-Replayed: true` and the first one does not, which is how a client
knows which happened. And with no key at all there is nothing to de-duplicate
on, so two identical requests are two payments — the guarantee is something the
client has to ask for, and inventing one from the body alone would break every
legitimate repeat purchase.
