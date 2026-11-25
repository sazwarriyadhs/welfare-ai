# Livestock Detection Simulation Scenarios

## 1. Objective

Validate the livestock detection workflow using virtual farm environments
and controlled image datasets.

## 2. Scenario LD-001: Cattle Detection

**Setup:** A simulated dairy or beef paddock with multiple cattle.

**Test:**
- Capture RGB imagery.
- Detect cattle.
- Generate bounding boxes.
- Associate detections with image timestamps.
- Display approximate location where supported.

**Expected:** Valid detections are returned with model version and
confidence metadata.

## 3. Scenario LD-002: Sheep Flock Counting

**Setup:** A simulated sheep flock with varying group density.

**Test:**
- Detect individual sheep.
- Estimate flock count.
- Evaluate missed and duplicate detections.
- Record image quality limitations.

**Expected:** The system reports count estimates and evaluation metrics.

## 4. Scenario LD-003: Herd Distribution

**Setup:** Livestock distributed across a virtual paddock.

**Test:**
- Identify animal positions in image space.
- Associate observations with drone position.
- Generate a geospatial distribution view where calibration permits.

**Expected:** Distribution results include coordinate provenance and
limitations.

## 5. Scenario LD-004: Visual Observation

**Setup:** Simulated animal images with varied posture and visibility.

**Test:**
- Evaluate supported visual indicators.
- Record confidence and image quality.
- Route uncertain findings to human review.

**Expected:** The system does not automatically diagnose injury or disease.

## 6. Evaluation Metrics

- Precision.
- Recall.
- F1 score.
- Counting error.
- False-positive rate.
- False-negative rate.
- Processing latency.
- Performance by species and environment.

## 7. Acceptance Criteria

- Every result links to its source image.
- Every result records the model version.
- Uncertain results can be marked for review.
- Simulated data is clearly labelled.
- Evaluation metrics can be reproduced.
