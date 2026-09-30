# 13. Streaming bytes and content limits

This application's content loader is a useful place to study the difference between a network response, a byte stream, decoded text, parsed JSON, and validated curriculum. Read `boundedJson` in [content-loader.ts](../../../src/content-loader.ts). Each stage has a different failure mode. A response can have a successful HTTP status but no readable body. A stream can exceed its permitted size. Bytes can fail UTF-8 decoding. Decoded text can fail JSON parsing. Parsed JSON can violate the curriculum contract.

## Count the resource you intend to limit

The loader adds each chunk's `byteLength` before decoding it and rejects when the accumulated count is greater than the limit. This is a byte budget, not a character budget. A string containing non-ASCII characters can occupy more bytes than its JavaScript length suggests. Test this with a small fixture containing accented characters or an emoji, but calculate the actual encoded length using the same encoding rather than guessing from the screen.

An exact-limit fixture should succeed if its contents are otherwise valid. A fixture one byte over should fail. The comparison is greater than, not greater than or equal. That small distinction belongs in a boundary test. Do not make the over-limit fixture invalid JSON as well, because then the observed error may not establish which boundary was exercised. A JSON string padded with ordinary spaces outside its value can help construct a controlled byte length, provided you verify the final encoding.

## Chunk boundaries are not text boundaries

A multi-byte character can be split across two stream chunks. The decoder is created with fatal decoding and receives intermediate chunks with streaming enabled. The final decode call flushes any remaining buffered bytes. If a stream ends halfway through a character, the final flush can fail. A test using only one chunk of ASCII text never investigates this behavior.

For a worked example, encode a JSON object whose title contains a non-ASCII character. Find the byte positions of that character, then split the encoded array between its bytes. Feed the chunks to a controlled readable stream. Predict the parsed object. Next remove the last byte of the character and predict a decoding failure. Keep the surrounding JSON structurally complete where possible so the first failed stage is visible. In your report, name whether the failure occurred while decoding or parsing.

## Cleanup has its own purpose

The catch branch attempts to cancel the reader and deliberately ignores a cancellation rejection. The finally branch releases the lock. This structure preserves the original loading failure while still attempting cleanup. A cleanup failure should not casually replace the error that explains why content was rejected. That is a general lesson about error ownership: the code handling a secondary failure must decide whether it is primary evidence, additional context, or best-effort cleanup.

Do not overstate what cancellation proves. A call to cancel is an observable local action; it is not evidence that every server-side operation instantly stops. For this client lesson, verify that the reader is released and that the intended error reaches the caller. If you later investigate actual network behavior, separate that experiment from the deterministic unit test.

## Exercise BX-13A: construct a stage matrix

Write a table with one fixture per failure stage: unsuccessful response status, absent body reader, byte overflow, malformed UTF-8, malformed JSON, and valid JSON with invalid curriculum shape. Include one fully valid fixture. For each row, identify whether you are testing `boundedJson` alone or a public loader that applies a validator afterward. The generic bounded loader returns unknown data; it does not itself know the mission catalog.

Your matrix should identify the observation that distinguishes adjacent stages. For example, a validator spy should not run when JSON parsing fails. Conversely, a schema rejection after successful parsing should not be reported as a network outage. This makes your error messages more useful and your tests less dependent on broad catch-all expectations.

## Exercise BX-13B: analyze memory behavior honestly

The loader reads chunks, but it accumulates the decoded text before calling JSON.parse. Therefore streaming input does not mean the application processes an arbitrarily large curriculum with constant memory. There may be byte buffers, decoded text, and parsed objects alive during the operation. Explain this in your own words and identify which limits keep the problem bounded.

The public loaders use different byte limits for the index, track packs, and manuals. Find those constants in the source and record why their data shapes differ. Do not assert that the limits are optimal merely because they exist. A performance investigation would measure realistic largest packs, parse time, and memory on representative devices. A contract test only proves that the chosen bounds are enforced.

## Exercise BX-13C: design a useful loading failure

Draft user-facing messages for a missing content file, an oversized pack, and a catalog mismatch. Each message should name a practical next step without exposing an implementation stack trace. The oversized pack is likely an authoring or deployment issue; asking the learner to rewrite their saved answers would be misleading. A catalog mismatch may indicate files from inconsistent builds. Keep the draft messages as proposals unless you implement and verify them separately.

## Review discussion

A strong solution does not collapse all failures into bad JSON. It identifies the layer that rejected the input, preserves the primary error through cleanup, and distinguishes resource bounds from semantic validation. The same reasoning transfers to file uploads, message consumers, and API clients. Here, however, your evidence should come from the actual loader and controlled fixtures, so another learner can reproduce every claim without relying on an unreliable network connection.
