## Hint 1

One piece of state: the bytes that arrived but did not add up to a whole frame.
Every `push` concatenates the new chunk onto that leftover and then takes as
many complete frames off the front as it can.

## Hint 2

Two guards, and they are separate:

- fewer than four bytes available → you cannot even read the length. `readUInt32BE`
  on a two-byte buffer throws, so this check has to come first;
- fewer than `length` bytes after the header → the frame is not finished; stop
  and keep everything.

Both are `break`, and both leave the cursor where it was, which is what makes
the leftover correct.

## Hint 3

The loop is what the test with three frames in one chunk is checking: an `if`
instead of a `for` returns the first frame and silently drops the rest, and the
bug does not appear until traffic gets busy enough for two frames to share a
packet.

Slice the payload out with `subarray` and then **copy** it — a subarray is a
view over the leftover buffer, and the leftover buffer is about to be replaced.
Whether `pending()` should also cap how much you are willing to hold before
giving up is not tested here, and is the first thing a reviewer will ask about a
reader facing the network.
