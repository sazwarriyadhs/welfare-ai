"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Plane, Radio, MapPinned, Play, Pause, RotateCcw,
  Navigation, Camera, Thermometer, Gauge, Battery,
  ShieldCheck, Route, Crosshair, Wifi,
  WifiOff, Compass, Activity, Satellite
} from "lucide-react";

type DroneStatus = {
  connected: boolean;
  mode: string;
  frames_received: number;
  last_packet_at: string | null;
  udp_listen: string;
  flight?: {
    armed: boolean | null;
    flight_mode: string | null;
    system_status: number | null;
    vehicle_type: number | null;
  };
  position?: {
    latitude: number | null;
    longitude: number | null;
    altitude_m: number | null;
    relative_altitude_m: number | null;
    vertical_speed_mps: number | null;
  };
  motion?: {
    ground_speed_mps: number | null;
    airspeed_mps: number | null;
    heading_deg: number | null;
    climb_mps: number | null;
  };
  attitude?: {
    roll_deg: number | null;
    pitch_deg: number | null;
    yaw_deg: number | null;
  };
  gps?: {
    fix_type: number | null;
    satellites_visible: number | null;
    ground_speed_mps: number | null;
    course_over_ground_deg: number | null;
  };
};

function getDroneWebSocketUrl() {
  const configured = process.env.NEXT_PUBLIC_DRONE_WS_URL?.trim();

  if (configured) return configured;

  if (typeof window === "undefined") {
    return "ws://127.0.0.1:8097/ws/drone";
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  return `${protocol}//${window.location.hostname}:8097/ws/drone`;
}
const DroneScene = dynamic(
  () => import("@/components/drone/DroneScene"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: 430,
        display: "grid",
        placeItems: "center",
        background: "#e8eee9",
        color: "#52695b",
        fontSize: 12
      }}>
        Initializing 3D Drone Viewer...
      </div>
    )
  }
);

const DroneMap = dynamic(
  () => import("@/components/maps/DroneMap"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: 390,
        display: "grid",
        placeItems: "center",
        background: "#e8eee9",
        color: "#52695b",
        fontSize: 12
      }}>
        Initializing Geospatial Map...
      </div>
    )
  }
);
function numberValue(value: number | null | undefined, digits = 2) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "--";
}

function coordinate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(7)
    : "--";
}

function Metric({
  label, value, unit, icon: Icon
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
}) {
  return (
    <div style={{
      padding: 12,
      border: "1px solid #e5ebe6",
      borderRadius: 9,
      minWidth: 0
    }}>
      <Icon size={16} color="#24764e" />
      <div style={{ fontSize: 10, color: "#718078", marginTop: 9 }}>
        {label}
      </div>
      <div style={{
        fontSize: 20,
        fontWeight: 750,
        marginTop: 4,
        overflowWrap: "anywhere"
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: 10, fontWeight: 400 }}>
            {" "}{unit}
          </span>
        )}
      </div>
    </div>
  );
}

function controlStyle(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 7,
    border: 0,
    borderRadius: 8,
    padding: "10px 13px",
    background: "#24764e",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    opacity: 1
  };
}

