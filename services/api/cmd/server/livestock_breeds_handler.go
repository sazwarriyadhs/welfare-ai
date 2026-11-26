package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LivestockBreed struct {
	ID             int    `json:"id"`
	Species        string `json:"species"`
	Breed          string `json:"breed"`
	PrimaryPurpose string `json:"primary_purpose"`
}

func livestockBreedsHandler(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if origin != "" && allowedOrigins[origin] {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
	} else if origin != "" {
		writeJSONError(w, http.StatusForbidden, "origin not allowed")
		return
	}

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

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Printf("livestock breeds: DATABASE_URL not set")
		writeJSONError(w, http.StatusInternalServerError, "database not configured")
		return
	}

	species := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("species")))

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Printf("livestock breeds: db connection failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "database connection failed")
		return
	}
	defer pool.Close()

	rows, err := pool.Query(ctx, `
        SELECT id, species, breed, primary_purpose
        FROM animal.livestock_breeds
        WHERE ($1 = '' OR species = $1)
        ORDER BY species, breed
    `, species)
	if err != nil {
		log.Printf("livestock breeds: query failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "unable to retrieve livestock breeds")
		return
	}
	defer rows.Close()

	breeds := make([]LivestockBreed, 0, 24)

	for rows.Next() {
		var breed LivestockBreed

		if err := rows.Scan(
			&breed.ID,
			&breed.Species,
			&breed.Breed,
			&breed.PrimaryPurpose,
		); err != nil {
			log.Printf("livestock breeds: scan failed: %v", err)
			writeJSONError(w, http.StatusInternalServerError, "unable to read livestock breed records")
			return
		}

		breeds = append(breeds, breed)
	}

	if err := rows.Err(); err != nil {
		log.Printf("livestock breeds: row iteration failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "unable to read livestock breed records")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")

	if err := json.NewEncoder(w).Encode(map[string]any{
		"count":  len(breeds),
		"breeds": breeds,
	}); err != nil {
		log.Printf("livestock breeds: response encoding failed: %v", err)
	}
}
