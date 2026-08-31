WITH RECURSIVE tree AS (
    SELECT id AS root, id
    FROM staff
    UNION ALL
    SELECT t.root, s.id
    FROM staff s
    JOIN tree t ON s.manager_id = t.id
), subtree AS (
    SELECT t.root, count(*) AS subtree_staff, sum(s.salary) AS subtree_payroll
    FROM tree t
    JOIN staff s ON s.id = t.id
    GROUP BY t.root
)
SELECT m.id, m.name, m.department,
       sub.subtree_staff,
       round(sub.subtree_payroll, 2) AS subtree_payroll,
       round(100 * sub.subtree_payroll / (SELECT sum(salary) FROM staff), 2)
         AS pct_of_payroll
FROM subtree sub
JOIN staff m ON m.id = sub.root
WHERE sub.subtree_payroll >= 0.05 * (SELECT sum(salary) FROM staff)
ORDER BY pct_of_payroll DESC, m.id;