export default function DroneDashboardPage() {
  const [drone, setDrone] = useState<DroneStatus | null>(null);
  const [socketState, setSocketState] = useState("connecting");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [controlBusy, setControlBusy] = useState(false);
  const [controlMessage, setControlMessage] = useState("");

  async function runSimulationAction(action: "start" | "reset") {
    if (action === "reset") {
      const confirmed = window.confirm(
        "Restart Gazebo simulation from scratch? The current simulation state will be lost."
      );
      if (!confirmed) return;
    }

    setControlBusy(true);
    setControlMessage(action === "reset"
      ? "Restarting Gazebo simulation..."
      : "Starting Gazebo simulation...");

    try {
      const response = await fetch("/api/drone/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Simulation command failed");
      }

      setControlMessage(result.message);
    } catch (error) {
      setControlMessage(
        error instanceof Error ? error.message : "Simulation command failed"
      );
    } finally {
      setControlBusy(false);
    }
  }

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let disposed = false;

    function connect() {
      if (disposed) return;

      setSocketState("connecting");

      try {
        socket = new WebSocket(getDroneWebSocketUrl());

        socket.onopen = () => {
          if (!disposed) setSocketState("connected");
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as DroneStatus;

            if (!disposed) {
              setDrone(data);
              setLastUpdate(new Date().toISOString());
              setSocketState(data.connected ? "connected" : "waiting");
            }
          } catch (error) {
            console.error("Invalid drone telemetry payload:", error);
          }
        };

        socket.onerror = () => {
          if (!disposed) setSocketState("error");
        };

        socket.onclose = () => {
          if (disposed) return;

          setSocketState("disconnected");
          reconnectTimer = setTimeout(connect, 2000);
        };
      } catch (error) {
        console.error("Drone WebSocket connection error:", error);
        setSocketState("error");
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);

      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, []);

  const connected = drone?.connected === true;
  const position = drone?.position;
  const motion = drone?.motion;
  const gps = drone?.gps;
  const attitude = drone?.attitude;
  const flight = drone?.flight;

  const connectionLabel = connected
    ? "LIVE TELEMETRY CONNECTED"
    : socketState === "connecting"
      ? "CONNECTING TO BRIDGE"
      : "TELEMETRY DISCONNECTED";

  const fixLabel = gps?.fix_type == null
    ? "No GPS data"
    : gps.fix_type >= 3
      ? "3D GPS Fix"
      : gps.fix_type === 2
        ? "2D GPS Fix"
        : "GPS signal unavailable";

  return (
    <main className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">AERIAL INTELLIGENCE / SIMULATION LAB</div>
          <h1>Drone Flight Command</h1>
          <p>PX4 SITL simulation, live telemetry and aerial intelligence.</p>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "#fff",
          border: "1px solid #e5ebe6",
          padding: "10px 13px",
          borderRadius: 9,
          fontSize: 11
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: connected ? "#22965b" : "#d69b36",
            boxShadow: connected ? "0 0 0 4px #22965b20" : "none"
          }} />
          <span style={{ fontWeight: 700 }}>
            {connectionLabel}
          </span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 300px",
        gap: 18,
        alignItems: "start"
      }}>
        <div style={{ display: "grid", gap: 17 }}>
        <section className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "17px 20px",
            borderBottom: "1px solid #e5ebe6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap"
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 750 }}>
                Flight Simulation Workspace
              </div>
              <div style={{ fontSize: 10, color: "#718078", marginTop: 5 }}>
                PX4 Gazebo SITL · Live vehicle telemetry
              </div>
            </div>

            <span style={{
              fontSize: 10,
              color: connected ? "#24764e" : "#9a6a20",
              background: connected ? "#eaf5ed" : "#fff5df",
              borderRadius: 20,
              padding: "6px 10px",
              fontWeight: 700
            }}>
              {connected ? "TELEMETRY LIVE" : "WAITING FOR TELEMETRY"}
            </span>
          </div>

          <div style={{
            minHeight: 390,
            position: "relative",
            background: "#e8eee9",
            overflow: "hidden"
          }}>
            <DroneScene
  connected={connected}
  latitude={position?.latitude ?? null}
  longitude={position?.longitude ?? null}
  relativeAltitudeM={position?.relative_altitude_m ?? null}
  rollDeg={attitude?.roll_deg ?? null}
  pitchDeg={attitude?.pitch_deg ?? null}
  yawDeg={attitude?.yaw_deg ?? motion?.heading_deg ?? null}
