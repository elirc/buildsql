## Hint 1
Two pieces of state - the chosen country and the chosen city - and everything
else is worked out from them during render: the list of cities, and whether
Continue is allowed.

## Hint 2
The city list is `catalogue[country]`, computed on the way through render. It is
never a third piece of state, because a copied list is a list that can disagree
with the country beside it. The one thing the country handler must do beyond
storing its own value is clear the city.
