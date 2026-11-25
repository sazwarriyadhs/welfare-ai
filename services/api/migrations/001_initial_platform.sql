-- WELFARE AI
-- Migration: 001_initial_platform
-- PostgreSQL 17+

BEGIN;

CREATE SCHEMA platform;
CREATE SCHEMA identity;
CREATE SCHEMA farm;
CREATE SCHEMA animal;
CREATE SCHEMA welfare;
CREATE SCHEMA evidence;
CREATE SCHEMA drone;
CREATE SCHEMA ai;
CREATE SCHEMA audit;

-- Migration ledger
CREATE TABLE platform.schema_migrations (
    version BIGINT PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    checksum CHAR(64) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    execution_ms BIGINT NOT NULL DEFAULT 0
);

-- IDENTITY AND TENANCY
CREATE TABLE identity.organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    legal_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'archived')),
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE identity.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    password_hash TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'disabled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email_lower
    ON identity.users (LOWER(email));

CREATE TABLE identity.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    user_id UUID NOT NULL REFERENCES identity.users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('invited', 'active', 'suspended')),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organisation_id, user_id)
);

CREATE TABLE identity.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_key VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE identity.membership_roles (
    membership_id UUID NOT NULL
        REFERENCES identity.memberships(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES identity.roles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (membership_id, role_id)
);

-- FARM AND FACILITIES
CREATE TABLE farm.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    name VARCHAR(255) NOT NULL,
    site_type VARCHAR(50) NOT NULL DEFAULT 'farm',
    address JSONB NOT NULL DEFAULT '{}',
    timezone VARCHAR(80) NOT NULL DEFAULT 'Pacific/Auckland',
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organisation_id, name)
);

CREATE TABLE farm.paddocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    site_id UUID NOT NULL REFERENCES farm.sites(id),
    name VARCHAR(150) NOT NULL,
    area_hectares NUMERIC(12,3),
    boundary_geojson JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (area_hectares IS NULL OR area_hectares >= 0),
    UNIQUE (site_id, name)
);

-- ANIMAL MANAGEMENT
CREATE TABLE animal.animal_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    site_id UUID REFERENCES farm.sites(id),
    name VARCHAR(150) NOT NULL,
    species VARCHAR(40) NOT NULL
        CHECK (species IN ('cattle', 'sheep', 'goat', 'other')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE animal.animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    site_id UUID REFERENCES farm.sites(id),
    paddock_id UUID REFERENCES farm.paddocks(id),
    group_id UUID REFERENCES animal.animal_groups(id),
    species VARCHAR(40) NOT NULL
        CHECK (species IN ('cattle', 'sheep', 'goat', 'other')),
    sex VARCHAR(20),
    date_of_birth DATE,
    breed VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'sold', 'deceased', 'transferred')),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE animal.animal_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL
        REFERENCES animal.animals(id) ON DELETE CASCADE,
    identifier_type VARCHAR(40) NOT NULL,
    identifier_value VARCHAR(150) NOT NULL,
    issued_at TIMESTAMPTZ,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (identifier_type, identifier_value)
);

-- WELFARE MANAGEMENT
CREATE TABLE welfare.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    site_id UUID REFERENCES farm.sites(id),
    inspector_user_id UUID REFERENCES identity.users(id),
    inspection_type VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    checklist JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE welfare.observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    site_id UUID REFERENCES farm.sites(id),
    animal_id UUID REFERENCES animal.animals(id),
    inspection_id UUID REFERENCES welfare.inspections(id),
    source_type VARCHAR(30) NOT NULL DEFAULT 'manual'
        CHECK (source_type IN ('manual', 'ai', 'drone', 'iot', 'import')),
    observation_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20)
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES identity.users(id),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE TABLE welfare.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    site_id UUID REFERENCES farm.sites(id),
    animal_id UUID REFERENCES animal.animals(id),
    observation_id UUID REFERENCES welfare.observations(id),
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE welfare.corrective_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    incident_id UUID REFERENCES welfare.incidents(id),
    observation_id UUID REFERENCES welfare.observations(id),
    assigned_to UUID REFERENCES identity.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'completed', 'verified', 'cancelled')),
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EVIDENCE MANAGEMENT
CREATE TABLE evidence.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    storage_provider VARCHAR(50) NOT NULL,
    storage_key TEXT NOT NULL,
    original_filename TEXT,
    content_type VARCHAR(150),
    file_size_bytes BIGINT,
    sha256 CHAR(64),
    captured_at TIMESTAMPTZ,
    uploaded_by UUID REFERENCES identity.users(id),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
    UNIQUE (storage_provider, storage_key)
);

