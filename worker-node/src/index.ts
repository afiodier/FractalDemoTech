import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PNG } from "pngjs";


const app = express();
app.use(express.json());
app.use(bodyParser.json());
//later
const corsOptions = {
	origin: process.env.FRONTEND_URL, // Remplacez par le port de votre frontend si nécessaire
	methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
	allowedHeaders: ['Content-Type', 'Authorization'] // En-têtes autorisés
};
app.use(cors<express.Request>());

type ComputeRequest = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  zoom: number;
  mode: "pixel" | "line" | "image";
  lineIdx: number | undefined;
  iterations: number | undefined;
};

type ComputeResponse = {
  width: number;
  height: number;
  data: number[];
};

function computeJulia(req: ComputeRequest): number[] {
  const w = req.width;
  const h = req.height;
  const lineIdx = req.lineIdx;
  const iterations = req.iterations ?? 100; 
  

  const yStart = req.mode === "line" ? (lineIdx?? 0) : 0;
  const yEnd = req.mode === "line" ? (lineIdx?? 0) + 1 : h;
  const pixels: number[] = new Array((w * (h - yStart)) * 4);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < w; x++) {
      const re = ((x / w) - 0.5) * 2 / req.zoom + req.centerX;
      const im = ((y / h) - 0.5) * 2 / req.zoom + req.centerY;
      let zRe = re, zIm = im;
      let i;
      for (i = 0; i < iterations; i++) {
        const newRe = zRe * zRe - zIm * zIm + re;
        const newIm = 2 * zRe * zIm + im;
        zRe = newRe; zIm = newIm;
        if (zRe * zRe + zIm * zIm > 4) break;
      }
      const val = 255 - Math.floor((255 * i) / iterations);
      const idx = 4 * ((y - yStart) * w + x);
      pixels[idx] = val;
      pixels[idx + 1] = val;
      pixels[idx + 2] = val;
      pixels[idx + 3] = 255;
    }
  }

  return pixels;
}

app.post("/compute", (req: Request, res: Response) => {
  const body = req.body as ComputeRequest;
  const data = computeJulia(body);


  const png = new PNG({
      width: body.width,
      height: body.mode === "line" ? 1 : body.height,
  });

    data.forEach((val, idx) => {
        png.data[idx] = val;
    });

    res.setHeader("Content-Type", "image/png");
    png.pack().pipe(res);
});

const server = app.listen(6002, () => {
  console.log("Node worker listening on :6002");
});

function gracefulShutdown() {
  console.log("Shutting down Node worker…");
  server.close(() => {
    console.log("Node worker exited cleanly");
    process.exit(0);
  });
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);