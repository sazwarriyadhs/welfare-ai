"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import { useI18n } from "@/i18n/I18nProvider";

type DroneMapProps = {
  connected: boolean;
  latitude: number | null;
  longitude: number | null;
  headingDeg: number | null;
  altitudeM: number | null;
  gpsFix: number | null;
  satellites: number | null;
};

type MapLayer = "satellite" | "street";

type Coordinate = [number, number];

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

    if (current.distanceTo(target) > 2) {
      map.panTo(target, { animate: true, duration: 0.4 });
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
  const { t } = useI18n();

  const [follow, setFollow] = useState(true);
  const [layer, setLayer] = useState<MapLayer>("satellite");
  const [trailState, setTrailState] = useState<{
    points: Coordinate[];
    last: Coordinate | null;
  }>({
    points: [],
    last: null,
  });

  const validPosition =
    connected &&
    gpsFix != null &&
    gpsFix >= 2 &&
    isValidCoordinate(latitude, longitude);

  const trail = trailState.points;

  // Track GPS history with a guarded render-state adjustment.
  // This avoids synchronous state updates inside an effect.
  if (validPosition && latitude != null && longitude != null) {
    const next: Coordinate = [latitude, longitude];
    const last = trailState.last;

    const shouldAppend =
      !last ||
      L.latLng(last[0], last[1]).distanceTo(
        L.latLng(next[0], next[1])
      ) >= 3;

    if (shouldAppend) {
      setTrailState((previous) => ({
        points: [...previous.points, next].slice(-500),
        last: next,
      }));
    }
  }

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

  const toggleLayer = () => {
    setLayer((current) =>
      current === "satellite" ? "street" : "satellite"
    );
  };

  return (
    <div className="drone-map-shell">
      <div className="drone-map-toolbar">
        <div>
          <div className="drone-map-title">{t("droneMapTitle")}</div>
          <div className="drone-map-subtitle">
            {t("droneMapSubtitle")}
          </div>
        </div>

        <div className="drone-map-actions">
          <button
            type="button"
            className="drone-map-layer"
            onClick={toggleLayer}
            aria-label="Toggle map layer"
          >
            {layer === "satellite"
              ? t("droneMapStreet")
              : t("droneMapSatellite")}
          </button>

          <button
            type="button"
            className={`drone-map-follow ${follow ? "active" : ""}`}
            onClick={() => setFollow((value) => !value)}
            aria-pressed={follow}
          >
            {follow ? t("droneFollowing") : t("droneFollow")}
          </button>
        </div>
      </div>

      <div className="drone-map-canvas">
        <MapContainer
          center={center}
          zoom={17}
          scrollWheelZoom
          className="drone-leaflet-map"
        >
          {layer === "satellite" ? (
            <TileLayer
              key="satellite"
              attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              key="street"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {validPosition &&
            latitude != null &&
            longitude != null && (
              <>
                <MapFollower
                  latitude={latitude}
                  longitude={longitude}
                  follow={follow}
                />

                {trail.length > 1 && (
                  <Polyline
                    positions={trail}
                    pathOptions={{
                      color: "#21a366",
                      weight: 4,
                      opacity: 0.9,
                    }}
                  />
                )}

                <Marker
                  position={[latitude, longitude]}
                  icon={droneIcon}
                >
                  <Popup>
                    <strong>WELFARE AI Drone</strong>
                    <br />
                    {t("droneLatitude")}: {formatCoordinate(latitude)}
                    <br />
                    {t("droneLongitude")}: {formatCoordinate(longitude)}
                    <br />
                    {t("droneHeading")}: {heading.toFixed(1)}°
                    <br />
                    {t("droneMapAltitude")}:{" "}
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
            <strong>{t("droneMapUnavailable")}</strong>
            <span>
              {connected
                ? t("droneWaitingGpsFix")
                : t("droneWaitingConnection")}
            </span>
            <span>{t("droneBogorReference")}</span>
          </div>
        )}

        <div className="drone-map-coordinate">
          <span className={validPosition ? "gps-live-dot" : "gps-wait-dot"} />
          <div>
            <strong>
              {validPosition
                ? t("droneGpsPositionLive")
                : t("droneGpsStandby")}
            </strong>
            <span>
              {validPosition && latitude != null && longitude != null
                ? `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
                : t("droneNoPosition")}
            </span>
          </div>
        </div>
      </div>

      <div className="drone-map-footer">
        <span>{t("droneGpsFix")}: {validPosition ? `${gpsFix}D` : "--"}</span>
        <span>{t("droneSatellites")}: {validPosition ? satellites ?? "--" : "--"}</span>
        <span>
          {t("droneMapAltitude")}: {validPosition && altitudeM != null
            ? `${altitudeM.toFixed(1)} m`
            : "--"}
        </span>
        <span>{t("droneMapHeading")}: {validPosition ? `${heading.toFixed(1)}°` : "--"}</span>
      </div>
    </div>
  );
}
