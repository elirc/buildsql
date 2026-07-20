SELECT status, count(*), sum(total) FROM orders GROUP BY status;
