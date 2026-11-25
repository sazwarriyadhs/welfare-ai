# Drone Simulator Overview

## 1. Objective

Provide a repeatable environment for testing WELFARE AI drone workflows
without requiring physical drone hardware.

## 2. Simulation Stack

| Layer | Technology | Purpose |
|---|---|---|
| Flight controller | PX4 SITL | Simulated autopilot |
| 3D simulation | Gazebo | Terrain, physics and environment |
| Vehicle communication | MAVLink | Telemetry and commands |
| Ground control | QGroundControl | Mission monitoring and planning |
| Image processing | OpenCV | Image preparation |
| AI inference | Python AI service | Detection and analysis |
| Platform integration | Go API | Data and workflow integration |
| Dashboard | Next.js | Monitoring and review |

## 3. Virtual Farm Environment

The simulation environment should progressively support:

- Dairy farm paddocks.
- Sheep grazing areas.
- Beef cattle paddocks.
- Farm buildings and shelters.
- Livestock handling yards.
- Transport loading areas.
- Slaughterhouse external facilities.

## 4. Virtual Assets

Virtual assets may include:

- Cattle, sheep and other supported livestock models.
- Farm boundaries and paddocks.
- Trees, fences, buildings and water points.
- Drone models and camera payloads.
- Weather and lighting conditions.

## 5. Simulation Modes

| Mode | Description |
|---|---|
| Flight Test | Basic take-off, navigation and landing |
| Livestock Survey | Simulated herd observation |
| Thermal Test | Thermal sensor data processing |
| GPS Test | Position and geospatial validation |
| AI Test | Image inference and result validation |
| End-to-End Test | Simulator-to-Command-Centre workflow |

## 6. Reproducibility

Every test run should record:

- Scenario ID.
- Simulator and world version.
- Vehicle configuration.
- Sensor configuration.
- AI model version.
- Start and end timestamps.
- Test outcome.
- Known limitations.

## 7. Data Classification

All simulator-generated data must carry a simulation identifier and
a clear simulated-data marker. It must not be mixed with real farm
observations without explicit data provenance.
