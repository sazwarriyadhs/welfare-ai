# Drone Simulation Test Plan

## 1. Objective

Establish repeatable testing for the WELFARE AI Drone Simulation Lab.

## 2. Test Levels

| Level | Scope |
|---|---|
| Unit | Individual parsers and processing functions |
| Component | PX4, Gazebo and sensor adapters |
| Integration | Telemetry, AI service and API |
| End-to-End | Simulation to Command Centre |
| Regression | Previously validated scenarios |

## 3. Test Categories

### Flight and Telemetry

- Vehicle connection.
- Take-off and landing simulation.
- Position updates.
- Mission progress.
- Connection interruption.

### Sensor

- RGB image ingestion.
- Thermal image ingestion.
- GPS validation.
- Timestamp consistency.
- Invalid and incomplete data.

### AI

- Livestock detection.
- Flock counting.
- Thermal analysis.
- Confidence handling.
- Model provenance.

### Platform

- API ingestion.
- Evidence storage.
- Assessment retrieval.
- Human review.
- Command Centre display.

## 4. End-to-End Acceptance Criteria

A simulation run is accepted when:

1. A scenario can be started and identified.
2. Telemetry is associated with the correct simulation session.
3. Sensor data is received and validated.
4. AI results reference their original evidence.
5. The API records the relevant metadata.
6. The Command Centre displays the simulation results.
7. A human reviewer can record a review decision.
8. All records retain simulated-data provenance.

## 5. Test Evidence

Each test run should produce:

- Test run ID.
- Scenario ID.
- Configuration snapshot.
- Software and model versions.
- Input dataset references.
- Execution logs.
- Expected and actual outcomes.
- Pass/fail status.
- Known issues.

## 6. Isolation

Simulation tests must use dedicated development/test endpoints
and test data. They must not accidentally create production
animal welfare observations.

## 7. Release Gate

No feature should be marked Tested or Released solely because
a simulator demonstration was successful. Relevant unit,
integration and field validation requirements must also be met.
