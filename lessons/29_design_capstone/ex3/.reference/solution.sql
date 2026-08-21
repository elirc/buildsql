CREATE VIEW gift_card_usage AS
SELECT g.id AS gift_card_id,
       count(r.id) AS redemptions,
       coalesce(sum(r.amount), 0) AS used
FROM gift_cards g
LEFT JOIN gift_card_redemptions r ON r.gift_card_id = g.id
GROUP BY g.id;
