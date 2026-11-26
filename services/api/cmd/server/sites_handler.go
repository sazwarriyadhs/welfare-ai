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

type FarmSite struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	SiteType string `json:"site_type"`
	Status   string `json:"status"`
	Timezone string `json:"timezone"`
}

func sitesHandler(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if origin != "" && allowedOrigins[origin] {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
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
		log.Printf("sites: DATABASE_URL not set")
		writeJSONError(w, http.StatusInternalServerError, "DATABASE_URL not configured")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Printf("sites: db connect failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "db connect failed")
		return
	}
	defer pool.Close()

	rows, err := pool.Query(ctx, `
        SELECT id, name, site_type, status, timezone
        FROM farm.sites
        ORDER BY name
    `)
	if err != nil {
		log.Printf("sites: query failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "query failed")
		return
	}
	defer rows.Close()

	sites := make([]FarmSite, 0, 8)
	for rows.Next() {
		var site FarmSite
		if err := rows.Scan(
			&site.ID,
			&site.Name,
			&site.SiteType,
			&site.Status,
			&site.Timezone,
		); err != nil {
			log.Printf("sites: scan failed: %v", err)
			writeJSONError(w, http.StatusInternalServerError, "rows scan failed")
			return
		}
		sites = append(sites, site)
	}

	if err := rows.Err(); err != nil {
		log.Printf("sites: rows iteration failed: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "rows iteration failed")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]any{
		"count": len(sites),
		"sites": sites,
	}); err != nil {
		log.Printf("sites: encode failed: %v", err)
	}
}
