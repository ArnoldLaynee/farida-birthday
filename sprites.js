// GBA / Super Mario World Pixel Art Sprite & Tile Engine
// Renders crisp 16-bit pixel art sprites, tiles, and animated characters with zero blurry scaling

window.GBA_IMAGES = {};
const GBA_IMAGE_PATHS = {
  farida_casual: 'assets/farida_casual.png',
  farida_dentist: 'assets/farida_dentist.png',
  farida_casual_head: 'assets/farida_casual_head.png',
  farida_dentist_head: 'assets/farida_dentist_head.png',
  efe: 'assets/efe.png',
  efe_head: 'assets/efe_head.png',
  gba_bg: 'assets/gba_bg.jpg'
};

Object.entries(GBA_IMAGE_PATHS).forEach(([k, src]) => {
  const img = new Image();
  img.src = src;
  window.GBA_IMAGES[k] = img;
});

// Compile a string-grid pixel art matrix into a cached offscreen canvas
const spriteCache = {};

function getPixelSprite(key, rows, palette, scale = 3) {
  const cacheKey = `${key}_${scale}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const h = rows.length;
  const w = rows[0].length;
  const c = document.createElement('canvas');
  c.width = w * scale;
  c.height = h * scale;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;

  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch !== '.' && palette[ch]) {
        cx.fillStyle = palette[ch];
        cx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  spriteCache[cacheKey] = c;
  return c;
}

const PAL = {
  K: '#141013', // GBA Black outline
  W: '#ffffff', // Pure White
  C: '#fff6d3', // Cream highlight
  Y: '#ffd43b', // Mario Gold
  O: '#e87a1e', // Mario Orange shade
  R: '#e62e2d', // Nintendo Red
  D: '#9e1919', // Dark Red
  G: '#38b764', // Mario Hill Green
  E: '#1a7a3e', // Dark Green
  L: '#a7f070', // Light Green
  B: '#29adff', // Sky Blue
  U: '#1d57a5', // Deep Blue
  P: '#f472b6', // Pink
  M: '#9b5de5', // Purple
  S: '#ffccaa', // Skin
  T: '#8f563b', // Wood Brown
  A: '#94a3b8'  // Silver/Grey
};

const PIXEL_GRIDS = {
  // Super Mario World Question Block (16x16)
  qblock: [
    ".KKKKKKKKKKKKKK.",
    "KYYYYYYYYYYYYYYK",
    "KYKOOOOOOOOOOKYK",
    "KYOYYYYYYYYYYOYK",
    "KYOYYKKKKKKYYOYK",
    "KYOYYKWWWWKYYOYK",
    "KYOYYKKYYWKYYOYK",
    "KYOYYYYKKWKYYOYK",
    "KYOYYYYKWKKYYOYK",
    "KYOYYYYKKKKYYOYK",
    "KYOYYYYKWKYYYOYK",
    "KYOYYYYKKKYYYOYK",
    "KYOYYYYYYYYYYOYK",
    "KYKOOOOOOOOOOKYK",
    "KOOOOOOOOOOOOOOK",
    ".KKKKKKKKKKKKKK."
  ],
  // Watermelon Slice (16x16)
  watermelon: [
    ".......KKKK.....",
    ".....KKRRRRKK...",
    "....KRRRRRRRRK..",
    "...KRRKRRRRKRRK.",
    "..KRRRRRRRRRRRRK",
    ".KRRKRRRRKRRRRK.",
    ".KRRRRRRRRKRRKLK",
    "KRRKRRRRRRRRKLGK",
    "KRRRRKRRRRRKLGGK",
    "KRRRRRRRRRKLGGK.",
    ".KLLLLLLLLGGGK..",
    "..KGGGGGGGGKK...",
    "...KKKKKKKK.....",
    "................",
    "................",
    "................"
  ],
  // Sparkling Tooth (16x16)
  tooth: [
    "..KKKK....KKKK..",
    ".KWWWWKKKKWWWWK.",
    "KWWWWWWWWWWWWWWK",
    "KWWCWWWWWWWWWWWK",
    "KWCWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWK",
    ".KWWWWWWWWWWWWK.",
    ".KWWWWWWWWWWWWK.",
    "..KWWWWWWWWWWK..",
    "..KWWWWKKKKWWK..",
    "..KWWWK....KWK..",
    "..KWWK.....KWK..",
    "...KK.......KK..",
    "................",
    "................"
  ],
  // Cavity Germ / Virus Koopa (14x14)
  germ: [
    "..K........K..",
    "...K.KKKK.K...",
    "..KKMMMMMMKK..",
    ".KMMMMMMMMMMK.",
    "KMMWWMMMMWWMMK",
    "KMMWKMMMMKWMMK",
    "KMMMMMMMMMMMMK",
    "KMMKKKKKKKKMMK",
    ".KMMKWKKWKMMK.",
    ".KMMMMMMMMMMK.",
    "..KKMMMMMMKK..",
    "..K.KKKKKK.K..",
    ".K..........K.",
    ".............."
  ],
  // Shuriken (14x14)
  shuriken: [
    "......KK......",
    ".....KAAK.....",
    ".....KAAK.....",
    "....KAAAAK....",
    "...KAAKKAAK...",
    "KKKAAKWWKAAKKK",
    "KAAAAKWWKAAAAK",
    "KKKAAKWWKAAKKK",
    "...KAAKKAAK...",
    "....KAAAAK....",
    ".....KAAK.....",
    ".....KAAK.....",
    "......KK......",
    ".............."
  ],
  // Pirate Meat (16x12)
  meat: [
    "..KK........KK..",
    ".KWWK.KKKK.KWWK.",
    "KWWWWKOOOOOKWWWK",
    ".KKWWKOOOOOKWKK.",
    "...KKOOOOOOOK...",
    "...KOOOOOOOOOK..",
    "...KOOOCCOOOOK..",
    "...KOOOOOOOOOK..",
    "....KKKKKKKKK...",
    "................",
    "................",
    "................"
  ],
  // Straw Hat (16x12)
  strawhat: [
    "....KKKKKKKK....",
    "...KYYYYYYYYK...",
    "..KYYYYYYYYYYK..",
    "..KYYYYYYYYYYK..",
    "..KRRRRRRRRRRK..",
    "KKYYYYYYYYYYYYKK",
    "KYYYYYYYYYYYYYYK",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
    "................",
    "................"
  ],
  // Pixel Heart (12x11)
  heart: [
    "..KKK..KKK..",
    ".KRRRKRRRRK.",
    "KRRRRRRRRRRK",
    "KRRWRRRRRRRK",
    "KRRRRRRRRRRK",
    ".KRRRRRRRRK.",
    "..KRRRRRRK..",
    "...KRRRRK...",
    "....KRRK....",
    ".....KK.....",
    "............"
  ],
  // Bob-omb / Pirate Bomb (14x15)
  bomb: [
    "......KKRY....",
    ".....KWWRO....",
    "....KAAKK.....",
    "...KKKKKKKK...",
    "..KKKKKKKKKK..",
    ".KKWWKKKKKKKK.",
    ".KKWKKKKKKKKK.",
    "KKKKKKKKKKKKKK",
    "KKKKRKKKKRKKKK",
    "KKKKRKKKKRKKKK",
    "KKKKKKKKKKKKKK",
    ".KKKKKKKKKKKK.",
    "..KKKKKKKKKK..",
    "...KKKKKKKK...",
    ".............."
  ],
  // Mario Gold Coin (12x14)
  coin: [
    "...KKKKKK...",
    "..KYYYYYYK..",
    ".KYWWYYYYOK.",
    ".KYWYYYYYOK.",
    "KYYWKOOYYOOK",
    "KYYWKOOYYOOK",
    "KYYWKOOYYOOK",
    "KYYWKOOYYOOK",
    "KYYWKOOYYOOK",
    "KYYWKKKKYOOK",
    ".KYYYYYYYOK.",
    ".KYYYYYYYOK.",
    "..KOOOOOOK..",
    "...KKKKKK..."
  ],
  // Super Star (14x14)
  star: [
    "......KK......",
    ".....KYYK.....",
    "....KYYYYK....",
    "KKKKYYYYYYKKKK",
    "KYYYYYYYYYYYYK",
    ".KYYYKYYKYYYK.",
    "..KYYKYYKYYK..",
    "..KYYYYYYYYK..",
    ".KYYYYYYYYYYK.",
    ".KYYYYKKYYYYK.",
    "KYYKKK..KKKYYK",
    "KKK........KKK",
    "..............",
    ".............."
  ],
  // Ninja Kunai (10x16)
  kunai: [
    "....KK....",
    "...KWWK...",
    "...KWWK...",
    "..KWWAAK..",
    "..KWAAAK..",
    ".KWWAAAAK.",
    ".KAAAAAAK.",
    "..KKKKKK..",
    "....KK....",
    "...KRRK...",
    "...KRRK...",
    "...KRRK...",
    "..KKKKKK..",
    "..KYYYYK..",
    "..KYKKYK..",
    "...KKKK..."
  ],
  // Golden Legend Fish (16x12)
  fish: [
    ".....KKKKKK.....",
    "...KKYYYYYYKK...",
    "..KYYYYYYYYYYK.K",
    ".KYWKYYYYYYYYKKY",
    "KYYKKYYYYOOYYYKY",
    "KYYYYYYOOOOOYYYK",
    "KYYYYYYYYOOYYYKY",
    ".KYYYYYYYYYYYKKY",
    "..KOOOOOOOOOOK.K",
    "...KKOOOOOOKK...",
    ".....KKKKKK.....",
    "................"
  ],
  // Sparkling Diamond (14x14)
  diamond: [
    "...KKKKKKKK...",
    "..KBBBBBBBBK..",
    ".KBWWBBBBBBBK.",
    "KBBWBBBBBBBBBK",
    "KKKKKKKKKKKKKK",
    ".KBBWWBBBBBBK.",
    "..KBBWBBBBBK..",
    "...KBBBBBBK...",
    "....KBBBBK....",
    ".....KBBK.....",
    "......KK......",
    "..............",
    "..............",
    ".............."
  ],
  // Musical Note (12x14)
  note: [
    "....KKKKKKKK",
    "....KYYYYYYK",
    "....KYYYYYYK",
    "....KYKKKKKK",
    "....KYK...KK",
    "....KYK...KY",
    "....KYK...KY",
    ".KKKKYK..KKY",
    "KYYYYYK.KYYY",
    "KYWWYYK.KYWW",
    "KYYYYYK.KYYY",
    ".KKKKK...KKK",
    "............",
    "............"
  ]
};

window.GBA_RENDER = {
  // Draw authentic Super Mario World GBA background (sky, hills, clouds, checkered/grass ground)
  drawMarioStage(ctx, W, H, theme = 'overworld', time = 0) {
    ctx.imageSmoothingEnabled = false;
    const themes = {
      overworld:  { sky1: '#5c94fc', sky2: '#9cd8fc', hill: '#28a848', hillSpot: '#58d878', ground: '#e89038', grass: '#38c848' },
      sunset:     { sky1: '#f86838', sky2: '#fcd078', hill: '#187848', hillSpot: '#38a868', ground: '#c86828', grass: '#28a848' },
      night:      { sky1: '#181848', sky2: '#303888', hill: '#104838', hillSpot: '#207858', ground: '#684028', grass: '#208848' },
      underground:{ sky1: '#101830', sky2: '#182848', hill: '#203868', hillSpot: '#385898', ground: '#4868a8', grass: '#6898d8' },
      castle:     { sky1: '#281018', sky2: '#501828', hill: '#402028', hillSpot: '#683038', ground: '#787888', grass: '#a8a8b8' }
    };
    const pal = themes[theme] || themes.overworld;

    // Stepped GBA Banded Sky
    const bands = 6;
    for (let i = 0; i < bands; i++) {
      ctx.fillStyle = i < 3 ? pal.sky1 : pal.sky2;
      ctx.fillRect(0, (H / bands) * i, W, Math.ceil(H / bands));
    }

    // Stars at night
    if (theme === 'night' || theme === 'castle') {
      ctx.fillStyle = '#ffd43b';
      for (let i = 0; i < 14; i++) {
        const sx = (i * 67 + 20) % W;
        const sy = (i * 43 + 18) % (H * 0.55);
        const sz = (Math.floor(time * 4 + i) % 2 === 0) ? 4 : 2;
        ctx.fillRect(sx, sy, sz, sz);
      }
    }

    // Super Mario World Pixel Clouds with Eyes
    const cloudOffset = (time * 12) % (W + 120);
    this.drawSMWCloud(ctx, (W + 60 - cloudOffset) % (W + 100) - 40, 68);
    this.drawSMWCloud(ctx, (180 + cloudOffset * 0.6) % (W + 100) - 40, 118);

    // Super Mario World Rounded Hills with Diagonal Spots
    this.drawSMWHill(ctx, -20, H - 56, 150, 125, pal.hill, pal.hillSpot);
    this.drawSMWHill(ctx, W - 135, H - 56, 165, 155, pal.hill, pal.hillSpot);
    this.drawSMWHill(ctx, W / 2 - 65, H - 56, 130, 90, pal.hill, pal.hillSpot);

    // Ground Floor Tiles
    const groundY = H - 56;
    ctx.fillStyle = '#141013';
    ctx.fillRect(0, groundY, W, 4);
    ctx.fillStyle = pal.grass;
    ctx.fillRect(0, groundY + 4, W, 12);
    ctx.fillStyle = '#141013';
    ctx.fillRect(0, groundY + 16, W, 3);
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, groundY + 19, W, H - groundY - 19);

    // Brick/Tile lines on ground
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (let x = 0; x < W; x += 24) {
      ctx.fillRect(x, groundY + 19, 3, H - groundY);
      ctx.fillRect(x + 12, groundY + 36, 12, 3);
    }
  },

  drawSMWCloud(ctx, x, y) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    ctx.fillStyle = '#141013';
    ctx.fillRect(px - 2, py + 6, 68, 22);
    ctx.fillRect(px + 10, py - 4, 44, 34);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 1, py + 8, 62, 17);
    ctx.fillRect(px + 13, py - 1, 38, 28);
    // Cute SMW vertical pixel eyes
    ctx.fillStyle = '#141013';
    ctx.fillRect(px + 25, py + 7, 3, 7);
    ctx.fillRect(px + 35, py + 7, 3, 7);
  },

  drawSMWHill(ctx, x, groundY, w, h, fill, spot) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, groundY - h, w, h + 20, [w / 2, w / 2, 0, 0]);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#141013';
    ctx.stroke();
    ctx.clip();
    ctx.fillStyle = spot;
    for (let sy = groundY - h + 24; sy < groundY - 10; sy += 32) {
      for (let sx = x + 18; sx < x + w - 18; sx += 36) {
        ctx.fillRect(sx, sy, 14, 22);
      }
    }
    ctx.restore();
  },

  drawPipe(ctx, x, y, w, h) {
    const px = Math.floor(x), py = Math.floor(y), pw = Math.floor(w), ph = Math.floor(h);
    if (ph <= 0) return;
    ctx.fillStyle = '#141013';
    ctx.fillRect(px - 4, py, pw + 8, Math.min(26, ph));
    if (ph > 24) ctx.fillRect(px, py + 24, pw, ph - 24);
    // Lip
    ctx.fillStyle = '#38c848';
    ctx.fillRect(px - 1, py + 3, pw + 2, Math.min(20, Math.max(0, ph - 3)));
    ctx.fillStyle = '#a7f070';
    ctx.fillRect(px + 6, py + 3, 10, Math.min(20, Math.max(0, ph - 3)));
    ctx.fillStyle = '#1a7a3e';
    ctx.fillRect(px + pw - 12, py + 3, 10, Math.min(20, Math.max(0, ph - 3)));
    // Body
    if (ph > 26) {
      ctx.fillStyle = '#38c848';
      ctx.fillRect(px + 3, py + 26, pw - 6, ph - 26);
      ctx.fillStyle = '#a7f070';
      ctx.fillRect(px + 9, py + 26, 10, ph - 26);
      ctx.fillStyle = '#1a7a3e';
      ctx.fillRect(px + pw - 14, py + 26, 10, ph - 26);
    }
  },

  drawBomb(ctx, x, y, scale = 3, time = 0) {
    this.drawSprite(ctx, 'bomb', x, y, scale);
    const sx = Math.floor(x + scale * 2.5);
    const sy = Math.floor(y - scale * 6.5);
    ctx.fillStyle = (Math.floor(time * 16) % 2 === 0) ? '#ffd43b' : '#e62e2d';
    ctx.fillRect(sx - 4, sy - 4, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 2, sy - 2, 4, 4);
  },

  drawCar(ctx, x, y, dir = 1, color = '#e62e2d') {
    const px = Math.floor(x), py = Math.floor(y);
    ctx.save();
    ctx.translate(px, py);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-22, 10, 44, 6);
    ctx.fillStyle = '#141013';
    ctx.fillRect(-22, -6, 44, 16);
    ctx.fillRect(-14, -15, 26, 11);
    ctx.fillStyle = color;
    ctx.fillRect(-19, -3, 38, 11);
    ctx.fillRect(-11, -12, 20, 9);
    ctx.fillStyle = '#9cd8fc';
    ctx.fillRect(0, -11, 8, 7);
    ctx.fillRect(-9, -11, 6, 7);
    ctx.fillStyle = '#ffd43b';
    ctx.fillRect(16, -2, 4, 5);
    ctx.fillStyle = '#141013';
    ctx.fillRect(-15, 6, 10, 8);
    ctx.fillRect(6, 6, 10, 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-12, 8, 4, 4);
    ctx.fillRect(9, 8, 4, 4);
    ctx.restore();
  },

  drawBalloon(ctx, x, y, isBad = false, time = 0) {
    const px = Math.floor(x), py = Math.floor(y);
    ctx.strokeStyle = '#141013';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py + 24);
    ctx.lineTo(px + Math.sin(time * 6 + px) * 5, py + 38);
    ctx.stroke();
    ctx.fillStyle = '#141013';
    ctx.beginPath();
    ctx.ellipse(px, py, 22, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isBad ? '#1e293b' : '#f472b6';
    ctx.beginPath();
    ctx.ellipse(px, py, 19, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isBad ? '#e62e2d' : '#ffffff';
    ctx.fillRect(px - 10, py - 12, 6, 10);
    if (isBad) {
      ctx.fillStyle = '#e62e2d';
      ctx.font = '900 14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('X', px + 2, py + 2);
    }
  },

  drawCoffeeCup(ctx, x, y, danger = false, time = 0) {
    const px = Math.floor(x), py = Math.floor(y);
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    const s1 = (time * 24) % 18;
    const s2 = ((time * 24) + 9) % 18;
    ctx.fillRect(px - 8 + Math.sin(time * 5) * 4, py - 12 - s1, 5, 5);
    ctx.fillRect(px + 6 - Math.sin(time * 5) * 4, py - 12 - s2, 5, 5);
    ctx.fillStyle = '#141013';
    ctx.fillRect(px + 18, py + 10, 12, 24);
    ctx.fillStyle = '#fff6d3';
    ctx.fillRect(px + 18, py + 13, 8, 18);
    ctx.fillStyle = '#141013';
    ctx.fillRect(px + 20, py + 16, 4, 12);
    window.drawPixelBoxGBA(ctx, px - 22, py, 44, 48, danger ? '#e62e2d' : '#29adff', '#141013', danger ? '#9e1919' : '#1d57a5');
    ctx.fillStyle = '#8f563b';
    ctx.fillRect(px - 18, py + 4, 34, 8);
    ctx.fillStyle = '#fff6d3';
    ctx.fillRect(px - 12, py + 6, 12, 3);
    this.drawSprite(ctx, 'heart', px - 1, py + 28, 2);
  },

  drawSprite(ctx, key, x, y, scale = 3, rot = 0) {
    const rows = PIXEL_GRIDS[key];
    if (!rows) return;
    const canvasSprite = getPixelSprite(key, rows, PAL, scale);
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (rot) ctx.rotate(rot);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvasSprite, -canvasSprite.width / 2, -canvasSprite.height / 2);
    ctx.restore();
  },

  drawCharacter(ctx, key, x, y, width, height, flipX = false, rot = 0) {
    const img = window.GBA_IMAGES[key];
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(-Math.floor(width * 0.36), Math.floor(height * 0.44), Math.floor(width * 0.72), 6);
    if (rot) ctx.rotate(rot);
    if (flipX) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  },

  drawGBABanner(ctx, W, text) {
    ctx.save();
    ctx.fillStyle = '#141013';
    ctx.fillRect(10, 6, W - 20, 32);
    ctx.fillStyle = '#fff6d3';
    ctx.fillRect(13, 9, W - 26, 26);
    ctx.fillStyle = '#e87a1e';
    ctx.fillRect(13, 9, W - 26, 3);
    ctx.fillStyle = '#141013';
    const fontSize = text.length > 28 ? 9.5 : text.length > 23 ? 10.5 : 12;
    ctx.font = `900 ${fontSize}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, 23);
    ctx.restore();
  }
};
