package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

type FractalResponse struct {
	Width  int   `json:"width"`
	Height int   `json:"height"`
	Data   []int `json:"data"` // RGBA flat array
}

func main() {
	http.HandleFunc("/fractal", fractalHandler)
	log.Println("Go API listening on :5001")
	log.Fatal(http.ListenAndServe(":5001", nil))
}

func fractalHandler(w http.ResponseWriter, r *http.Request) {
	method := r.URL.Query().Get("method")
	width, _ := strconv.Atoi(r.URL.Query().Get("width"))
	height, _ := strconv.Atoi(r.URL.Query().Get("height"))
	centerX, _ := strconv.ParseFloat(r.URL.Query().Get("centerX"), 64)
	centerY, _ := strconv.ParseFloat(r.URL.Query().Get("centerY"), 64)
	zoom, _ := strconv.ParseFloat(r.URL.Query().Get("zoom"), 64)

	// Dispatch to Go worker
	img, err := GoWorkerDispatch(method, width, height, centerX, centerY, zoom)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := FractalResponse{Width: width, Height: height, Data: img}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}