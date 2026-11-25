# AI Computer Vision Pipeline

## 1. Purpose

Define the AI processing pipeline for simulated drone imagery
and sensor data.

## 2. Pipeline

```text
Image / Sensor Input
        |
        v
Input Validation
        |
        v
Pre-processing
        |
        v
AI Model Inference
        |
        v
Post-processing
        |
        v
Confidence and Quality Checks
        |
        v
Evidence Packaging
        |
        v
WELFARE AI API
        |
        v
Human Review
```

## 3. Intelligence Modules

### Livestock Detection

- Animal detection.
- Animal counting.
- Herd distribution.
- Detection confidence.
- Image and location association.

### Thermal Analysis

- Thermal image ingestion.
- Temperature-pattern analysis.
- Configurable anomaly indicators.
- Sensor quality checks.
- Human review workflow.

### Behaviour and Movement Indicators

- Observable posture and movement indicators.
- Group movement patterns.
- Potentially unusual behaviour for review.

### Pasture Intelligence

- Vegetation image processing.
- Field coverage.
- Supported multispectral analysis.
- Geospatial association.

## 4. AI Assessment Metadata

Each AI assessment should retain:

- Assessment ID.
- Scenario or mission ID.
- Input evidence reference.
- Model name and version.
- Inference timestamp.
- Confidence score where applicable.
- Output classification.
- Processing status.
- Human review status.

## 5. Human Review

AI output is decision support only.

A qualified or authorised human reviewer must be able to:

- Accept a finding.
- Reject a finding.
- Mark it inconclusive.
- Add comments.
- Request further inspection.
- Initiate an incident or corrective action where appropriate.

## 6. Model Validation

Models must be evaluated separately across species, camera angles,
lighting, distance, weather, sensor type and environmental conditions.

Simulation performance must not be represented as field accuracy.

## 7. Failure Handling

- Reject unsupported input formats.
- Record inference failures.
- Preserve original evidence.
- Avoid silently replacing failed predictions.
- Retain model and processing provenance.
