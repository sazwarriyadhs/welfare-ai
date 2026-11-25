# Sensor Simulation Specification

## 1. Purpose

Define sensor inputs required by WELFARE AI Drone Intelligence.

## 2. Sensor Categories

| Sensor | Data | Primary Use |
|---|---|---|
| RGB Camera | Visible-light images | Livestock detection |
| Thermal Camera | Thermal imagery | Thermal pattern analysis |
| GPS | Latitude, longitude, altitude | Geospatial tracking |
| IMU | Acceleration and angular velocity | Vehicle state |
| Multispectral | Multiple spectral bands | Pasture intelligence |
| Environmental | Supported environmental readings | Contextual analysis |

## 3. RGB Camera

Required configurable properties:

- Resolution.
- Frame rate.
- Field of view.
- Camera orientation.
- Exposure and lighting conditions.
- Image timestamp.

Use cases include livestock detection, counting and visual observation.

## 4. Thermal Camera

Thermal simulation must use a thermal-capable sensor model or
representative thermal datasets.

RGB imagery must never be labelled as thermal imagery.

Record, where available:

- Temperature representation and units.
- Sensor calibration metadata.
- Image dimensions.
- Timestamp.
- Sensor configuration.
- Environmental assumptions.

Thermal anomalies are indicators for review, not automatic diagnoses.

## 5. GPS and Position

Record:

- Latitude.
- Longitude.
- Altitude.
- Coordinate reference system.
- Timestamp.
- Position quality where available.

Invalid or incomplete coordinates must be rejected or explicitly
marked as incomplete.

## 6. Multispectral Sensors

Multispectral simulation requires appropriate spectral-band data
or dedicated sensor simulation.

Do not treat ordinary RGB imagery as multispectral evidence.

## 7. Sensor Provenance

Every sensor record should include:

- Source type: simulated or physical.
- Sensor identifier.
- Vehicle identifier.
- Capture timestamp.
- Scenario or mission identifier.
- Data format and schema version.

## 8. Limitations

Simulation accuracy depends on the sensor model, environment,
rendering and available datasets. Simulated sensor outputs do not
prove real-world sensor performance.
