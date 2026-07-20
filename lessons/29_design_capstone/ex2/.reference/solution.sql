CREATE VIEW gift_card_balances AS
SELECT gc.id AS gift_card_id,
       gc.initial_balance - coalesce(sum(r.amount), 0) AS remaining
FROM gift_cards gc
LEFT JOIN gift_card_redemptions r ON r.gift_card_id = gc.id
GROUP BY gc.id, gc.initial_balance;
