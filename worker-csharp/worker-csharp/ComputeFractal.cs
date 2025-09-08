namespace worker_csharp
{
    public class ComputeFractal
    {

        public static int[] ComputeJulia(FractalRequest req)
        {
            const int iterations = 100;
            var pixels = new int[req.Width * req.Height * 4];

            for (int y = 0; y < req.Height; y++)
            {
                for (int x = 0; x < req.Width; x++)
                {
                    var re = (x / (double)req.Width - 0.5) * 2 / req.Zoom + req.CenterX;
                    var im = (y / (double)req.Height - 0.5) * 2 / req.Zoom + req.CenterY;
                    var zRe = re;
                    var zIm = im;

                    int i;
                    for (i = 0; i < iterations; i++)
                    {
                        var newRe = zRe * zRe - zIm * zIm + re;
                        var newIm = 2 * zRe * zIm + im;
                        zRe = newRe; zIm = newIm;
                        if (zRe * zRe + zIm * zIm > 4) break;
                    }

                    var val = 255 - (255 * i) / iterations;
                    var idx = 4 * (y * req.Width + x);
                    pixels[idx] = val;     // R
                    pixels[idx + 1] = val; // G
                    pixels[idx + 2] = val; // B
                    pixels[idx + 3] = 255; // A
                }
            }
            return pixels;
        }
    }
}
