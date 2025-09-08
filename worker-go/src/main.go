package main

import (
	"encoding/json"
	"image/color"
	"log"
	"math"
	"net/http"
)

// same request/response shape as the API
type FractalRequest struct {
	Method   string  `json:"method"`
	Width    int     `json:"width"`
	Height   int     `json:"height"`
	CenterX  float64 `json:"centerX"`
	CenterY  float64 `json:"centerY"`
	Zoom     float64 `json:"zoom"`
}

type FractalResponse struct {
	Width  int   `json:"width"`
	Height int   `json:"height"`
	Data   []int `json:"data"` // RGBA flat array
}

func main() {
	http.HandleFunc("/compute", computeHandler)
	log.Println("Go worker listening on :6001")
	log.Fatal(http.ListenAndServe(":6001", nil))
}

func computeHandler(w http.ResponseWriter, r *http.Request) {
	var req FractalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// --- dummy Mandelbrot rendering (just a gradient) ------------------------------------
	pixels := make([]int, req.Width*req.Height*4)
	for y := 0; y < req.Height; y++ {
		for x := 0; x < req.Width; x++ {
			px := (x + req.CenterX*req.Zoom) / float64(req.Zoom)
			py := (y + req.CenterY*req.Zoom) / float64(req.Zoom)
			// simple escape‑time demo
			z := complex(px, py)
			var c complex128
			iter := 0
			for iter < 256 && cmplx.Abs(z) < 2 {
				c = z
				z = z*z + c
				iter++
			}
			gray := uint8(255 * iter / 256)
			idx := 4 * (y*req.Width + x)
			pixels[idx] = int(gray)   // R
			pixels[idx+1] = int(gray) // G
			pixels[idx+2] = int(gray) // B
			pixels[idx+3] = 255       // A
		}
	}

	resp := FractalResponse{
		Width:  req.Width,
		Height: req.Height,
		Data:   pixels,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}