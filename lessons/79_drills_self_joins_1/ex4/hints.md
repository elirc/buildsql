## Hint 1
The comparison you need is between two columns of the same name in two copies of the same table. That is only confusing until you have aliased both copies.

## Hint 2
`JOIN staff m ON m.id = e.manager_id WHERE e.department <> m.department`. Because departments are inherited down this tree, the answer is small and the rows it finds are exactly the boundary of the org chart - worth looking at once you have it.
