## Hint 1
"Including cards never redeemed" is lesson 09: LEFT JOIN from cards to
redemptions, and lesson 27's coalesce around the sum. Group by the card.

## Hint 2
```sql
CREATE VIEW gift_card_balances AS
SELECT gc.id AS gift_card_id,
       gc.initial_balance - coalesce(sum(r.amount), 0) AS remaining
FROM gift_cards gc
LEFT JOIN gift_card_redemptions r ON r.gift_card_id = gc.id
GROUP BY gc.id, gc.initial_balance;
```
