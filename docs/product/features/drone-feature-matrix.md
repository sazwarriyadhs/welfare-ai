# Drone Intelligence - Feature Matrix

| Feature | Enterprise Quadcopter | Multispectral | Agricultural Multirotor | VTOL Fixed-Wing |
|---|---|---|---|---|
| Animal detection | Primary | Limited / optional | Not primary | Possible |
| Animal counting | Primary | Limited / optional | Not primary | Possible |
| Thermal analysis | Sensor dependent | Not assumed | Payload dependent | Sensor dependent |
| RGB imagery | Yes, model dependent | Yes | Payload dependent | Payload dependent |
| Multispectral analysis | Not assumed | Primary | Not assumed | Payload dependent |
| Pasture mapping | Supporting | Primary | Supporting | Primary |
| Large-area mapping | Limited by mission | Supporting | Not primary | Primary |
| Facility monitoring | Primary | Supporting | Not primary | Supporting |
| Spraying activity records | Not primary | Not primary | Primary | Not primary |
| Geospatial evidence | Yes | Yes | If available | Yes |

## Interpretation

- Primary: intended core use case for the category.
- Supporting: useful secondary capability.
- Possible: subject to payload, flight and image resolution.
- Limited / optional: not a default supported capability.
- Not assumed: must not be advertised without model-specific validation.

This matrix is a product planning guide, not a universal hardware
specification or compatibility certification.
