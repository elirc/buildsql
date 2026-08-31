WITH RECURSIVE anc AS (
    SELECT id AS node, id AS ancestor
    FROM staff
    UNION ALL
    SELECT a.node, s.manager_id
    FROM anc a
    JOIN staff s ON s.id = a.ancestor
    WHERE s.manager_id IS NOT NULL
), totals AS (
    SELECT a.ancestor AS root,
           count(*) AS subtree_staff,
           sum(s.salary) AS subtree_payroll
    FROM anc a
    JOIN staff s ON s.id = a.node
    GROUP BY a.ancestor
), company AS (
    SELECT sum(salary) AS payroll FROM staff
)
SELECT m.id, m.name, m.department,
       t.subtree_staff,
       round(t.subtree_payroll, 2) AS subtree_payroll,
       round(100 * t.subtree_payroll / c.payroll, 2) AS pct_of_payroll
FROM totals t
JOIN staff m ON m.id = t.root
CROSS JOIN company c
WHERE t.subtree_payroll >= 0.05 * c.payroll
ORDER BY pct_of_payroll DESC, m.id;
