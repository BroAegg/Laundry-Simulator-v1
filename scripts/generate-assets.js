const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function createPNG(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      scanlines[pixelOffset] = r;
      scanlines[pixelOffset + 1] = g;
      scanlines[pixelOffset + 2] = b;
      scanlines[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Helpers for drawing shapes
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

const assets = [
  // 1. bg-road.png
  {
    path: 'public/assets/bg/bg-road.png',
    width: 640,
    height: 360,
    draw: (x, y, w, h) => {
      // Sky to road gradient
      if (y < h * 0.5) {
        // Sky
        const t = y / (h * 0.5);
        return [Math.floor(100 + t * 80), Math.floor(180 + t * 40), 240, 255];
      } else if (y < h * 0.65) {
        // Sidewalk
        return [160, 160, 170, 255];
      } else {
        // Road asphalt
        const roadY = (y - h * 0.65) / (h * 0.35);
        // Yellow stripe in the middle
        if (Math.abs(y - h * 0.82) < 5 && (Math.floor(x / 40) % 2 === 0)) {
          return [250, 210, 40, 255];
        }
        const shade = Math.floor(50 + roadY * 20);
        return [shade, shade, shade + 5, 255];
      }
    }
  },

  // 2. bg-store-open.png
  {
    path: 'public/assets/bg/bg-store-open.png',
    width: 640,
    height: 360,
    draw: (x, y, w, h) => {
      // Outer brick wall / frame with open window to road
      const isWall = x < 40 || x > w - 40 || y < 40 || y > h - 40;
      if (isWall) {
        return [120, 60, 40, 255]; // Warm brick
      }
      // Floor
      if (y > h * 0.7) {
        const tile = (Math.floor(x / 30) + Math.floor(y / 30)) % 2 === 0;
        return tile ? [220, 220, 230, 255] : [200, 200, 210, 255];
      }
      // Transparent middle so road shows through
      return [0, 0, 0, 0];
    }
  },

  // 3. bg-store-closed.png
  {
    path: 'public/assets/bg/bg-store-closed.png',
    width: 640,
    height: 360,
    draw: (x, y, w, h) => {
      const isWall = x < 40 || x > w - 40 || y < 40;
      if (isWall) {
        return [120, 60, 40, 255];
      }
      // Metal rolling door shutter
      const slat = Math.floor(y / 15) % 2;
      return slat ? [140, 145, 150, 255] : [110, 115, 120, 255];
    }
  },

  // 4. rolling-door-roll.png
  {
    path: 'public/assets/props/rolling-door-roll.png',
    width: 320,
    height: 60,
    draw: (x, y, w, h) => {
      // Cylinder metallic box
      const t = y / h;
      const val = Math.floor(80 + Math.sin(t * Math.PI) * 90);
      return [val, val, val + 5, 255];
    }
  },

  // 5. scale-digital.png
  {
    path: 'public/assets/props/scale-digital.png',
    width: 128,
    height: 96,
    draw: (x, y, w, h) => {
      // Scale base plate
      if (y > h * 0.7) return [180, 185, 190, 255];
      // Display box
      if (x > w * 0.2 && x < w * 0.8 && y > h * 0.35 && y < h * 0.65) {
        // Green LED screen in center
        if (x > w * 0.3 && x < w * 0.7 && y > h * 0.42 && y < h * 0.58) {
          return [20, 40, 30, 255]; // dark screen
        }
        return [80, 85, 90, 255]; // bezel
      }
      // Stainless pan
      if (y > h * 0.15 && y < h * 0.35 && x > w * 0.15 && x < w * 0.85) {
        return [220, 225, 230, 255];
      }
      return [0, 0, 0, 0];
    }
  },

  // 6. cash-drawer.png
  {
    path: 'public/assets/props/cash-drawer.png',
    width: 160,
    height: 80,
    draw: (x, y, w, h) => {
      if (x < 6 || x > w - 6 || y < 6 || y > h - 6) return [50, 50, 55, 255];
      // Compartments with bills
      if (x < w * 0.45 && y > 15 && y < h - 15) return [40, 120, 60, 255]; // Green bills
      if (x > w * 0.55 && y > 15 && y < h - 15) return [180, 80, 40, 255]; // Red/Orange bills
      return [70, 70, 75, 255];
    }
  },

  // 7. shelf.png
  {
    path: 'public/assets/props/shelf.png',
    width: 120,
    height: 240,
    draw: (x, y, w, h) => {
      // Wooden shelf frame
      const isSide = x < 12 || x > w - 12;
      const isTier = (y % 60) < 10;
      if (isSide || isTier) return [130, 75, 40, 255];
      return [0, 0, 0, 0]; // see through
    }
  },

  // 8. logbook.png
  {
    path: 'public/assets/props/logbook.png',
    width: 96,
    height: 72,
    draw: (x, y, w, h) => {
      if (x > 10 && x < w - 10 && y > 10 && y < h - 10) {
        // Ruled paper lines
        if ((y % 8) === 0) return [180, 200, 220, 255];
        return [250, 245, 235, 255];
      }
      return [0, 0, 0, 0];
    }
  },

  // 9. items-washing.png
  {
    path: 'public/assets/props/items-washing.png',
    width: 80,
    height: 80,
    draw: (x, y, w, h) => {
      // Detergent bottle shape
      if (x > 25 && x < 55 && y > 20 && y < 70) {
        if (y < 30) return [255, 220, 0, 255]; // Yellow cap
        return [30, 140, 220, 255]; // Blue bottle
      }
      return [0, 0, 0, 0];
    }
  },

  // 10. btn-action.png
  {
    path: 'public/assets/ui/btn-action.png',
    width: 120,
    height: 40,
    draw: (x, y, w, h) => {
      if (x < 3 || x > w - 3 || y < 3 || y > h - 3) return [30, 30, 35, 255];
      return [40, 160, 90, 255];
    }
  },

  // 11. receipt-template.png
  {
    path: 'public/assets/ui/receipt-template.png',
    width: 160,
    height: 240,
    draw: (x, y, w, h) => {
      if (x > 8 && x < w - 8 && y > 8 && y < h - 8) {
        // Jagged edges at top and bottom
        if (y < 14 && (Math.floor(x / 6) % 2 === 0)) return [0, 0, 0, 0];
        if (y > h - 14 && (Math.floor(x / 6) % 2 === 0)) return [0, 0, 0, 0];
        return [252, 250, 242, 255];
      }
      return [0, 0, 0, 0];
    }
  },

  // 12. icon-coin.png
  {
    path: 'public/assets/ui/icon-coin.png',
    width: 64,
    height: 64,
    draw: (x, y, w, h) => {
      const d = dist(x, y, 32, 32);
      if (d < 28) {
        if (d > 24) return [200, 150, 20, 255];
        return [255, 215, 0, 255]; // Gold
      }
      return [0, 0, 0, 0];
    }
  },

  // 13. bubble-chat.png
  {
    path: 'public/assets/ui/bubble-chat.png',
    width: 160,
    height: 90,
    draw: (x, y, w, h) => {
      if (x > 6 && x < w - 6 && y > 6 && y < h - 18) {
        return [255, 255, 255, 255];
      }
      // Tail pointing down
      if (y >= h - 18 && x > 30 && x < 50 && (x - 30) < (h - y)) {
        return [255, 255, 255, 255];
      }
      return [0, 0, 0, 0];
    }
  },

  // 14. sprite-pekerja-full.png
  {
    path: 'public/assets/characters/sprite-pekerja-full.png',
    width: 120,
    height: 200,
    draw: (x, y, w, h) => {
      // Head
      if (dist(x, y, 60, 40) < 26) {
        if (y < 34) return [30, 30, 35, 255]; // Hair
        return [250, 215, 175, 255]; // Skin
      }
      // Shirt & blue lanyard
      if (x > 30 && x < 90 && y >= 64 && y < 140) {
        // Blue lanyard
        if (Math.abs(x - 60) < 6) return [25, 90, 220, 255];
        return [240, 240, 245, 255]; // White polo
      }
      // Pants
      if (x > 35 && x < 85 && y >= 140 && y < 190) {
        return [30, 40, 60, 255];
      }
      return [0, 0, 0, 0];
    }
  },

  // 15. sprite-anak-kos-full.png
  {
    path: 'public/assets/characters/sprite-anak-kos-full.png',
    width: 120,
    height: 200,
    draw: (x, y, w, h) => {
      // Head & cap
      if (dist(x, y, 60, 40) < 26) {
        if (y < 35) return [220, 40, 40, 255]; // Red cap
        return [250, 215, 175, 255];
      }
      // Hoodie
      if (x > 30 && x < 90 && y >= 64 && y < 135) {
        return [35, 150, 95, 255]; // Green hoodie
      }
      // Blue jeans
      if (x > 35 && x < 85 && y >= 135 && y < 190) {
        return [25, 60, 140, 255];
      }
      return [0, 0, 0, 0];
    }
  },

  // 16. sprite-ibu-ibu-full.png
  {
    path: 'public/assets/characters/sprite-ibu-ibu-full.png',
    width: 120,
    height: 200,
    draw: (x, y, w, h) => {
      // Head with hair rollers
      if (dist(x, y, 60, 40) < 26) {
        if (y < 32) return [235, 80, 140, 255]; // Pink hair roller
        return [250, 215, 175, 255];
      }
      // Daster batik
      if (x > 25 && x < 95 && y >= 64 && y < 165) {
        const dot = (Math.floor(x / 12) + Math.floor(y / 12)) % 2 === 0;
        return dot ? [130, 40, 160, 255] : [160, 60, 190, 255];
      }
      // Sandal jepit
      if (y >= 165 && y < 190 && x > 35 && x < 85) {
        return [20, 180, 160, 255];
      }
      return [0, 0, 0, 0];
    }
  }
];

// Ensure directories and generate PNG files
assets.forEach((asset) => {
  const fullPath = path.resolve(__dirname, '..', asset.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const pngBuffer = createPNG(asset.width, asset.height, asset.draw);
  fs.writeFileSync(fullPath, pngBuffer);
  console.log(`Generated: ${asset.path} (${pngBuffer.length} bytes)`);
});

console.log('All 16 assets generated successfully!');
