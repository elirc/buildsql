# 15. Cache behavior and resource ownership

Caching is easier to understand when you can state exactly what is cached, when it enters the cache, and what causes eviction. In [content-loader.ts](../../../src/content-loader.ts), the track cache is a module-level map of track identifiers to validated track packs. A cache hit deletes and reinserts its entry, making it the most recently used entry in insertion order. After a successful load, the code evicts entries from the beginning until at most two remain.

## Predict a concrete sequence

Start with an empty cache and request SQL, TypeScript, and SQL again. After the first two successful loads, the order is SQL then TypeScript. The SQL hit refreshes its position, leaving TypeScript then SQL. Request React successfully next. The oldest entry, TypeScript, is removed, leaving SQL and React. This is a small enough example to explain without naming an algorithm first. Once the behavior is clear, you can describe it as a least-recently-used policy for successful accesses.

Now add a failed load between those requests. A pack is inserted only after loading and validation succeed. Therefore a rejected candidate should not displace a good cached pack merely by being attempted. Write the exact sequence and inspect the source to verify the insertion point. A test that only checks the final successful return value misses the retention behavior after failure.

## Cache scope matters

The cache belongs to the loaded module in the current JavaScript context. It is not the IndexedDB workspace, the HTTP cache, or a persistent learner save. Reloading the page can create a fresh module instance. A separate tab can have its own module state. Explain these boundaries before proposing a clear-cache button, because users may otherwise expect it to erase progress or refresh every kind of stored data.

The cache stores a track pack object and returns that object on a hit. Investigate whether consumers mutate it. A type declaration alone does not freeze an object at runtime. If you propose deep freezing or defensive cloning, measure the cost and specify the ownership contract. The current exercise is to identify the risk and the actual consumers, not to introduce an unreviewed application change.

## Concurrent requests are another question

Notice that the map contains completed packs, not promises for in-flight requests. If two callers request the same uncached track before either finishes, both can pass the initial cache lookup. The source does not establish request coalescing merely because a cache exists. Draw the two-call timeline and mark the moments at which each lookup and insertion occurs.

A future design could cache a pending promise to share the request. That creates new decisions: whether a rejection removes the promise, whether cancellation by one consumer affects another, and how failed promises avoid becoming permanent cached failures. Do not add promise caching just because it sounds efficient. First establish that duplicate loads are significant and decide who owns the shared operation.

## Exercise BX-15A: write an eviction worksheet

Predict cache contents and order after this sequence: SQL success, React success, SQL hit, Node failure, TypeScript success, React success. For every step, distinguish a network attempt from a cache hit. Then explain how you would test the sequence without depending on real network speed. The test should control responses and reset module state between independent scenarios.

An answer that reports only which tracks are present is incomplete when order determines the next eviction. Record both membership and order. Also explain whether a failed request changes recency. Use the code's actual behavior rather than an assumed property of every cache implementation.

## Exercise BX-15B: design an in-flight cache proposal

Write a small state model with absent, loading, ready, and failed outcomes. Decide whether failed is a stored state or a transition back to absent. Define the result for two callers when the first request fails. Define the result if one caller navigates away but the other remains. Your design can choose different policies, but the choices must be internally consistent and testable.

Create three acceptance examples before writing prototype code: shared success, shared failure followed by successful retry, and one consumer becoming irrelevant while another still needs the result. Include the observation each consumer receives. Avoid resolving a canceled consumer's UI state merely because the shared network operation succeeded; operation ownership and display relevance are separate concerns.

## Exercise BX-15C: investigate memory without guessing

The cache holds at most two packs, but that does not prove only two packs are reachable anywhere in the application. Components, pending operations, and other references can retain objects. Explain the difference between cache size and total retained memory. A useful measurement plan records loaded tracks, navigation actions, and browser memory observations in a reproducible session. It does not infer a memory leak from a single rising measurement.

## Review discussion

Caching joins performance with correctness. A good cache can reduce loading time while a poorly specified one can retain stale data, share mutable objects, or turn temporary failures into permanent failures. This repository offers a deliberately small cache that is easy to trace. Master its actual sequence behavior first, then propose changes using evidence about workload and ownership. Your final artifact should include an eviction table, a concurrency timeline, and a reasoned decision about whether a more complex cache is warranted.
