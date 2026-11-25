package main

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/bluenviron/gomavlib/v3"
	"github.com/bluenviron/gomavlib/v3/pkg/dialects/ardupilotmega"
	"github.com/bluenviron/gomavlib/v3/pkg/dialects/minimal"
	"github.com/gorilla/websocket"
)

type FlightData struct {
	Armed        *bool  `json:"armed"`
	FlightMode   string `json:"flight_mode,omitempty"`
	SystemStatus *uint8 `json:"system_status,omitempty"`
	VehicleType  *uint8 `json:"vehicle_type,omitempty"`
}

type PositionData struct {
	Latitude      *float64 `json:"latitude"`
	Longitude     *float64 `json:"longitude"`
	AltitudeM     *float64 `json:"altitude_m"`
	RelativeAltM  *float64 `json:"relative_altitude_m"`
	VerticalSpeed *float64 `json:"vertical_speed_mps"`
}

type MotionData struct {
	GroundSpeedMPS *float64 `json:"ground_speed_mps"`
	AirspeedMPS    *float64 `json:"airspeed_mps"`
	HeadingDeg     *float64 `json:"heading_deg"`
	ClimbMPS       *float64 `json:"climb_mps"`
}

type AttitudeData struct {
	RollDeg  *float64 `json:"roll_deg"`
	PitchDeg *float64 `json:"pitch_deg"`
	YawDeg   *float64 `json:"yaw_deg"`
}

type GPSData struct {
	FixType          *uint8   `json:"fix_type"`
	Satellites       *uint8   `json:"satellites_visible"`
	GroundSpeedMPS   *float64 `json:"ground_speed_mps"`
	CourseOverGround *float64 `json:"course_over_ground_deg"`
}

type DroneStatus struct {
	Connected      bool         `json:"connected"`
	Mode           string       `json:"mode"`
	FramesReceived uint64       `json:"frames_received"`
	LastPacketAt   *time.Time   `json:"last_packet_at"`
	UDPListen      string       `json:"udp_listen"`
	Flight         FlightData   `json:"flight"`
	Position       PositionData `json:"position"`
	Motion         MotionData   `json:"motion"`
	Attitude       AttitudeData `json:"attitude"`
	GPS            GPSData      `json:"gps"`
}

type State struct {
	mu     sync.RWMutex
	data   DroneStatus
	last   time.Time
	frames uint64
}

var state = &State{
	data: DroneStatus{
		Mode: "telemetry_read_only",
	},
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")

		return origin == "http://localhost:3002" ||
			origin == "http://127.0.0.1:3002" ||
			origin == "http://localhost:3017" ||
			origin == "http://127.0.0.1:3017"
	},
}

func floatPtr(v float64) *float64 {
	if math.IsNaN(v) || math.IsInf(v, 0) {
		return nil
	}
	return &v
}
func boolPtr(v bool) *bool    { return &v }
func uint8Ptr(v uint8) *uint8 { return &v }

func radiansToDegrees(v float32) float64 {
	return float64(v) * 180 / math.Pi
}

func px4FlightMode(customMode uint32) string {
	mainMode := (customMode >> 16) & 0xFF
	subMode := (customMode >> 24) & 0xFF

	switch mainMode {
	case 1:
		return "MANUAL"
	case 2:
		return "ALTCTL"
	case 3:
		return "POSCTL"
	case 4:
		switch subMode {
		case 1:
			return "AUTO_READY"
		case 2:
			return "TAKEOFF"
		case 3:
			return "LOITER"
		case 4:
			return "MISSION"
		case 5:
			return "RTL"
		case 6:
			return "LAND"
		case 7:
			return "AUTO_RTGS"
		case 8:
			return "FOLLOW_TARGET"
		case 9:
			return "PRECLAND"
		case 10:
			return "ORBIT"
		default:
			return "AUTO"
		}
	case 5:
		return "ACRO"
	case 6:
		return "OFFBOARD"
	case 7:
		return "STABILIZED"
	case 8:
		return "RATTITUDE"
	default:
		return "UNKNOWN"
	}
}

func (s *State) recordFrame() {
	s.mu.Lock()
	s.frames++
	s.last = time.Now()
	s.mu.Unlock()
}

