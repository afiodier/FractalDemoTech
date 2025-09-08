import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";


const app = express();
app.use(express.json());
 app.use(bodyParser.json());
const server = app.listen(6002);
//later
const corsOptions = {
	origin: process.env.FRONTEND_URL, // Remplacez par le port de votre frontend si nécessaire
	methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
	allowedHeaders: ['Content-Type', 'Authorization'] // En-têtes autorisés
};
app.use(cors<express.Request>());

app.post("/compute", (req: Request, res: Response) => {
	const { width, height, centerX, centerY, zoom } = req.body;
	const pixels: number[] = [];
	console.log("worker node received request:", req.body);

	const iterations = 100;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			// map pixel to complex plane
			const re = (x / width - 0.5) * 2 / zoom + centerX;
			const im = (y / height - 0.5) * 2 / zoom + centerY;
			let zRe = re, zIm = im;

			let i;
			for (i = 0; i < iterations; i++) {
				const newRe = zRe * zRe - zIm * zIm + re;
				const newIm = 2 * zRe * zIm + im;
				zRe = newRe; zIm = newIm;
				if (zRe * zRe + zIm * zIm > 4) break;
			}

			const val = 255 - Math.floor(255 * i / iterations);
			pixels.push(val, val, val, 255);
		}
	}

	res.json({ width, height, data: pixels });
});



console.log("Worker node listening on port 6002");

process.on('SIGINT', () => gracefulShutdown(server));
process.on('SIGTERM', () => gracefulShutdown(server));

function gracefulShutdown(server : any) {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
});
};