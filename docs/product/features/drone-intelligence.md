# WELFARE AI - Drone Intelligence

## Product Definition

Drone Intelligence is an optional, vendor-neutral integration feature
within the WELFARE AI Animal Welfare Intelligence Platform.

The feature recommends suitable drone categories and models for
livestock monitoring, farm environmental analysis and aerial evidence
collection.

WELFARE AI does not manufacture, sell, lease or supply drone hardware.

Customers select, purchase and operate their own compatible equipment.

WELFARE AI provides software integration, data processing, AI analysis,
visualisation and evidence management for supported devices.

## Product Objectives

1. Extend livestock monitoring with aerial imagery and sensor data.
2. Improve visibility across large farms and remote livestock areas.
3. Support animal counting and distribution analysis.
4. Identify potential welfare risk indicators for human review.
5. Analyse pasture and environmental conditions.
6. Maintain traceable aerial evidence.
7. Integrate compatible drone ecosystems without locking customers
   into a single hardware manufacturer.

## Lifecycle

RECOMMEND
    -> CONNECT
    -> CAPTURE
    -> PROCESS
    -> ANALYSE
    -> REVIEW
    -> RECORD
    -> REPORT

## Recommended Drone Categories

### A. Enterprise Quadcopter - Priority 1

Reference example: DJI Matrice 4T.

Intended use:
- Aerial livestock monitoring.
- Animal detection and counting.
- Herd distribution observation.
- Thermal imagery analysis.
- Farm building and facility inspection.
- Visual observation of animal movement.

Potential capabilities:
- RGB imagery.
- Thermal imagery.
- Geospatial metadata.
- Video and image ingestion.
- AI-assisted animal detection.

### B. Multispectral Drone - Priority 2

Reference example: DJI Mavic 3 Multispectral.

Intended use:
- Pasture and vegetation mapping.
- Feed-area assessment.
- Vegetation change monitoring.
- Farm environmental analysis.
- Spatial comparison of pasture conditions.

Potential capabilities:
- Multispectral imagery.
- RGB imagery.
- Vegetation index processing where sensor calibration
  and required metadata are available.
- Geospatial image analysis.

### C. Agricultural Multirotor / Heavy Payload - Priority 3

Reference example: DJI Agras T50.

Intended use:
- Agricultural land-management activity monitoring.
- Spraying and spreading activity records.
- Pasture management data integration.
- Mapping of agricultural treatment areas.
- Identifying potential animal exposure risks.

This category is optional and is not a primary animal-monitoring drone.

WELFARE AI does not perform autonomous spraying control.

Spraying and spreading operations remain the responsibility
of authorised operators and applicable agricultural safety processes.

### D. VTOL Fixed-Wing - Priority 2

Reference example: Quantum Systems Trinity F90+.

Intended use:
- Large-property aerial surveys.
- Extensive farm mapping.
- Remote pasture monitoring.
- Terrain and environmental mapping.
- Herd distribution observation across large areas.

Potential capabilities:
- Wide-area imagery.
- Geospatial data.
- Survey outputs.
- Mapping and change analysis.

## Core Software Features

### 1. Drone Recommendation
- Recommend drone category based on farm size and monitoring needs.
- Display reference models.
- Compare capabilities and intended use.
- Show integration requirements and limitations.
- Indicate optional or priority categories.

### 2. Drone Compatibility
- Vendor and model information.
- Firmware and SDK/API compatibility.
- Supported sensor information.
- Telemetry availability.
- Media ingestion capability.
- Integration status.

### 3. Aerial Animal Monitoring
- Animal detection.
- Animal counting.
- Herd distribution analysis.
- Movement observation.
- Potential abnormal posture indicators where validated.
- Historical comparison.

### 4. Thermal Intelligence
- Thermal image ingestion.
- Temperature pattern visualisation.
- Potential thermal anomaly indicators.
- Spatial and temporal comparison.

Thermal readings are not a veterinary diagnosis.
Camera calibration, environmental conditions and measurement
limitations must be considered.

### 5. Pasture Intelligence
- Vegetation imagery.
- Multispectral data processing.
- Pasture condition mapping.
- Vegetation change analysis.
- Feed-area visualisation.

### 6. Farm Mapping
- Aerial map layers.
- Farm boundaries.
- Paddock visualisation.
- Geospatial imagery.
- Historical map comparison.

### 7. Drone Evidence Management
- Original image and video references.
- Capture timestamp.
- Geographic coordinates when available.
- Device identity.
- Sensor and camera information.
- Processing history.
- AI model and version.
- Human review status.

### 8. Drone Activity Dashboard
- Connected device status.
- Latest data ingestion.
- Image and video records.
- Mission history where available.
- Monitoring coverage.
- AI analysis results.
- Review and incident links.

## Product Guardrails

- Drone recommendations do not imply hardware supply.
- Integration is subject to actual vendor compatibility.
- AI output is decision support, not automatic legal compliance.
- AI observations require appropriate human verification.
- Drone operations require authorised operators.
- Animal safety and privacy must be considered.
- No automatic pursuit or disturbance of animals.
- No autonomous flight-control promise without a separately
  validated and authorised integration.

## Product Status

This document defines the proposed product scope.
It does not represent completed vendor integrations,
certifications, customer deployments or regulatory approvals.