/>

            <div style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "#fff",
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 11,
              boxShadow: "0 2px 8px #0001"
            }}>
              <MapPinned size={14}
                style={{ display: "inline", marginRight: 6 }} />
              Simulation workspace
            </div>

            <div style={{
              position: "absolute",
              right: 14,
              bottom: 14,
              background: "#ffffffed",
              padding: "12px 14px",
              borderRadius: 9,
              fontSize: 10,
              minWidth: 190,
              boxShadow: "0 2px 8px #0001"
            }}>
              <div style={{ fontWeight: 750, marginBottom: 7 }}>
                LIVE GPS POSITION
              </div>
              <div>LAT: {coordinate(position?.latitude)}</div>
              <div style={{ marginTop: 4 }}>
                LON: {coordinate(position?.longitude)}
              </div>
              <div style={{
                color: connected ? "#24764e" : "#9a6a20",
                marginTop: 7,
                fontWeight: 700
              }}>
                {connected ? fixLabel : "Waiting for GPS"}
              </div>
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: 9,
            flexWrap: "wrap",
            padding: 16,
            borderTop: "1px solid #e5ebe6"
          }}>
            <button
              disabled={controlBusy}
              onClick={() => runSimulationAction("start")}
              style={{ ...controlStyle(), opacity: controlBusy ? 0.6 : 1 }}
              title="Start the existing Gazebo SITL container">
              <Play size={14} /> {controlBusy ? "Please wait..." : "Start Simulation"}
            </button>
            <button disabled title="PX4 hold command is not implemented"
              style={{ ...controlStyle(), background: "#e8ece9", color: "#87938b", cursor: "not-allowed" }}>
              <Pause size={14} /> Hold
            </button>
            <button
              disabled={controlBusy}
              onClick={() => runSimulationAction("reset")}
              style={{ ...controlStyle(), background: "#a65b35", opacity: controlBusy ? 0.6 : 1 }}
              title="Restart the existing Gazebo container">
              <RotateCcw size={14} /> Reset
            </button>
            <button disabled title="MAVLink Mission Protocol is not implemented"
              style={{ ...controlStyle(), background: "#e8ece9", color: "#87938b", cursor: "not-allowed" }}>
              <Route size={14} /> Upload Mission
            </button>
            {controlMessage && (
              <div role="status" style={{
                width: "100%",
                fontSize: 11,
                color: "#52695b",
                paddingTop: 5
              }}>
                {controlMessage}
              </div>
            )}
          </div>
        </section>

        <section className="drone-map-shell">
          <DroneMap
            connected={connected}
            latitude={position?.latitude ?? null}
            longitude={position?.longitude ?? null}
            headingDeg={
              motion?.heading_deg ??
              gps?.course_over_ground_deg ??
              attitude?.yaw_deg ??
              null
            }
            altitudeM={position?.relative_altitude_m ?? null}
            gpsFix={gps?.fix_type ?? null}
            satellites={gps?.satellites_visible ?? null}
          />
        </section>
        </div>

        <div style={{ display: "grid", gap: 15 }}>
          <section className="panel">
            <h2 className="panel-title">Vehicle Connection</h2>
            <p className="panel-subtitle">
              Simulator and autopilot status
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 12,
              background: connected ? "#eaf5ed" : "#fff7e8",
              borderRadius: 9
            }}>
              {connected
                ? <Wifi size={20} color="#24764e" />
                : <WifiOff size={20} color="#a8792a" />}

              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>
                  PX4 SITL
                </div>
                <div style={{
                  fontSize: 10,
                  color: connected ? "#24764e" : "#8a713f",
                  marginTop: 4
                }}>
                  {connected ? "MAVLink telemetry active" : socketState}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: "#718078", marginTop: 14 }}>
              Transport: MAVLink → Go Bridge → WebSocket
            </div>
            <div style={{ fontSize: 11, color: "#718078", marginTop: 7 }}>
              UDP: {drone?.udp_listen ?? "0.0.0.0:14610"}
            </div>
            <div style={{ fontSize: 11, color: "#718078", marginTop: 7 }}>
              Frames received: {drone?.frames_received?.toLocaleString() ?? "--"}
            </div>
            <div style={{ fontSize: 11, color: "#718078", marginTop: 7 }}>
              Last update: {lastUpdate
                ? new Date(lastUpdate).toLocaleTimeString()
                : "--"}
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title">Flight Status</h2>
            <p className="panel-subtitle">Autopilot state</p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10
            }}>
              <Metric
                label="Flight Mode"
                value={flight?.flight_mode ?? "--"}
                unit=""
                icon={Plane}
              />
              <Metric
                label="Arming"
                value={flight?.armed == null ? "--" : flight.armed ? "ARMED" : "SAFE"}
                unit=""
                icon={ShieldCheck}
              />
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title">Live Telemetry</h2>
            <p className="panel-subtitle">
              Values received from PX4 MAVLink
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10
            }}>
              <Metric
                label="Altitude"
                value={numberValue(position?.altitude_m)}
                unit="m"
                icon={Navigation}
              />
              <Metric
                label="Relative Altitude"
                value={numberValue(position?.relative_altitude_m)}
                unit="m"
                icon={Activity}
              />
              <Metric
                label="Ground Speed"
                value={numberValue(motion?.ground_speed_mps)}
                unit="m/s"
                icon={Gauge}
              />
              <Metric
                label="Heading"
                value={numberValue(motion?.heading_deg, 1)}
                unit="°"
                icon={Compass}
              />
              <Metric
                label="GPS Satellites"
                value={gps?.satellites_visible?.toString() ?? "--"}
                unit="SV"
                icon={Satellite}
              />
              <Metric
                label="Battery"
                value="N/A"
                unit=""
                icon={Battery}
              />
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title">Attitude</h2>
            <p className="panel-subtitle">Aircraft orientation</p>

            {[
              ["Roll", attitude?.roll_deg],
              ["Pitch", attitude?.pitch_deg],
              ["Yaw", attitude?.yaw_deg]
            ].map(([label, value]) => (
              <div key={String(label)} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "9px 0",
                borderTop: "1px solid #eef1ee",
                fontSize: 11
              }}>
                <span style={{ color: "#718078" }}>{label}</span>
                <strong>
                  {numberValue(value as number | null, 3)}°
                </strong>
              </div>
            ))}
          </section>

          <section className="panel">
            <h2 className="panel-title">Simulation Sensors</h2>
            <p className="panel-subtitle">
              Current integration status
            </p>

            {[
              { name: "MAVLink Telemetry", icon: Radio, state: connected ? "Live" : "Offline", live: connected },
              { name: "GPS / Position", icon: Crosshair, state: gps?.fix_type != null ? "Live" : "Waiting", live: gps?.fix_type != null },
              { name: "RGB Camera", icon: Camera, state: "Planned", live: false },
              { name: "Thermal Sensor", icon: Thermometer, state: "Planned", live: false },
              { name: "Safety Monitoring", icon: ShieldCheck, state: "Planned", live: false }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 0",
                  borderTop: "1px solid #eef1ee",
                  fontSize: 11
                }}>
                  <Icon size={15} color={item.live ? "#24764e" : "#87938b"} />
                  {item.name}
                  <span style={{
                    marginLeft: "auto",
                    color: item.live ? "#24764e" : "#9a8a6b",
                    fontWeight: item.live ? 700 : 400
                  }}>
                    {item.state}
                  </span>
                </div>
              );
            })}
          </section>
        </div>
      </div>

      <div style={{
        marginTop: 17,
        padding: "12px 15px",
        background: "#edf4ef",
        borderRadius: 9,
        color: "#52695b",
        fontSize: 11,
        lineHeight: 1.7
      }}>
        <strong>Simulation safety:</strong> Simulation lifecycle controls manage the local Gazebo container. PX4 flight
        commands, mission upload and arming remain disabled until MAVLink command
        authorization, validation and failsafe protections are implemented. The map is a schematic workspace,
        not a geospatial map.
      </div>
    </main>
  );
}

