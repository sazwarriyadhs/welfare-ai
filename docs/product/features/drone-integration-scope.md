# Drone Integration Scope

## Business Model

WELFARE AI is a software integration platform.

It does not:
- Manufacture drones.
- Sell drone hardware.
- Supply or lease aircraft.
- Guarantee compatibility with all vendors.
- Automatically operate customer aircraft.

It does:
- Recommend suitable drone categories and reference models.
- Integrate compatible devices and data sources.
- Process aerial imagery and sensor data.
- Provide AI-assisted analysis.
- Display geospatial information.
- Maintain traceable evidence and reports.

## Integration Layers

1. Device and vendor identification.
2. Capability and compatibility verification.
3. Credential and access configuration.
4. Telemetry ingestion where supported.
5. Image and video ingestion where supported.
6. Sensor metadata ingestion.
7. AI and geospatial processing.
8. Human review and evidence storage.

## Integration Methods

Potential integration methods include:
- Vendor SDKs and APIs.
- Vendor cloud APIs.
- MAVLink for compatible flight stacks.
- Supported media transfer interfaces.
- RTSP or WebRTC where supported.
- File-based imagery import.
- Geospatial data import.

A protocol is not proof that a specific aircraft supports it.

## Compatibility Status

Use these labels:
- Recommended: suitable category for a stated use case.
- Under Evaluation: technical compatibility not yet verified.
- Supported: integration tested against a defined model and version.
- Limited: only specified data or features supported.
- Unsupported: no validated integration available.

## DJI Ecosystem

DJI Enterprise, Multispectral and Agras devices must be assessed
individually against the relevant SDK/API, firmware, payload and
regional availability.

Do not assume PX4 or MAVLink flight-control compatibility.

## PX4 and ArduPilot

Use MAVLink-based integration for supported flight stacks.
Capability declarations must identify the actual supported messages,
telemetry fields and mission operations.

## Quantum Systems

Use vendor-supported interfaces and validate product-specific
capabilities before advertising integration.

## Security

- Protect vendor credentials.
- Apply least-privilege access.
- Separate media access from flight-control permissions.
- Log integration events.
- Validate incoming media and metadata.
- Apply retention and access policies to aerial imagery.
