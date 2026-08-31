## Hint 1

The constant is not wrong today - it equals the documented default. It is
unreachable: there is no way for anything outside the assembly to make this
endpoint behave as though the limit were 2, so the boundary can never be
exercised.

## Hint 2

`Model.cs` binds `LoanPolicyOptions` to the `Dojo:D22:Loans` section, so the
value is already configurable; the handler just is not reading it. Take an
`IOptions<LoanPolicyOptions> policy` parameter, read `policy.Value.MaxPerMember`
inside the handler, and use it for both `maxLoans` and the `canBorrow`
comparison.
