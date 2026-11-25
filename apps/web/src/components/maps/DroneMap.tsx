"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";

type DroneMapProps = {
  connected: boolean;
  latitude: number | null;
  longitude: number | null;
  headingDeg: number | null;
  altitudeM: number | null;
  gpsFix: number | null;
  satellites: number | null;
};

const CIMAH_PAR_FALLBACK: LatLngExpression = [-6.5811973, 106.8313855];

function formatCoordinate(value: number | null): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(7)
    : "--";
}

function isValidCoordinate(
  latitude: number | null,
  longitude: number | null
): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function MapFollower({
  latitude,
  longitude,
  follow,
}: {
  latitude: number;
  longitude: number;
  follow: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!follow) return;

    const target = L.latLng(latitude, longitude);
    const current = map.getCenter();

    // Avoid unnecessary map movement from small telemetry fluctuations.
    if (current.distanceTo(target) > 5) {
      map.panTo(target, { animate: true, duration: 0.5 });
    }
  }, [latitude, longitude, follow, map]);

  return null;
}

function createDroneIcon(heading: number) {
  return L.divIcon({
    className: "drone-map-icon-wrapper",
    html: `
      <div class="drone-map-marker" style="transform: rotate(${heading}deg)">
        <svg viewBox="0 0 48 48" width="44" height="44"
          xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="21" fill="#24764e"
            fill-opacity=".16" />
          <path d="M24 5 L38 37 L24 29 L10 37 Z"
            fill="#24764e" stroke="#ffffff" stroke-width="2.5"
            stroke-linejoin="round"/>
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export default function DroneMap({
  connected,
  latitude,
  longitude,
  headingDeg,
  altitudeM,
  gpsFix,
  satellites,
}: DroneMapProps) {
  const [follow, setFollow] = useState(true);

  const validPosition =
    connected &&
    gpsFix != null &&
    gpsFix >= 2 &&
    isValidCoordinate(latitude, longitude);

  const center = useMemo<LatLngExpression>(() => {
    if (validPosition && latitude != null && longitude != null) {
      return [latitude, longitude];
    }
    return CIMAH_PAR_FALLBACK;
  }, [validPosition, latitude, longitude]);

  const heading =
    typeof headingDeg === "number" && Number.isFinite(headingDeg)
      ? ((headingDeg % 360) + 360) % 360
      : 0;

  const droneIcon = useMemo(
    () => createDroneIcon(heading),
    [heading]
  );

  return (
    <div className="drone-map-shell">
      <div className="drone-map-toolbar">
        <div>
          <div className="drone-map-title">GEOSPATIAL TRACKING</div>
          <div className="drone-map-subtitle">
            OpenStreetMap · Live GPS telemetry
          </div>
        </div>

        <button
          type="button"
          className={`drone-map-follow ${follow ? "active" : ""}`}
          onClick={() => setFollow((value) => !value)}
        >
          {follow ? "Following drone" : "Follow drone"}
        </button>
      </div>

      <div className="drone-map-canvas">
        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom
          className="drone-leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {validPosition &&
            latitude != null &&
            longitude != null && (
              <>
                <MapFollower
                  latitude={latitude}
                  longitude={longitude}
                  follow={follow}
                />

                <Marker
                  position={[latitude, longitude]}
                  icon={droneIcon}
                >
                  <Popup>
                    <strong>WELFARE AI Drone</strong>
                    <br />
                    Latitude: {formatCoordinate(latitude)}
                    <br />
                    Longitude: {formatCoordinate(longitude)}
                    <br />
                    Heading: {heading.toFixed(1)}°
                    <br />
                    Altitude:{" "}
                    {altitudeM != null
                      ? `${altitudeM.toFixed(1)} m`
                      : "--"}
                  </Popup>
                </Marker>
              </>
            )}
        </MapContainer>

        {!validPosition && (
          <div className="drone-map-overlay">
            <strong>GPS POSITION UNAVAILABLE</strong>
            <span>
              {connected
                ? "Waiting for a valid GPS fix"
                : "Waiting for live telemetry connection"}
            </span>
            <span>Showing Bogor reference area only</span>
          </div>
        )}

        <div className="drone-map-coordinate">
          <span className={validPosition ? "gps-live-dot" : "gps-wait-dot"} />
          <div>
            <strong>{validPosition ? "GPS POSITION LIVE" : "GPS STANDBY"}</strong>
            <span>
              {validPosition && latitude != null && longitude != null
                ? `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
                : "No valid drone position"}
            </span>
          </div>
        </div>
      </div>

      <div className="drone-map-footer">
        <span>GPS FIX: {validPosition ? `${gpsFix}D` : "--"}</span>
        <span>SATELLITES: {validPosition ? satellites ?? "--" : "--"}</span>
        <span>ALTITUDE: {validPosition && altitudeM != null
          ? `${altitudeM.toFixed(1)} m`
          : "--"}</span>
        <span>HEADING: {validPosition ? `${heading.toFixed(1)}°` : "--"}</span>
      </div>
    </div>
  );
}
