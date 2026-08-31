## Hint 1

Cohort = signup quarter, population = 2023 signups who bought at all, and "heavy" is a property of a customer's order count - so aggregate per customer before aggregating per cohort.

## Hint 2

Stage one: join 2023 customers to their orders, GROUP BY customer, keep the count. An inner join is the "bought at all" filter for free.

## Hint 3

Stage two groups stage one by cohort: buyers = count(*), heavy = count(*) FILTER (WHERE orders >= 12), and the rate is 100.0 * heavy / buyers rounded to 1. If your rate sits near 100 percent, your threshold is testing "ordered at all" - the typical buyer here places about ten orders, which is why the bar sits above it.
