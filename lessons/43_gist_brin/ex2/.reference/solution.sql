SELECT pg_relation_size('events_ts_btree_idx') >
       50 * pg_relation_size('events_ts_brin_idx');
