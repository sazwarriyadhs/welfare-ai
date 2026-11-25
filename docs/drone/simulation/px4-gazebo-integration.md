# PX4 and Gazebo Integration

## 1. Purpose

Define the integration boundary between PX4 SITL, Gazebo and WELFARE AI.

## 2. Responsibilities

### PX4

- Simulated flight control.
- Vehicle state and navigation.
- Mission execution.
- Flight telemetry.
- Supported safety and failsafe behaviour.

### Gazebo

- 3D world simulation.
- Vehicle physics.
- Environmental conditions.
- Simulated cameras and supported sensors.
- Sensor output generation.

### MAVLink

- Telemetry exchange.
- Vehicle status.
- Mission communication.
- Supported command and control interfaces.

## 3. Integration Flow

```text
Gazebo World
    |
    v
PX4 SITL Vehicle
    |
    v
MAVLink Interface
    |
    +------> Ground Control Station
    |
    +------> WELFARE AI Drone Adapter
                  |
                  v
             WELFARE AI API
```

## 4. Integration Requirements

- Document supported PX4 and Gazebo versions.
- Record vehicle model and sensor configuration.
- Isolate simulator-specific connection settings.
- Use explicit connection configuration.
- Keep simulation endpoints separate from production endpoints.
- Record telemetry timestamps and coordinate reference information.
- Handle disconnections and incomplete telemetry safely.

## 5. Commercial Drone Compatibility

PX4 SITL integration does not imply direct PX4 control of DJI
or other commercial drone products.

Commercial drone integrations must be evaluated individually
against their actual SDK/API, firmware, payload and permissions.

## 6. Safety

- Use simulation-only endpoints during development.
- Never send simulator commands to a physical aircraft.
- Do not expose MAVLink control endpoints publicly.
- Keep vehicle command permissions separate from data ingestion.
- Document failsafe and emergency-stop test scenarios.

## 7. Validation

The integration is acceptable when telemetry can be received,
parsed, timestamped, associated with a simulation session and
displayed without being mistaken for physical flight data.
