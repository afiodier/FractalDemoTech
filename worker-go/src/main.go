package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// same request/response shape as the API
type FractalRequest struct {
	Method  string  `json:"method"`
	Width   int     `json:"width"`
	Height  int     `json:"height"`
	CenterX float64 `json:"centerX"`
	CenterY float64 `json:"centerY"`
	Zoom    float64 `json:"zoom"`
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
	log.Println("Handler received request")
	// parse request body
	var req struct {
		Width   int     `json:"width"`
		Height  int     `json:"height"`
		CenterX float64 `json:"centerX"`
		CenterY float64 `json:"centerY"`
		Zoom    float64 `json:"zoom"`
		Mode    string  `json:"mode"` // "pixel" | "line" | "image"
	}

	log.Println(r.Body)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	// compute Julia set
	const iterations = 100
	pixels := make([]byte, req.Width*req.Height*4)
	for y := 0; y < req.Height; y++ {
		for x := 0; x < req.Width; x++ {
			// map pixel to complex plane
			re := (float64(x)/float64(req.Width)-0.5)*2/req.Zoom + req.CenterX
			im := (float64(y)/float64(req.Height)-0.5)*2/req.Zoom + req.CenterY
			zRe, zIm := re, im

			var i int
			for i = 0; i < iterations; i++ {
				// z = z^2 + c
				newRe := zRe*zRe - zIm*zIm + re
				newIm := 2*zRe*zIm + im
				zRe, zIm = newRe, newIm
				if zRe*zRe+zIm*zIm > 4 {
					break
				}
			}

			// map iterations to gray value
			val := uint8(255 - (255*uint(i))/uint(iterations))
			idx := 4 * (y*req.Width + x)
			pixels[idx] = val
			pixels[idx+1] = val
			pixels[idx+2] = val
			pixels[idx+3] = 255
		}
	}

	// respond with JSON
	log.Println("returning response with pixel data of length", len(pixels))
	// Convert []byte → []int
	dataInt := make([]int, len(pixels))
	for i, b := range pixels {
		dataInt[i] = int(b)
	}

	// Send a JSON struct that matches the client's expectation
	resp := struct {
		Width  int   `json:"width"`
		Height int   `json:"height"`
		Data   []int `json:"data"`
	}{
		Width:  req.Width,
		Height: req.Height,
		Data:   dataInt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
