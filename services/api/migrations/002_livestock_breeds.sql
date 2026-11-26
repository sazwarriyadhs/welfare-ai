-- WELFARE AI
-- Migration: 002_livestock_breeds
-- Purpose: Master reference data for livestock breeds
-- PostgreSQL 17+

BEGIN;

CREATE TABLE IF NOT EXISTS animal.livestock_breeds (
    id SERIAL PRIMARY KEY,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    primary_purpose VARCHAR(255) NOT NULL,
    UNIQUE (species, breed)
);

INSERT INTO animal.livestock_breeds
    (species, breed, primary_purpose)
VALUES
    ('cattle', 'Angus', 'Beef cattle'),
    ('cattle', 'Hereford', 'Beef cattle'),
    ('cattle', 'Friesian', 'Dairy cattle'),
    ('cattle', 'Jersey', 'Dairy cattle (high butterfat content)'),
    ('cattle', 'Wagyu', 'Premium beef cattle (high marbling)'),
    ('cattle', 'Simmental', 'Dual-purpose (beef & dairy)'),
    ('cattle', 'Limousin', 'Beef cattle (fast muscle growth)'),
    ('cattle', 'Brahman', 'Beef cattle (heat/tropical climate tolerant)'),
    ('cattle', 'Bali / Ongole', 'Local beef cattle (tropical climate tolerant)'),

    ('sheep', 'Romney', 'Wool & meat production'),
    ('sheep', 'Perendale', 'Hill-country wool & meat'),
    ('sheep', 'Corriedale', 'Dual-purpose wool & meat'),
    ('sheep', 'Merino', 'Fine wool production'),
    ('sheep', 'Suffolk', 'Meat sheep (terminal sire)'),
    ('sheep', 'Texel', 'Meat sheep (dense, lean carcass)'),
    ('sheep', 'Dorper', 'Hair sheep for meat (no shearing required)'),
    ('sheep', 'Garut / Fat-tailed', 'Local meat & cultural breed'),

    ('goat', 'Boer', 'Meat goat'),
    ('goat', 'Kiko', 'Hardy New Zealand meat goat'),
    ('goat', 'Saanen', 'Dairy goat (high milk yield)'),
    ('goat', 'Toggenburg', 'Swiss dairy goat'),
    ('goat', 'Angora', 'Fiber production (mohair)'),
    ('goat', 'Cashmere', 'Fiber production (cashmere wool)'),
    ('goat', 'Etawa / PE', 'Dual-purpose dairy & meat goat')

ON CONFLICT (species, breed) DO NOTHING;

COMMIT;