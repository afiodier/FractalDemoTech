package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// same request/response shape as the API
type ComputeRequest struct {
	Width   int     `json:"width"`
	Height  int     `json:"height"`
	CenterX float64 `json:"centerX"`
	CenterY float64 `json:"centerY"`
	Zoom    float64 `json:"zoom"`
	Mode    string  `json:"mode"` // "pixel" | "line" | "image"
	LineIdx *int
}

type ComputeResponse struct {
	Width  int   `json:"width"`
	Height int   `json:"height"`
	Data   []int `json:"data"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/compute", computeHandler)

	srv := &http.Server{
		Addr:    ":6001",
		Handler: mux,
	}

	// ---------- 1. Launch server in a goroutine ----------
	go func() {
		log.Println("Go worker listening on :6001")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe: %v", err)
		}
	}()

	// ---------- 2. Wait for termination signal ----------
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down Go worker...")

	// ---------- 3. Graceful shutdown ----------
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Go worker exited cleanly")
}

func computeJulia(req ComputeRequest) []int {
	w, h := req.Width, req.Height
	lineIdx := req.LineIdx
	iterations := 100
	pixels := make([]int, w*4)

	y := 0
	if lineIdx != nil {
		y = *lineIdx
		h = y + 1
	}

	pixels = make([]int, w*h*4)
	for ; y < h; y++ {
		for x := 0; x < w; x++ {
			re := (float64(x)/float64(w)-0.5)*2/req.Zoom + req.CenterX
			im := (float64(y)/float64(h)-0.5)*2/req.Zoom + req.CenterY
			zRe, zIm := re, im

			var i int
			for i = 0; i < iterations; i++ {
				newRe := zRe*zRe - zIm*zIm + re
				newIm := 2*zRe*zIm + im
				zRe, zIm = newRe, newIm
				if zRe*zRe+zIm*zIm > 4 {
					break
				}
			}

			val := 255 - (255*i)/iterations
			idx := (y*w + x) * 4
			pixels[idx] = val
			pixels[idx+1] = val
			pixels[idx+2] = val
			pixels[idx+3] = 255
		}
	}
	return pixels
}

func computeHandler(w http.ResponseWriter, r *http.Request) {
	var req ComputeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	// ---- 3.3 : calcul (toute l’image ou une seule ligne) ----
	data := computeJulia(req)

	// ---- 3.4 : construire la réponse JSON ----
	var height int
	if req.LineIdx != nil {
		height = 1
	} else {
		height = req.Height
	}

	out := ComputeResponse{
		Width:  req.Width,
		Height: height,
		Data:   data,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}
