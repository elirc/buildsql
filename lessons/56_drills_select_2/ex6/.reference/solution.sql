SELECT p.id, p.price, (p.price - 5) AS after_coupon
FROM products AS p;
