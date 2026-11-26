package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Animal struct {
	ID          string `json:"id"`
	Species     string `json:"species"`
	Sex         string `json:"sex"`
	Breed       string `json:"breed"`
	Status      string `json:"status"`
	DateOfBirth string `json:"date_of_birth,omitempty"`
	SiteName    string `json:"site_name,omitempty"`
}

// writeJSONError mengirim response error sebagai JSON valid (bukan text/plain
// seperti http.Error). Content-Type di-set eksplisit.
func writeJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func animalsHandler(w http.ResponseWriter, r *http.Request) {
	// --- CORS ---
	origin := r.Header.Get("Origin")
	if origin != "" && allowedOrigins[origin] {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
	}
	// Origin kosong (curl/server-to-server) → tidak butuh header CORS.

	// --- Preflight ---
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	// --- DSN dari env (JANGAN hardcode password) ---
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Printf("animals: DATABASE_URL not set")
		writeJSONError(w, http.StatusInternalServerError, "DATABASE_URL not configured")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Printf("animals: db connect failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "db connect failed")
		return
	}
	defer pool.Close()

	rows, err := pool.Query(ctx, `
		SELECT a.id, a.species, COALESCE(a.sex,''), COALESCE(a.breed,''),
		       a.status, COALESCE(a.date_of_birth::text,''), COALESCE(s.name,'')
		FROM animal.animals a
		LEFT JOIN farm.sites s ON s.id = a.site_id
		ORDER BY a.created_at DESC`)
	if err != nil {
		log.Printf("animals: query failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	animals := make([]Animal, 0, 16)
	for rows.Next() {
		var a Animal
		if err := rows.Scan(
			&a.ID, &a.Species, &a.Sex, &a.Breed,
			&a.Status, &a.DateOfBirth, &a.SiteName,
		); err != nil {
			log.Printf("animals: scan failed: %v", err)
			continue
		}
		animals = append(animals, a)
	}
	if err := rows.Err(); err != nil {
		log.Printf("animals: rows iteration failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "rows iteration failed")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]any{
		"count":   len(animals),
		"animals": animals,
	}); err != nil {
		log.Printf("animals: encode failed: %v", err)
	}
}