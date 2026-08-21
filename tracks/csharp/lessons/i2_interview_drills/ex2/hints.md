## Hint 1

The interviewer is looking for one thing above all: **O(1) for both operations**.
A `List` you scan to find the least-recently-used is O(n) and will be the first
thing they push back on.

Two structures working together give you O(1): a dictionary for "where is this
key?", and a linked list for "what order were they used in?". Both fields are
already declared for you.

## Hint 2

The invariant: `_order` holds the entries newest-first, and `_entries` maps each
key to *its node* in that list. Given a key, the dictionary hands you the node,
and `LinkedList<T>.Remove(node)` and `AddFirst(node)` are O(1) because the node
already knows its neighbours.

`TryGet`: find the node, move it to the front, hand back the value.

`Put`: if the key exists, update the node's value and move it to the front. If
it does not, evict `_order.Last` when the cache is full, then `AddFirst` the new
entry and record the node in the dictionary.

## Hint 3

Two details the gate checks that are easy to miss. **Reading counts as using**,
so `TryGet` must reorder — a cache where only writes refresh recency is not an
LRU. And evicting must remove the entry from **both** structures; forgetting the
dictionary leaves a key that reports present and has no node, which is the bug
that will bite in the interview's "what if I read that key now?" question.

The usual follow-ups, worth having answers for: *"is this thread-safe?"* (no —
wrap it in a lock, or use `ConcurrentDictionary` plus a lock for the order, and
note that the order list is the hard part). *"What if I want expiry as well?"*
(store a timestamp with the entry and evict lazily on read).

Left to you: whether `KeysNewestFirst` should be a snapshot or a live view. The
gate only reads it; a snapshot is safer for callers.
