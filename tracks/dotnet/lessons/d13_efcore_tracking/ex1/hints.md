## Hint 1

The uppercase assignment is not the bug on its own - the bug is that the vans
are *tracked* when it happens. The audit `SaveChanges` then writes every
detected change in the context, including your display formatting.

## Hint 2

Make the read invisible to the tracker: `db.Vans.AsNoTracking()` before
materialising, or skip entities entirely and `Select` into `BoardRow` first,
formatting in the projection. The audit add-and-save stays exactly as given.