CREATE TABLE evidence.observation_files (
    observation_id UUID NOT NULL
        REFERENCES welfare.observations(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES evidence.files(id),
    PRIMARY KEY (observation_id, file_id)
);

-- DRONE INTELLIGENCE
CREATE TABLE drone.fleets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    site_id UUID REFERENCES farm.sites(id),
    name VARCHAR(150) NOT NULL,
    vendor VARCHAR(80),
    model VARCHAR(120),
    serial_number VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE drone.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    fleet_id UUID NOT NULL REFERENCES drone.fleets(id),
    mission_type VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'scheduled', 'in_progress', 'completed', 'aborted')),
    planned_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    flight_plan JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE drone.telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL
        REFERENCES drone.missions(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    altitude_m NUMERIC(10,2),
    battery_percent NUMERIC(5,2),
    telemetry JSONB NOT NULL DEFAULT '{}',
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    CHECK (battery_percent IS NULL OR battery_percent BETWEEN 0 AND 100)
);

-- AI INTELLIGENCE AND HUMAN REVIEW
CREATE TABLE ai.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(150) NOT NULL,
    model_version VARCHAR(80) NOT NULL,
    model_type VARCHAR(80) NOT NULL,
    artifact_reference TEXT,
    configuration JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(30) NOT NULL DEFAULT 'development'
        CHECK (status IN ('development', 'validated', 'production', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (model_name, model_version)
);

CREATE TABLE ai.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL
        REFERENCES identity.organisations(id),
    model_version_id UUID REFERENCES ai.model_versions(id),
    subject_type VARCHAR(60) NOT NULL,
    subject_id UUID,
    observation_id UUID REFERENCES welfare.observations(id),
    assessment_type VARCHAR(100) NOT NULL,
    confidence NUMERIC(6,5),
    risk_level VARCHAR(20),
    result JSONB NOT NULL DEFAULT '{}',
    evidence_file_id UUID REFERENCES evidence.files(id),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1)
);

CREATE TABLE ai.review_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL
        REFERENCES ai.assessments(id) ON DELETE CASCADE,
    reviewer_user_id UUID REFERENCES identity.users(id),
    decision VARCHAR(30) NOT NULL
        CHECK (decision IN ('accepted', 'rejected', 'needs_review', 'corrected')),
    reviewer_notes TEXT,
    corrected_result JSONB,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AUDIT TRAIL
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID REFERENCES identity.organisations(id),
    actor_user_id UUID REFERENCES identity.users(id),
    action VARCHAR(100) NOT NULL,
    entity_schema VARCHAR(80),
    entity_table VARCHAR(80),
    entity_id UUID,
    before_state JSONB,
    after_state JSONB,
    ip_address INET,
    user_agent TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_memberships_user ON identity.memberships(user_id);
CREATE INDEX idx_sites_organisation ON farm.sites(organisation_id);
CREATE INDEX idx_paddocks_site ON farm.paddocks(site_id);
CREATE INDEX idx_animals_org_site ON animal.animals(organisation_id, site_id);
CREATE INDEX idx_animals_group ON animal.animals(group_id);
CREATE INDEX idx_animal_identifiers_animal ON animal.animal_identifiers(animal_id);
CREATE INDEX idx_observations_org_time ON welfare.observations(organisation_id, observed_at DESC);
CREATE INDEX idx_observations_animal ON welfare.observations(animal_id, observed_at DESC);
CREATE INDEX idx_incidents_org_status ON welfare.incidents(organisation_id, status);
CREATE INDEX idx_actions_org_status ON welfare.corrective_actions(organisation_id, status);
CREATE INDEX idx_evidence_org ON evidence.files(organisation_id);
CREATE INDEX idx_drone_missions_fleet ON drone.missions(fleet_id, planned_at DESC);
CREATE INDEX idx_drone_telemetry_mission_time ON drone.telemetry(mission_id, recorded_at);
CREATE INDEX idx_ai_assessments_org_time ON ai.assessments(organisation_id, assessed_at DESC);
CREATE INDEX idx_ai_reviews_assessment ON ai.review_decisions(assessment_id, reviewed_at DESC);
CREATE INDEX idx_audit_org_time ON audit.audit_logs(organisation_id, occurred_at DESC);

COMMIT;