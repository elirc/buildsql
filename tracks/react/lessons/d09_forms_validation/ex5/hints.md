## Hint 1
The stub tests the string the user typed. People type with the caps lock off and
paste with spaces attached - neither is a mistake anybody wants to be told
about.

## Hint 2
There is one value the rest of the function should see: the cleaned one. Compute
it at the top of the handler, test that, and hand that to the callback - the raw
string never leaves the component.
