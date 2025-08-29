-- Performance optimization migration
-- File: 003_optimize_database_performance.sql
-- Purpose: Add composite indexes and optimize queries for scalability

-- ============================================================================
-- COMPOSITE INDEXES FOR PROFESSIONS TABLE
-- ============================================================================

-- Index for area filtering with creation date (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professions_area_created 
ON professions(area, created_at DESC);

-- Index for search queries (name + area combination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professions_name_area 
ON professions(name, area);

-- Full-text search index for name and description
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professions_search 
ON professions USING gin(to_tsvector('portuguese', name || ' ' || description));

-- Index for salary range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professions_salary_range 
ON professions(salary_min, salary_max) WHERE salary_min > 0;

-- Index for galaxy positioning (x, y coordinates)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professions_position 
ON professions(x_position, y_position);

-- ============================================================================
-- USER-RELATED INDEXES
-- ============================================================================

-- Composite index for user activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_activity 
ON user_progress(user_id, created_at DESC);

-- Index for profession popularity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_profession_time 
ON user_progress(profession_id, created_at DESC);

-- User profiles optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_location 
ON user_profiles(city, state) WHERE city IS NOT NULL;

-- Educational info filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_education_level_status 
ON education_info(current_level, status);

-- Professional info queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professional_status_change 
ON professional_info(status, career_change_interest);

-- ============================================================================
-- MATERIALIZED VIEWS FOR STATISTICS
-- ============================================================================

-- Create materialized view for profession statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS profession_stats AS
SELECT 
    area,
    COUNT(*) as total_professions,
    AVG(salary_min) as avg_salary_min,
    AVG(salary_max) as avg_salary_max,
    MIN(salary_min) as min_salary,
    MAX(salary_max) as max_salary,
    COUNT(DISTINCT required_education) as education_variety
FROM professions
WHERE salary_min > 0 AND salary_max > 0
GROUP BY area
ORDER BY total_professions DESC;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_profession_stats_area 
ON profession_stats(area);

-- Create materialized view for user activity statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_stats AS
SELECT 
    DATE_TRUNC('day', up.created_at) as activity_date,
    COUNT(DISTINCT up.user_id) as active_users,
    COUNT(up.id) as total_interactions,
    COUNT(DISTINCT up.profession_id) as professions_viewed,
    p.area,
    COUNT(*) as area_interactions
FROM user_progress up
JOIN professions p ON up.profession_id = p.id
WHERE up.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', up.created_at), p.area
ORDER BY activity_date DESC, area_interactions DESC;

-- Index on user activity stats
CREATE INDEX IF NOT EXISTS idx_user_activity_stats_date_area 
ON user_activity_stats(activity_date DESC, area);

-- ============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_stats_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY profession_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_stats;
    
    -- Log the refresh
    INSERT INTO system_logs (message, created_at) 
    VALUES ('Materialized views refreshed', NOW())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SYSTEM LOGS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    level VARCHAR(20) DEFAULT 'info',
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_logs_created 
ON system_logs(created_at DESC);

-- ============================================================================
-- PERFORMANCE OPTIMIZATION QUERIES
-- ============================================================================

-- Optimize existing queries by rewriting them to use new indexes

-- Function for optimized profession search
CREATE OR REPLACE FUNCTION search_professions(
    search_query TEXT DEFAULT NULL,
    area_filter TEXT DEFAULT NULL,
    salary_min_filter INTEGER DEFAULT NULL,
    salary_max_filter INTEGER DEFAULT NULL,
    page_limit INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id INTEGER,
    name VARCHAR(255),
    description TEXT,
    area VARCHAR(100),
    salary_min INTEGER,
    salary_max INTEGER,
    relevance_score INTEGER
) AS $$
BEGIN
    IF search_query IS NOT NULL THEN
        -- Use full-text search with ranking
        RETURN QUERY
        SELECT 
            p.id, p.name, p.description, p.area, p.salary_min, p.salary_max,
            CASE 
                WHEN p.name ILIKE ('%' || search_query || '%') THEN 3
                WHEN p.description ILIKE ('%' || search_query || '%') THEN 2
                WHEN p.area ILIKE ('%' || search_query || '%') THEN 1
                ELSE 0
            END as relevance_score
        FROM professions p
        WHERE 
            (p.name ILIKE ('%' || search_query || '%') OR 
             p.description ILIKE ('%' || search_query || '%') OR 
             p.area ILIKE ('%' || search_query || '%'))
            AND (area_filter IS NULL OR p.area = area_filter)
            AND (salary_min_filter IS NULL OR p.salary_max >= salary_min_filter)
            AND (salary_max_filter IS NULL OR p.salary_min <= salary_max_filter)
        ORDER BY relevance_score DESC, p.created_at DESC
        LIMIT page_limit OFFSET page_offset;
    ELSE
        -- Regular listing with filters
        RETURN QUERY
        SELECT 
            p.id, p.name, p.description, p.area, p.salary_min, p.salary_max,
            0 as relevance_score
        FROM professions p
        WHERE 
            (area_filter IS NULL OR p.area = area_filter)
            AND (salary_min_filter IS NULL OR p.salary_max >= salary_min_filter)
            AND (salary_max_filter IS NULL OR p.salary_min <= salary_max_filter)
        ORDER BY p.created_at DESC
        LIMIT page_limit OFFSET page_offset;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CLEANUP AND MAINTENANCE
-- ============================================================================

-- Update table statistics
ANALYZE professions;
ANALYZE user_progress;
ANALYZE user_profiles;
ANALYZE education_info;
ANALYZE professional_info;

-- Clean up old user progress data (older than 1 year)
DELETE FROM user_progress 
WHERE created_at < NOW() - INTERVAL '1 year';

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Create a view for monitoring slow queries
CREATE OR REPLACE VIEW slow_query_monitor AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('professions', 'users', 'user_progress')
ORDER BY tablename, attname;

-- ============================================================================
-- FINAL OPTIMIZATIONS
-- ============================================================================

-- Increase statistics target for better query planning
ALTER TABLE professions ALTER COLUMN area SET STATISTICS 1000;
ALTER TABLE professions ALTER COLUMN name SET STATISTICS 1000;
ALTER TABLE user_progress ALTER COLUMN profession_id SET STATISTICS 1000;

-- Enable auto-vacuum for better maintenance
ALTER TABLE professions SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE user_progress SET (autovacuum_vacuum_scale_factor = 0.1);

-- Log completion
INSERT INTO system_logs (message, level, context) 
VALUES (
    'Database optimization migration completed', 
    'info', 
    '{"migration": "003_optimize_database_performance", "timestamp": "' || NOW() || '"}'
);

COMMIT;