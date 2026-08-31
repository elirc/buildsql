## Hint 1
The stub derives "am I loading?" from "do I have data?", which is why a refresh
throws the data away: it is the only way that implementation can say it is
busy. Separate the two facts.

## Hint 2
Two pieces of state: the rate you last received, and whether a request is in
flight. The second one drives `aria-busy` and nothing else, so the first can be
left alone from the moment it arrives until the moment a better value replaces
it.
