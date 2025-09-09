package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
)

// ---------------------------------------------------------------------------
// Types ---------------------------------------------------------------
// ---------------------------------------------------------------------------

// Payload reçu par le backend
type ComputeRequest struct {
	Width      int     `json:"width"`
	Height     int     `json:"height"`
	CenterX    float64 `json:"centerX"`
	CenterY    float64 `json:"centerY"`
	Zoom       float64 `json:"zoom"`
	Mode       string  `json:"mode"`   // "pixel" | "line" | "image"
	Method     string  `json:"method"` // “go”, “node”, “csharp”
	LineIdx    int     `json:"lineIdx"`
	Iterations int     `json:"iterations"`
}

// Réponse du worker (exemple simplifié)
type ComputeResponse struct {
	Width  int   `json:"width"`
	Height int   `json:"height"`
	Data   []int `json:"data"`
}

// ---------------------------------------------------------------------------
// Worker configuration -----------------------------------------------------
// ---------------------------------------------------------------------------

var workerURLs = map[string]string{
	"go":     "http://worker-go:6001/compute",
	"node":   "http://worker-node:6002/compute",
	"csharp": "http://worker-csharp:6003/compute",
}

// ---------------------------------------------------------------------------
// Dispatch function -------------------------------------------------------
// ---------------------------------------------------------------------------

func dispatchToWorker(worker string, req ComputeRequest) ([]byte, error) {
	url, ok := workerURLs[worker]
	if !ok {
		return nil, fmt.Errorf("worker %s unknown", worker)
	}
	log.Printf("Dispatched")

	log.Printf("url: %s", url)

	body, _ := json.Marshal(req)
	log.Printf("body: %s", body)
	resp, err := http.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("worker %s returned %d", worker, resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

// ---------------------------------------------------------------------------
// HTTP handler -----------------------------------------------------------
// ---------------------------------------------------------------------------

func fractalHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Go API received request")
	// Extract query parameters
	method := r.URL.Query().Get("method") // worker choice: "go", "node", "csharp"
	width, _ := strconv.Atoi(r.URL.Query().Get("width"))
	height, _ := strconv.Atoi(r.URL.Query().Get("height"))
	centerX, _ := strconv.ParseFloat(r.URL.Query().Get("centerX"), 64)
	centerY, _ := strconv.ParseFloat(r.URL.Query().Get("centerY"), 64)
	zoom, _ := strconv.ParseFloat(r.URL.Query().Get("zoom"), 64)
	mode := r.URL.Query().Get("mode") // "pixel" | "line" | "image"
	lineIdx, _ := strconv.Atoi(r.URL.Query().Get("lineIdx"))
	iterations, _ := strconv.Atoi(r.URL.Query().Get("iterations"))

	req := ComputeRequest{
		Width:      width,
		Height:     height,
		CenterX:    centerX,
		CenterY:    centerY,
		Zoom:       zoom,
		Mode:       mode,
		LineIdx:    lineIdx,
		Iterations: iterations,
	}

	if iterations < 1 {
		i := 1
		req.Iterations = i
	}

	data, err := dispatchToWorker(method, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Go API returning")

	// Return response to client
	w.Header().Set("Content-Type", "image/png")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

// corsHandler ajoute les en‑têtes CORS à chaque requête.
func corsHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Autoriser toutes les origines (ou mettez votre domaine ici)
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// Optionnel : autoriser les méthodes et headers que vous utilisez
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Répondez immédiatement aux requêtes pré‑vol (OPTIONS)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Passez la requête au handler suivant
		next.ServeHTTP(w, r)
	})
}

// ---------------------------------------------------------------------------
// main -------------------------------------------------------------------
// ---------------------------------------------------------------------------

func main() {
	http.Handle("/fractal", corsHandler(http.HandlerFunc(fractalHandler)))
	log.Println("Go API listening on :5001")
	log.Fatal(http.ListenAndServe(":5001", nil))
}
