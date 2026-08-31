## Hint 1
Read the direction of each key separately. Only the first one is
descending.

## Hint 2
All thirty rows will come from the alphabetically last country, because
the first key dominates and that country has far more than thirty
customers.

## Hint 3
Build it up one key at a time and look at the output after each: sort by
country alone and confirm the last country is on top, then add
`created_at ASC` and confirm the dates now climb inside that country, then
add `id`. Debugging a three-key sort by staring at the finished query is
much harder than watching it assemble.
