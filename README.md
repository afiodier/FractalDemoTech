# Fractal Demo

A full‑stack project that renders fractals (Julia/Mandelbrot) in real time.
The UI (React/TS) sends compute requests to a lightweight API that forwards
the request to one of several worker implementations (Go, Node, C#).
The worker returns a flat RGBA pixel array, which the browser draws onto a
canvas.

## Project Layout

```
frontend/          # React + TypeScript UI
backend-go/        # Go net/http API (acts as a dispatcher)
worker-go/         # Go worker – renders the image
worker-node/       # Node + TS worker
worker-csharp/     # C# worker (optional)
```

All components communicate over HTTP on localhost:

```
frontend → backend-go → selected worker
```

### Key Files

| Path | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Main UI – manages state and triggers renders |
| `frontend/src/components/FractalCanvas.tsx` | Canvas rendering + drag handling |
| `backend-go/src/main.go` | API dispatcher |
| `worker-go/src/main.go` | Fast worker implementation (recommended) |

## How to Run

1. **Clone** the repository.  
2. **Start the workers** (pick one).  
   ```bash
   cd worker-go && go run ./src
   ```  
   (or `worker-node` / `worker-csharp`)
3. **Start the backend**.  
   ```bash
   cd backend-go && go run ./src
   ```
4. **Start the frontend**.  
   ```bash
   cd frontend && npm install && npm run dev

## TODO

- Cache parameters and use a UUID for request de‑duplication.  
- Add dynamic resolution support.  
- Implement a broker to balance load across all workers.  
- Use WebSockets to stream back the computed pixel data.  
- Highlight which pixel was computed by which worker.  
- GPU‑accelerated rendering for full‑image mode.
- Run on kubernetes 