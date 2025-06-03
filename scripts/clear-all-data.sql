-- Clear all data from tables (keeping structure)
DELETE FROM audit_trail;
DELETE FROM product_mappings;
DELETE FROM stock_levels;
DELETE FROM outlets;
DELETE FROM products;
DELETE FROM users;

-- Reset categories and regions to defaults only
DELETE FROM categories;
DELETE FROM regions;

-- Insert default categories
INSERT INTO categories (name, created_at, updated_at) VALUES 
('Standard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Premium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default regions
INSERT INTO regions (name, created_at, updated_at) VALUES 
('North', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('South', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('East', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('West', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Central', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset sequences
ALTER SEQUENCE outlets_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 3;
ALTER SEQUENCE regions_id_seq RESTART WITH 6;
ALTER SEQUENCE stock_levels_id_seq RESTART WITH 1;
ALTER SEQUENCE product_mappings_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_trail_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

SELECT 'All data cleared successfully. Database reset to clean state.' as result;
