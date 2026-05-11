/**
 * Ensures manifest icons are EXACTLY 192×192 and 512×512 PNGs.
 * Chrome will not offer install if declared sizes do not match real pixels.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const logoPath = path.join(publicDir, "logo.png");

async function main() {
  const sharp = (await import("sharp")).default;

  const brand = { r: 15, g: 107, b: 54, alpha: 1 };

  async function writeIcon(size, filename) {
    const out = path.join(publicDir, filename);
    if (fs.existsSync(logoPath)) {
      await sharp(logoPath)
        .resize(size, size, { fit: "contain", background: brand })
        .png()
        .toFile(out);
    } else {
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: brand,
        },
      })
        .png()
        .toFile(out);
    }
    console.log(`Wrote ${filename} (${size}×${size})`);
  }

  await writeIcon(192, "pwa-192x192.png");
  await writeIcon(512, "pwa-512x512.png");
  await writeIcon(180, "apple-touch-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
