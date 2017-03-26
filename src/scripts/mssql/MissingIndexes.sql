SELECT *
FROM sys.dm_db_missing_index_group_stats
ORDER BY avg_total_user_cost * avg_user_impact * (user_seeks + user_scans) DESC;

/*
-- or just this...
SELECT *
FROM sys.dm_db_missing_index_details
*/