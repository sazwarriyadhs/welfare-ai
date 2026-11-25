# WELFARE AI Drone Simulation Architecture

## 1. Purpose

Drone Simulation Lab is the controlled simulation environment for developing,
integrating and validating WELFARE AI drone intelligence workflows.

It supports simulated livestock monitoring, thermal analysis, GPS tracking,
AI computer vision and platform integration before field deployment.

## 2. High-Level Architecture

```text
WELFARE AI DRONE SIMULATOR
          |
          v
      PX4 + Gazebo
          |
          v
     Drone Autopilot
          |
     GPS + Sensors
          |
          v
   Sensor Data Ingestion
          |
          v
   AI Computer Vision
      |          |
      v          v
 Livestock    Thermal
 Detection    Analysis
      |          |
      +----+-----+
           |
           v
     Drone Adapter
           |
           v
      WELFARE AI API
           |
           v
  WELFARE AI COMMAND CENTRE
```

## 3. Main Components

| Component | Responsibility |
|---|---|
| PX4 SITL | Simulated drone autopilot |
| Gazebo | 3D environment, physics and simulated sensors |
| MAVLink | Flight telemetry and vehicle communication |
| Sensor Ingestion | Receives image, position and sensor data |
| AI Computer Vision | Image analysis and detection |
| Drone Adapter | Normalises vendor/simulator-specific data |
| WELFARE AI API | Stores and exposes platform data |
| Command Centre | Monitoring, review and analytics |

## 4. Data Flow

1. A simulation scenario creates a virtual farm environment.
2. PX4 controls the simulated aircraft.
3. Gazebo provides the simulated world and sensor outputs.
4. Telemetry and sensor data enter the ingestion layer.
5. AI services process supported image and sensor inputs.
6. The Drone Adapter normalises the results.
7. The API stores telemetry, evidence and AI assessments.
8. The Command Centre displays results for human review.

## 5. Architectural Principles

- Simulation and physical drone integrations remain separate.
- Vendor-specific protocols are isolated behind adapters.
- AI assessments retain evidence and model provenance.
- Human review is required for welfare decisions.
- Simulation data must be labelled as simulated.
- No simulated result is represented as a real-world welfare finding.

## 6. System Boundaries

PX4 SITL is used for compatible simulated flight-control setups.
It is not a universal control layer for all supported commercial drones.

Commercial drone integrations must use the applicable vendor-supported
SDK, API, cloud service or data export interface.

## 7. Non-Goals

- Manufacturing or supplying drone hardware.
- Replacing certified drone operators.
- Automatically diagnosing animal disease.
- Automatically declaring regulatory compliance.
- Controlling unsupported commercial drone models.