func (s *State) updateMessage(msg interface{}) {
	s.mu.Lock()
	defer s.mu.Unlock()

	switch m := msg.(type) {
	case *minimal.MessageHeartbeat:
		armed := uint8(m.BaseMode)&128 != 0
		s.data.Flight.Armed = boolPtr(armed)
		s.data.Flight.FlightMode = px4FlightMode(m.CustomMode)

		status := uint8(m.SystemStatus)
		vehicleType := uint8(m.Type)
		s.data.Flight.SystemStatus = uint8Ptr(status)
		s.data.Flight.VehicleType = uint8Ptr(vehicleType)

	case *ardupilotmega.MessageGlobalPositionInt:
		s.data.Position.Latitude = floatPtr(float64(m.Lat) / 1e7)
		s.data.Position.Longitude = floatPtr(float64(m.Lon) / 1e7)
		s.data.Position.AltitudeM = floatPtr(float64(m.Alt) / 1000)
		s.data.Position.RelativeAltM = floatPtr(float64(m.RelativeAlt) / 1000)
		s.data.Position.VerticalSpeed = floatPtr(-float64(m.Vz) / 100)

		if m.Hdg != 65535 {
			s.data.Motion.HeadingDeg = floatPtr(float64(m.Hdg) / 100)
		}

		horizontalSpeed := math.Hypot(float64(m.Vx), float64(m.Vy)) / 100
		s.data.Motion.GroundSpeedMPS = floatPtr(horizontalSpeed)

	case *ardupilotmega.MessageVfrHud:
		s.data.Motion.GroundSpeedMPS = floatPtr(float64(m.Groundspeed))
		s.data.Motion.AirspeedMPS = floatPtr(float64(m.Airspeed))
		s.data.Motion.HeadingDeg = floatPtr(float64(m.Heading))
		s.data.Motion.ClimbMPS = floatPtr(float64(m.Climb))

		// VFR_HUD altitude is MSL; GLOBAL_POSITION_INT remains
		// the primary source for position altitude.

	case *ardupilotmega.MessageAttitude:
		s.data.Attitude.RollDeg = floatPtr(radiansToDegrees(m.Roll))
		s.data.Attitude.PitchDeg = floatPtr(radiansToDegrees(m.Pitch))
		s.data.Attitude.YawDeg = floatPtr(radiansToDegrees(m.Yaw))

	case *ardupilotmega.MessageGpsRawInt:
		fix := uint8(m.FixType)
		s.data.GPS.FixType = uint8Ptr(fix)

		if m.SatellitesVisible != 255 {
			s.data.GPS.Satellites = uint8Ptr(m.SatellitesVisible)
		}

		if m.Vel != 65535 {
			s.data.GPS.GroundSpeedMPS = floatPtr(float64(m.Vel) / 100)
		}

		if m.Cog != 65535 {
			s.data.GPS.CourseOverGround = floatPtr(float64(m.Cog) / 100)
		}
	}
}

func (s *State) snapshot() DroneStatus {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := s.data
	result.Mode = "telemetry_read_only"
	result.FramesReceived = s.frames
	result.UDPListen = mavlinkListenAddress()

	if !s.last.IsZero() {
		last := s.last.UTC()
		result.LastPacketAt = &last
		result.Connected = time.Since(s.last) < 3*time.Second
	}

	return result
}

func allowDashboardOrigin(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")

	if origin == "http://localhost:3017" ||
		origin == "http://127.0.0.1:3017" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		return true
	}

	return origin == ""
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	if !allowDashboardOrigin(w, r) {
		http.Error(w, "origin not allowed", http.StatusForbidden)
		return
	}

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	payload, err := json.Marshal(state.snapshot())
	if err != nil {
		log.Printf("DRONE STATUS JSON ENCODING ERROR: %v", err)
		http.Error(w, "failed to encode drone status", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write(payload); err != nil {
		log.Printf("DRONE STATUS HTTP WRITE ERROR: %v", err)
	}
	_, _ = w.Write([]byte("\n"))
}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		_ = conn.SetWriteDeadline(time.Now().Add(2 * time.Second))

		if err := conn.WriteJSON(state.snapshot()); err != nil {
			return
		}
	}
}

func mavlinkListenAddress() string {
	listen := os.Getenv("MAVLINK_LISTEN_ADDR")
	if listen == "" {
		listen = "0.0.0.0:14610"
	}
	return listen
}
func startMAVLinkListener() {
	listen := mavlinkListenAddress()

	node := &gomavlib.Node{

		Dialect: ardupilotmega.Dialect, Endpoints: []gomavlib.EndpointConf{
			&gomavlib.EndpointUDPServer{Address: listen},
		},
		OutVersion:       gomavlib.V2,
		OutSystemID:      255,
		HeartbeatDisable: true,
	}

	if err := node.Initialize(); err != nil {
		log.Fatalf("MAVLink listener initialization failed: %v", err)
	}

	log.Printf("MAVLink UDP listener ready on %s (read-only)", listen)

	go func() {
		defer node.Close()

		for event := range node.Events() {
			switch ev := event.(type) {
			case *gomavlib.EventFrame:
				state.recordFrame()
				state.updateMessage(ev.Message())

			case *gomavlib.EventParseError:
				log.Printf("MAVLink parse error: %v", ev)
			}
		}
	}()
}

func main() {
	startMAVLinkListener()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok","service":"welfare-ai-drone-bridge"}`))
	})

	mux.HandleFunc("/api/v1/drone/status", statusHandler)
	mux.HandleFunc("/ws/drone", websocketHandler)

	addr := os.Getenv("HTTP_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8097"
	}

	server := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("WELFARE AI Drone Bridge API listening on %s", addr)
	log.Fatal(server.ListenAndServe())
}
