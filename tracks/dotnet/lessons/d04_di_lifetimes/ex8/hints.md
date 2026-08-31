## Hint 1

Four independent decisions, and every one of them is ex1 again with a different
sentence. Read the doc comment above each interface and translate it, then check
your answer against what the gate says the symptom of getting it wrong is.

Nothing outside `Ex8Services` needs to change.

## Hint 2

Take them one at a time:

- "the application should only ever pay once" — the count must not climb
- "everything one request puts in it, and nothing from any other" — same within
  a request, different across
- "two tickets are never the same ticket" — different even in one request
- "how many requests this application has handled" — must survive the request

Three different lifetimes appear; one of them appears twice.

## Hint 3

The mapping, one symptom at a time:

- `parserBuilds` climbing → the parser is being rebuilt → it needs to be built
  once → singleton
- two baskets in one request → it is transient and should be scoped
- one ticket for two resolutions → it is shared and should be transient
- `handled` stuck at 1 → the counter dies with the request and should outlive it

Left for you: writing them, and predicting each gate message before you run it.
Being able to go symptom → lifetime without the code in front of you is the
skill this whole lesson is for.
