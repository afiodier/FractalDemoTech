import express from "express";
import { Request, Response } from "express";

const app = express();
app.use(express.json());

app.post("/compute", (req: Request, res: Response) => {
  const { width, height } = req.body;
  const pixels: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gray = (x + y) % 256;
      pixels.push(gray, gray, gray, 255);
    }
  }
  res.json({ width, height, data: pixels });
});

app.listen(6003, () => {
  console.log("Node worker listening on :6003");
});