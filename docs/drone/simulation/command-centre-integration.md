# Drone Simulation Command Centre Integration

## 1. Objective

Display drone simulation activity and AI-generated intelligence
inside the WELFARE AI Command Centre.

## 2. Dashboard Capabilities

- Simulation session overview.
- Virtual drone status.
- Mission progress.
- GPS position and flight path.
- Sensor availability.
- Livestock detection results.
- Thermal analysis indicators.
- AI processing status.
- Evidence viewer.
- Human review queue.

## 3. Data Flow

```text
PX4 / Gazebo
     |
     v
Drone Adapter
     |
     v
WELFARE AI API
     |
     +----> Mission and Telemetry
     |
     +----> Evidence and Sensor Data
     |
     +----> AI Assessments
                 |
                 v
          Human Review
                 |
                 v
         Command Centre UI
```

## 4. Suggested Dashboard Sections

### Simulation Overview

Show active, completed and failed simulation sessions.

### Drone Monitoring

Show virtual drone identity, connection state, location and mission status.

### AI Intelligence

Show detection counts, analysis status, confidence and model version.

### Evidence Review

Allow users to inspect original imagery and related AI assessments.

### Review and Action

Allow authorised users to record review decisions and initiate
appropriate follow-up workflows.

## 5. API Data Requirements

The integration should expose versioned contracts for:

- Simulation sessions.
- Drone identity and status.
- Missions.
- Telemetry.
- Sensor observations.
- Evidence references.
- AI assessments.
- Review decisions.

Exact endpoint paths and schemas must be defined during API implementation.

## 6. Data Provenance

Every simulation-originated record must be identifiable as simulated.
The dashboard must visibly distinguish simulated data from physical
drone and real-world farm data.

## 7. Access Control

- Restrict mission and simulation management to authorised roles.
- Restrict review decisions to authorised reviewers.
- Apply organisation and site-level data access.
- Keep audit records for important actions.

## 8. Operational Limitations

The Command Centre displays intelligence and evidence for review.
It does not automatically certify animal welfare, diagnose disease
or replace professional judgement.
