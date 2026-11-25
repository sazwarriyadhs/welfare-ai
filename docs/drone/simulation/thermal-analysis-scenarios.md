# Thermal Analysis Simulation Scenarios

## 1. Objective

Validate thermal imagery ingestion, processing and review workflows.

## 2. Scenario TH-001: Thermal Image Ingestion

- Supply a valid thermal dataset or supported simulated sensor output.
- Validate image format and metadata.
- Record sensor identity and capture timestamp.
- Store evidence reference.

**Expected:** The system distinguishes thermal inputs from RGB images.

## 3. Scenario TH-002: Thermal Pattern Analysis

- Process representative thermal imagery.
- Apply configured analysis regions.
- Generate pattern indicators.
- Preserve relevant image regions and metadata.

**Expected:** Analysis output is traceable to the original image.

## 4. Scenario TH-003: Environmental Variation

Test representative variations such as:

- Different ambient conditions.
- Sun and shade.
- Different capture distances.
- Different viewing angles.
- Sensor noise and calibration variation.

**Expected:** Limitations and data-quality warnings are recorded.

## 5. Scenario TH-004: Human Review

- Generate a thermal anomaly indicator.
- Display the evidence.
- Allow an authorised reviewer to accept, reject or mark inconclusive.
- Record reviewer decision and timestamp.

**Expected:** No automated medical diagnosis is produced.

## 6. Evaluation

Evaluate:

- Input validation success.
- Sensor metadata completeness.
- Processing latency.
- Repeatability.
- False anomaly rate on labelled datasets.
- Human review traceability.

## 7. Important Limitations

Thermal patterns are influenced by environmental conditions,
sensor calibration, distance and other factors.

A thermal anomaly is not proof of fever, disease or injury.
Veterinary assessment remains outside automated AI authority.
