// 50 Ultra-Polished GBA (Super Mario World x WarioWare) Microgames — PART 1 (Worlds 1–3: Games 1–30)
// Rich 16-bit pixel art sprites, custom stage props, particles, floating popups, and fair arcade physics!

(function () {
  const W = 360;
  const H = 480;

  function drawPixelBox(ctx, x, y, w, h, fill = '#fff6d3', border = '#141013', shadow = '#e87a1e') {
    const px = Math.floor(x), py = Math.floor(y), pw = Math.floor(w), ph = Math.floor(h);
    ctx.fillStyle = border;
    ctx.fillRect(px - 3, py - 3, pw + 6, ph + 6);
    ctx.fillStyle = shadow;
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = fill;
    ctx.fillRect(px, py, pw - 3, ph - 3);
  }

  window.drawPixelBoxGBA = drawPixelBox;

  window.MICROGAMES = [
    // =======================================================================
    // WORLD 1: SABAH KOŞTURMACASI (GAMES 1 - 10)
    // =======================================================================

    // 1. Tooth Polisher (Pixel Toothbrush + Foam Bubbles + Sparkles)
    {
      id: 1, level: 1,
      title: "DİŞİ PARLAT!",
      sub: "Mor mikroplara değmeden 5 sarı plağı fırçala!",
      duration: 5800,
      init(s) {
        s.t = 0;
        s.bx = W / 2; s.by = H - 90;
        s.plaque = [
          { x: W / 2 - 42, y: 198, hp: 55 },
          { x: W / 2 + 42, y: 198, hp: 55 },
          { x: W / 2 - 38, y: 266, hp: 55 },
          { x: W / 2 + 38, y: 266, hp: 55 },
          { x: W / 2, y: 232, hp: 55 }
        ];
        s.viruses = [
          { ang: 0, rX: 102, rY: 82, spd: 2.0 },
          { ang: Math.PI, rX: 102, rY: 82, spd: 2.0 }
        ];
      },
      onPointer(type, x, y, s, api) {
        s.bx = x; s.by = y;
        if (type === 'down' || type === 'move') {
          if (s.t > 0.5) {
            for (const v of s.viruses) {
              const vx = W / 2 + Math.cos(v.ang) * v.rX;
              const vy = 235 + Math.sin(v.ang) * v.rY;
              if (Math.hypot(x - vx, y - vy) < 22) {
                api.lose("MİKROBA DEĞDİN!");
                return;
              }
            }
          }
          s.plaque.forEach(p => {
            if (p.hp > 0 && Math.hypot(x - p.x, y - p.y) < 38) {
              p.hp -= type === 'down' ? 55 : 32;
              if (Math.random() < 0.4) api.spawnParticles(p.x, p.y, '#ffffff', 3);
              if (p.hp <= 0) {
                window.sound.playPop();
                api.spawnParticles(p.x, p.y, '#9cd8fc', 8);
                api.popup(p.x, p.y - 18, "PARLADI!", "#29adff");
              }
            }
          });
          if (s.plaque.every(p => p.hp <= 0)) api.win("TERTEMİZ DİŞ! ★");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        // Pink gums backdrop
        drawPixelBox(ctx, W / 2 - 95, 295, 190, 62, '#f472b6', '#141013', '#db2777');
        window.GBA_RENDER.drawSprite(ctx, 'tooth', W / 2, 238, 11);

        s.plaque.forEach(p => {
          if (p.hp <= 0) {
            if (Math.floor(s.t * 6 + p.x) % 2 === 0) {
              window.GBA_RENDER.drawSprite(ctx, 'star', p.x, p.y, 1);
            }
            return;
          }
          const r = 8 + (p.hp / 55) * 9;
          drawPixelBox(ctx, p.x - r, p.y - r, r * 2, r * 2, '#f59e0b', '#141013', '#b45309');
        });

        s.viruses.forEach(v => {
          v.ang += v.spd * dt;
          const vx = W / 2 + Math.cos(v.ang) * v.rX;
          const vy = 235 + Math.sin(v.ang) * v.rY;
          window.GBA_RENDER.drawSprite(ctx, 'germ', vx, vy, 3);
        });

        // Detailed Pixel Toothbrush (Bristles + Mint Paste + Blue Handle)
        const bx = Math.floor(s.bx), by = Math.floor(s.by);
        drawPixelBox(ctx, bx - 16, by - 14, 30, 12, '#ffffff', '#141013', '#cbd5e1');
        ctx.fillStyle = '#38c848';
        ctx.fillRect(bx - 12, by - 18, 18, 5);
        drawPixelBox(ctx, bx - 18, by - 4, 72, 12, '#29adff', '#141013', '#1d57a5');

        const leftCount = s.plaque.filter(p => p.hp > 0).length;
        window.GBA_RENDER.drawGBABanner(ctx, W, `PLAKLARI FIRÇALA! (KALAN: ${leftCount})`);
      }
    },

    // 2. Wisdom Tooth Extraction (Dental Pliers + Power Gauge)
    {
      id: 2, level: 1,
      title: "20'LİK DİŞİ ÇEK!",
      sub: "İbre YEŞİL bölgedeyken 2 kez dokun!",
      duration: 5800,
      init(s) {
        s.t = 0;
        s.needle = 0.15;
        s.dir = 1;
        s.hits = 0;
        s.needed = 2;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const tol = 0.25;
        if (Math.abs(s.needle - 0.5) <= tol) {
          s.hits++;
          s.dir *= -1.12;
          window.sound.playWin();
          api.spawnParticles(W / 2, 230, '#ffd43b', 14);
          api.popup(W / 2, 165, s.hits === 1 ? "ESNEDİ! (1/2)" : "ÇIKTI! (2/2)", "#38c848");
          if (s.hits >= s.needed) api.win("20'LİK DİŞ ÇEKİLDİ!");
        } else {
          api.lose("YEŞİL BÖLGEDE DOKUN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const spd = (1.08 + s.hits * 0.2) * Math.sign(s.dir);
        s.needle += spd * dt;
        if (s.needle >= 1) { s.needle = 1; s.dir = -1; }
        if (s.needle <= 0) { s.needle = 0; s.dir = 1; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);

        // Pink Gums & Socket
        drawPixelBox(ctx, 48, 282, W - 96, 86, '#f472b6', '#141013', '#db2777');
        ctx.fillStyle = '#9e1919';
        ctx.fillRect(W / 2 - 44, 282, 88, 22);

        const wiggle = s.hits > 0 ? Math.sin(s.t * 22) * 5 : 0;
        const ty = 252 - s.hits * 42;
        window.GBA_RENDER.drawSprite(ctx, 'tooth', W / 2 + wiggle, ty, 9);

        // Metallic Dental Forceps gripping the tooth from top
        drawPixelBox(ctx, W / 2 - 28 + wiggle, ty - 95, 18, 52, '#94a3b8', '#141013', '#475569');
        drawPixelBox(ctx, W / 2 + 10 + wiggle, ty - 95, 18, 52, '#94a3b8', '#141013', '#475569');
        drawPixelBox(ctx, W / 2 - 14 + wiggle, ty - 62, 28, 16, '#ffd43b', '#141013', '#e87a1e');

        // Power Gauge Bar
        const bx = 36, by = 385, bw = W - 72, bh = 30;
        drawPixelBox(ctx, bx, by, bw, bh, '#1e293b', '#141013', '#0f172a');
        const z = 0.25 * bw;
        ctx.fillStyle = '#38c848';
        ctx.fillRect(W / 2 - z, by + 3, z * 2, bh - 9);
        ctx.fillStyle = '#a7f070';
        ctx.fillRect(W / 2 - z, by + 3, z * 2, 5);
        // Needle
        drawPixelBox(ctx, bx + s.needle * bw - 6, by - 7, 12, bh + 14, '#ffd43b', '#141013', '#e87a1e');

        window.GBA_RENDER.drawGBABanner(ctx, W, `YEŞİLDE DOKUN! (${s.hits}/${s.needed})`);
      }
    },

    // 3. Metrobus Frogger (Detailed Cars/Taxis + 34 BZ Metrobus + Crosswalk)
    {
      id: 3, level: 1,
      title: "METROBÜSE KOŞ!",
      sub: "Dokunarak ilerle, araçlara çarpmadan kapıya ulaş!",
      duration: 6000,
      init(s) {
        s.t = 0; s.px = W / 2; s.py = H - 72;
        s.lanes = [
          { y: 345, spd: 102, col: '#ffd43b', cars: [40, 230] },
          { y: 290, spd: -112, col: '#e62e2d', cars: [95, 285] },
          { y: 235, spd: 118, col: '#29adff', cars: [25, 215] },
          { y: 180, spd: -125, col: '#f472b6', cars: [120, 305] }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const dx = x - s.px, dy = y - s.py;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 55 && y > 150) {
          s.px = Math.max(40, Math.min(W - 40, s.px + (dx > 0 ? 48 : -48)));
        } else {
          s.py -= 55;
        }
        window.sound.playPop();
        api.spawnParticles(s.px, s.py + 20, '#ffffff', 4);
        if (s.py <= 128) api.win("34 BZ METROBÜSE BİNDİN!");
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'sunset', s.t);

        // E-5 Highway Asphalt + Zebra Crosswalk
        drawPixelBox(ctx, 0, 145, W, 235, '#334155', '#141013', '#1e293b');
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        for (let cy = 155; cy < 370; cy += 18) ctx.fillRect(W / 2 - 22, cy, 44, 10);
        ctx.fillStyle = '#cbd5e1';
        for (const ly of [208, 263, 318]) {
          for (let lx = 15; lx < W; lx += 45) ctx.fillRect(lx, ly, 22, 3);
        }

        // Authentic Istanbul Metrobus waiting at station
        drawPixelBox(ctx, 18, 56, W - 36, 76, '#f59e0b', '#141013', '#d97706');
        // Windows
        for (const wx of [32, 82, 232, 282]) {
          drawPixelBox(ctx, wx, 68, 38, 28, '#9cd8fc', '#141013', '#29adff');
        }
        // Open green boarding door in middle
        drawPixelBox(ctx, W / 2 - 44, 68, 88, 60, '#38c848', '#141013', '#1a7a3e');
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 10px "Press Start 2P", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('KAPI AÇIK', W / 2, 98);

        for (const ln of s.lanes) {
          for (let i = 0; i < ln.cars.length; i++) {
            ln.cars[i] += ln.spd * dt;
            if (ln.cars[i] > W + 32) ln.cars[i] = -32;
            if (ln.cars[i] < -32) ln.cars[i] = W + 32;
            const cx = ln.cars[i];
            window.GBA_RENDER.drawCar(ctx, cx, ln.y, ln.spd > 0 ? 1 : -1, ln.col);
            if (Math.hypot(s.px - cx, s.py - ln.y) < 18) {
              api.lose("TRAFİĞE ÇARPTIN!");
              return;
            }
          }
        }
        window.GBA_RENDER.drawCharacter(ctx, 'farida_dentist', s.px, s.py, 46, 62);
        window.GBA_RENDER.drawGBABanner(ctx, W, "DOKUN VE KAPIYA ULAŞ!");
      }
    },

    // 4. Super Mario Question Blocks (Popping Gold Coins + Score Popups)
    {
      id: 4, level: 1,
      title: "ALTIN BLOKLAR!",
      sub: "Sarı [?] bloklarının altındayken DOKUN! Kırmızıya vurma!",
      duration: 6400,
      init(s) {
        s.t = 0; s.fx = 45; s.fy = H - 90; s.fvy = 0; s.dir = 1;
        s.coins = [];
        s.blocks = [
          { x: 75, y: 270, trap: false, hit: false, bump: 0 },
          { x: 150, y: 270, trap: false, hit: false, bump: 0 },
          { x: 225, y: 270, trap: true, hit: false, bump: 0 },
          { x: 300, y: 270, trap: false, hit: false, bump: 0 }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type === 'down' && s.fy >= H - 96) {
          s.fvy = -660;
          window.sound.playPop();
          api.spawnParticles(s.fx, H - 60, '#fff6d3', 5);
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const walkSpd = s.fy < H - 94 ? 105 : 185;
        s.fx += s.dir * walkSpd * dt;
        if (s.fx > W - 30) { s.fx = W - 30; s.dir = -1; }
        if (s.fx < 30) { s.fx = 30; s.dir = 1; }
        s.fy += s.fvy * dt;
        s.fvy += 1150 * dt;
        if (s.fy >= H - 90) { s.fy = H - 90; s.fvy = 0; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        // Animate popping coins
        s.coins.forEach(c => {
          c.y += c.vy * dt;
          c.vy += 600 * dt;
          c.life -= dt;
          window.GBA_RENDER.drawSprite(ctx, 'coin', c.x, c.y, 3);
        });
        s.coins = s.coins.filter(c => c.life > 0);

        for (const b of s.blocks) {
          if (b.bump > 0) b.bump = Math.max(0, b.bump - dt * 60);
          if (!b.hit && s.fvy < 100 && Math.abs(s.fx - b.x) < 36 && s.fy - 30 <= b.y + 26) {
            b.hit = true;
            b.bump = 12;
            s.fvy = 160;
            if (b.trap) {
              api.lose("KIRMIZI TUZAĞA VURDUN!");
              return;
            }
            window.sound.playWin();
            s.coins.push({ x: b.x, y: b.y - 24, vy: -240, life: 0.55 });
            api.spawnParticles(b.x, b.y, '#ffd43b', 12);
            api.popup(b.x, b.y - 42, "+100!", "#ffd43b");
            if (s.blocks.filter(k => !k.trap).every(k => k.hit)) {
              api.win("TÜM ALTINLAR ALINDI!");
              return;
            }
          }
          const by = b.y - b.bump;
          if (b.trap) {
            drawPixelBox(ctx, b.x - 20, by - 20, 40, 40, '#e62e2d', '#141013', '#9e1919');
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 16px "Press Start 2P", monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('X', b.x, by + 1);
          } else if (b.hit) {
            drawPixelBox(ctx, b.x - 20, by - 20, 40, 40, '#8f563b', '#141013', '#592812');
          } else {
            window.GBA_RENDER.drawSprite(ctx, 'qblock', b.x, by, 3);
          }
        }
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', s.fx, s.fy, 50, 68, s.dir < 0);
        const hitCount = s.blocks.filter(k => !k.trap && k.hit).length;
        window.GBA_RENDER.drawGBABanner(ctx, W, `SARI BLOKLARI KIR! (${hitCount}/3)`);
      }
    },

    // 5. 360° Germ Siege (Glowing Tooth Shield + Hit Popups)
    {
      id: 5, level: 1,
      title: "DİŞİ SAVUN!",
      sub: "6 mikroba dokunarak vur! Dişe değmesinler!",
      duration: 5800,
      init(s) {
        s.t = 0;
        s.germs = Array.from({ length: 6 }, (_, i) => ({
          ang: (i * Math.PI * 2) / 6,
          dist: 150 + (i % 2) * 28,
          spd: 27 + i * 2.4,
          alive: true
        }));
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' && type !== 'move') return;
        const cx = W / 2, cy = 255;
        s.germs.forEach(g => {
          if (!g.alive) return;
          const gx = cx + Math.cos(g.ang) * g.dist;
          const gy = cy + Math.sin(g.ang) * g.dist;
          if (Math.hypot(x - gx, y - gy) < 48) {
            g.alive = false;
            window.sound.playSlice();
            api.spawnParticles(gx, gy, '#a855f7', 10);
            api.popup(gx, gy - 15, "GÜM!", "#a7f070");
          }
        });
        if (s.germs.every(g => !g.alive)) api.win("SIFIR ÇÜRÜK!");
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const cx = W / 2, cy = 255;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);

        // Protective Dentist Aura Ring
        ctx.strokeStyle = 'rgba(41, 173, 255, 0.55)';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, 42 + Math.sin(s.t * 6) * 3, 0, Math.PI * 2); ctx.stroke();
        window.GBA_RENDER.drawSprite(ctx, 'tooth', cx, cy, 4);

        for (const g of s.germs) {
          if (!g.alive) continue;
          g.ang += 0.62 * dt;
          g.dist -= g.spd * dt;
          const gx = cx + Math.cos(g.ang) * g.dist;
          const gy = cy + Math.sin(g.ang) * g.dist;
          window.GBA_RENDER.drawSprite(ctx, 'germ', gx, gy, 3);
          if (g.dist <= 28) {
            api.lose("MİKROP DİŞİ ISIRDI!");
            return;
          }
        }
        const left = s.germs.filter(g => g.alive).length;
        window.GBA_RENDER.drawGBABanner(ctx, W, `MİKROPLARI VUR! (KALAN: ${left})`);
      }
    },

    // 6. Kazan Bomb Storm (Authentic Uzbek Kazan over Flames + Sparking Bombs)
    {
      id: 6, level: 1,
      title: "PİLAVI KURTAR!",
      sub: "Kazanı kaydır, 4 eti tut! Bombadan kaç!",
      duration: 5800,
      init(s) {
        s.t = 0; s.kx = W / 2; s.caught = 0; s.needed = 4;
        s.items = [
          { x: 75, y: 40, vy: 190, bomb: false, done: false },
          { x: 245, y: -15, vy: 200, bomb: true, done: false },
          { x: 140, y: -65, vy: 200, bomb: false, done: false },
          { x: 270, y: -120, vy: 210, bomb: false, done: false },
          { x: 95, y: -175, vy: 210, bomb: true, done: false },
          { x: 215, y: -225, vy: 215, bomb: false, done: false },
          { x: 155, y: -280, vy: 220, bomb: false, done: false }
        ];
      },
      onPointer(type, x, y, s) {
        s.kx = Math.max(52, Math.min(W - 52, x));
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        for (const it of s.items) {
          if (it.done) continue;
          it.y += it.vy * dt;
          if (it.bomb) {
            window.GBA_RENDER.drawBomb(ctx, it.x, it.y, 3, s.t);
          } else {
            window.GBA_RENDER.drawSprite(ctx, 'meat', it.x, it.y, 3);
          }
          const hitW = it.bomb ? 30 : 52;
          if (it.y > H - 110 && it.y < H - 55 && Math.abs(it.x - s.kx) < hitW) {
            it.done = true;
            if (it.bomb) {
              api.lose("KAZANA BOMBA DÜŞTÜ!");
              return;
            }
            s.caught++;
            window.sound.playPop();
            api.spawnParticles(it.x, H - 95, '#ffd43b', 10);
            api.popup(s.kx, H - 125, `${s.caught}/4 LEZZET!`, '#ffd43b');
            if (s.caught >= s.needed) {
              api.win("ÖZBEK PİLAVI HAZIR!");
              return;
            }
          }
        }

        // Cast-iron Uzbek Kazan + Golden Pilaf Mound + Cooking Flames
        const kx = Math.floor(s.kx);
        ctx.fillStyle = (Math.floor(s.t * 14) % 2 === 0) ? '#e62e2d' : '#ffd43b';
        ctx.fillRect(kx - 28, H - 62, 56, 10);
        // Golden rice mound growing inside kazan
        if (s.caught > 0) {
          drawPixelBox(ctx, kx - 34, H - 102 - s.caught * 4, 68, 16 + s.caught * 4, '#ffd43b', '#141013', '#e87a1e');
        }
        // Kazan bowl + side handles
        drawPixelBox(ctx, kx - 54, H - 92, 108, 10, '#1e293b', '#141013', '#0f172a');
        drawPixelBox(ctx, kx - 46, H - 96, 92, 36, '#334155', '#141013', '#1e293b');

        window.GBA_RENDER.drawGBABanner(ctx, W, `ETLERİ TUT (${s.caught}/4) - BOMBADAN KAÇ!`);
      }
    },

    // 7. Hospital Elevator Escape (Elevator Doors + LED Floor Display)
    {
      id: 7, level: 1,
      title: "ASANSÖRÜ TUT!",
      sub: "YEŞİL 'AÇ' butonuna 3 kez bas! Kırmızıya basma!",
      duration: 5400,
      init(s) {
        s.t = 0; s.hits = 0; s.cooldown = 0;
        s.shuffle = () => {
          const pts = [
            { x: 95, y: 195 }, { x: 265, y: 195 },
            { x: 95, y: 320 }, { x: 265, y: 320 }
          ].sort(() => Math.random() - 0.5);
          s.green = pts[0];
          s.reds = pts.slice(1);
        };
        s.shuffle();
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' || s.cooldown > 0) return;
        if (Math.hypot(x - s.green.x, y - s.green.y) < 48) {
          s.hits++;
          s.cooldown = 0.22;
          window.sound.playPop();
          api.spawnParticles(s.green.x, s.green.y, '#38c848', 10);
          api.popup(s.green.x, s.green.y - 30, "BİP!", "#a7f070");
          if (s.hits >= 3) api.win("ASANSÖR KAPISI AÇILDI!");
          else s.shuffle();
          return;
        }
        for (const r of s.reds) {
          if (Math.hypot(x - r.x, y - r.y) < 38) {
            api.lose("KIRMIZI ALARMA BASTIN!");
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        if (s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt);
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);

        // Hospital Elevator Metallic Panel & LED Display
        drawPixelBox(ctx, 36, 86, W - 72, 315, '#94a3b8', '#141013', '#64748b');
        drawPixelBox(ctx, 80, 102, W - 160, 34, '#141013', '#334155', '#000');
        ctx.fillStyle = '#38c848';
        ctx.font = '900 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`ÇAPA KAT: ${3 - s.hits}`, W / 2, 120);

        drawPixelBox(ctx, s.green.x - 38, s.green.y - 38, 76, 76, '#38c848', '#141013', '#1a7a3e');
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 15px "Press Start 2P", monospace';
        ctx.fillText('◄►', s.green.x, s.green.y + 2);

        s.reds.forEach(r => {
          drawPixelBox(ctx, r.x - 34, r.y - 34, 68, 68, '#e62e2d', '#141013', '#9e1919');
          ctx.fillStyle = '#ffffff';
          ctx.fillText('!', r.x, r.y + 2);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, `YEŞİLE BAS! (${s.hits}/3)`);
      }
    },

    // 8. X-Ray Dual Crosshair Lock (Dental X-Ray Monitor + Laser Crosshairs)
    {
      id: 8, level: 1,
      title: "RÖNTGENİ ODAKLA!",
      sub: "Çizgiler yeşil kutuda dişin üstündeyken 2 kez DOKUN!",
      duration: 6200,
      init(s) {
        s.t = 0;
        s.step = 0;
        s.cx = 65;
        s.cy = 140;
        s.dx = 1;
        s.dy = 1;
        s.cooldown = 0;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' || s.cooldown > 0) return;
        if (s.step === 0) {
          if (Math.abs(s.cx - W / 2) <= 48) {
            s.cx = W / 2;
            s.step = 1;
            s.cooldown = 0.22;
            window.sound.playWin();
            api.spawnParticles(W / 2, 250, '#38c848', 10);
            api.popup(W / 2, 175, "YATAY KİLİTLENDİ!", "#a7f070");
          } else {
            api.lose("YATAY ODAK KAÇTI!");
          }
        } else if (s.step === 1) {
          if (Math.abs(s.cy - 250) <= 48) {
            s.cy = 250;
            window.sound.playWin();
            api.flash('#ffffff', 0.5);
            api.win("NET RÖNTGEN ÇEKİLDİ!");
          } else {
            api.lose("DİKEY ODAK KAÇTI!");
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        if (s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt);

        if (s.step === 0) {
          s.cx += s.dx * 205 * dt;
          if (s.cx >= W - 55) { s.cx = W - 55; s.dx = -1; }
          if (s.cx <= 55) { s.cx = 55; s.dx = 1; }
        } else if (s.step === 1) {
          s.cy += s.dy * 205 * dt;
          if (s.cy >= 365) { s.cy = 365; s.dy = -1; }
          if (s.cy <= 135) { s.cy = 135; s.dy = 1; }
        }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);

        // X-Ray Monitor Screen Frame
        drawPixelBox(ctx, 28, 96, W - 56, 308, '#0f172a', '#94a3b8', '#020617');
        const xOk = Math.abs(s.cx - W / 2) <= 48;
        const yOk = Math.abs(s.cy - 250) <= 48;

        drawPixelBox(ctx, W / 2 - 48, 250 - 48, 96, 96, 'rgba(56, 200, 72, 0.16)', '#38c848', '#0f172a');
        window.GBA_RENDER.drawSprite(ctx, 'tooth', W / 2, 250, 5);

        ctx.fillStyle = s.step > 0 ? '#38c848' : (xOk ? '#38c848' : '#ffd43b');
        ctx.fillRect(s.cx - 4, 102, 8, 296);

        if (s.step === 1) {
          ctx.fillStyle = yOk ? '#38c848' : '#ffd43b';
          ctx.fillRect(34, s.cy - 4, W - 68, 8);
        }

        window.GBA_RENDER.drawGBABanner(ctx, W, s.step === 0 ? "1. DİKEY ÇİZGİ DİŞTEYKEN DOKUN!" : "2. YATAY ÇİZGİ DİŞTEYKEN DOKUN!");
      }
    },

    // 9. Espresso Tray Balance (Porcelain Latte Cup + Steam + Wind Streaks + Smart Centering)
    {
      id: 9, level: 1,
      title: "KAHVEYİ DENGEDE TUT!",
      sub: "Yeşil butona basarak veya sürükleyerek bardağı ortada tut!",
      duration: 4400,
      init(s) {
        s.t = 0;
        s.x = W / 2;
        s.windSign = Math.random() < 0.5 ? 1 : -1;
        s.vx = s.windSign * 42;
        s.holdDir = 0;
        s.dragging = false;
        s.dragX = W / 2;
        s.survived = 0;
        s.goalTime = 2.6;
      },
      onPointer(type, x, y, s, api) {
        if (type === 'down') {
          const offsetFromCenter = s.x - W / 2;
          let pushDir;
          if (Math.abs(offsetFromCenter) > 18) {
            pushDir = -Math.sign(offsetFromCenter);
          } else {
            pushDir = x < W / 2 ? -1 : 1;
          }
          s.holdDir = pushDir;
          s.vx = pushDir * 115;
          if (y < 330) {
            s.dragging = true;
            s.dragX = Math.max(75, Math.min(W - 75, x));
          }
          window.sound.playClick();
          api.spawnParticles(s.x, 265, '#38c848', 5);
        } else if (type === 'move') {
          if (s.dragging) {
            s.dragX = Math.max(75, Math.min(W - 75, x));
          }
        } else if (type === 'up') {
          s.holdDir = 0;
          s.dragging = false;
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.survived += dt;

        const currentWindSign = s.t < 1.45 ? s.windSign : -s.windSign;
        const wind = currentWindSign * 138;

        if (s.dragging) {
          const targetX = Math.abs(s.dragX - W / 2) < 95 ? s.dragX : W / 2;
          s.x += (targetX - s.x) * Math.min(1, 10 * dt) + wind * 0.25 * dt;
          s.vx = 0;
        } else {
          const holdForce = s.holdDir !== 0 ? (-Math.sign(s.x - W / 2) * 240) : 0;
          s.vx += (wind + holdForce) * dt;
          s.vx *= Math.pow(0.52, dt);
          s.vx = Math.max(-165, Math.min(165, s.vx));
          s.x += s.vx * dt;
        }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        // Animated wind streaks across the sky
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        for (let i = 0; i < 4; i++) {
          const wx = ((s.t * 220 * currentWindSign + i * 95) % W + W) % W;
          ctx.fillRect(wx, 145 + i * 26, 36, 3);
        }

        const windRight = wind > 0;
        drawPixelBox(ctx, W / 2 - 78, 84, 156, 28, '#fff6d3', '#141013', '#e87a1e');
        ctx.fillStyle = '#141013';
        ctx.font = '900 11px "Press Start 2P", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(windRight ? 'RÜZGAR: >>>' : '<<< :RÜZGAR', W / 2, 99);

        // Wooden Serving Tray + Green Center Pad
        drawPixelBox(ctx, 38, 290, W - 76, 22, '#8f563b', '#141013', '#592812');
        ctx.fillStyle = '#38c848';
        ctx.fillRect(W / 2 - 50, 293, 100, 8);

        // Rich Porcelain Latte Cup with Steam & Heart
        const danger = Math.abs(s.x - W / 2) > 92;
        window.GBA_RENDER.drawCoffeeCup(ctx, s.x, 240, danger, s.t);

        const prog = Math.min(1, s.survived / s.goalTime);
        drawPixelBox(ctx, 60, 320, W - 120, 14, '#1e293b', '#141013', '#000');
        ctx.fillStyle = '#38c848';
        ctx.fillRect(63, 323, (W - 126) * prog, 8);

        const needLeft = s.x > W / 2 + 20;
        const needRight = s.x < W / 2 - 20;
        drawPixelBox(ctx, 24, 348, 104, 50, needLeft ? '#38c848' : '#ffd43b', '#141013', '#e87a1e');
        drawPixelBox(ctx, W - 128, 348, 104, 50, needRight ? '#38c848' : '#ffd43b', '#141013', '#e87a1e');
        ctx.fillStyle = '#141013';
        ctx.font = '900 13px "Press Start 2P", monospace';
        ctx.fillText('◀ SOL', 76, 374);
        ctx.fillText('SAĞ ▶', W - 76, 374);

        if (s.x < 40 || s.x > W - 40) {
          api.lose("KAHVE DÖKÜLDÜ!");
          return;
        }
        if (s.survived >= s.goalTime) api.win("KAHVE KURTULDU!");
        window.GBA_RENDER.drawGBABanner(ctx, W, "YEŞİL BUTONA BAS -> DENGEDE TUT!");
      }
    },

    // 10. WORLD 1 BOSS: Super Mario Pipe Jumper (FIXED & POLISHED: Coin Guide Arcs + Crisp Jump!)
    {
      id: 10, level: 1,
      title: "BOSS: BORULARDAN ATLA!",
      sub: "Dokunarak 3 yeşil borunun üzerinden zıpla!",
      duration: 6400,
      init(s) {
        s.t = 0;
        s.gy = H - 90; // Feet rest cleanly at y = 424 (ground top)
        s.y = s.gy;
        s.vy = 0;
        s.jumps = 0;
        s.cleared = 0;
        // Generous starting x so Pipe #1 never surprises the player!
        s.pipes = [
          { x: W + 45, h: 48, passed: false, coinGot: false },
          { x: W + 235, h: 56, passed: false, coinGot: false },
          { x: W + 425, h: 52, passed: false, coinGot: false }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type === 'down' && s.jumps < 2) {
          s.vy = -590;
          s.jumps++;
          window.sound.playPop();
          api.spawnParticles(75, s.y + 28, '#fff6d3', 6);
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.y += s.vy * dt;
        s.vy += 1120 * dt;
        if (s.y >= s.gy) { s.y = s.gy; s.vy = 0; s.jumps = 0; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        for (const p of s.pipes) {
          p.x -= 190 * dt;
          const pipeTop = H - 56 - p.h;
          window.GBA_RENDER.drawPipe(ctx, p.x, pipeTop, 38, p.h);

          // Floating Mario Gold Coin above each pipe to guide jump timing!
          const coinX = p.x + 19;
          const coinY = pipeTop - 58;
          if (!p.coinGot) {
            window.GBA_RENDER.drawSprite(ctx, 'coin', coinX, coinY, 3);
            if (Math.hypot(75 - coinX, s.y - coinY) < 38) {
              p.coinGot = true;
              window.sound.playPop();
              api.spawnParticles(coinX, coinY, '#ffd43b', 8);
              api.popup(coinX, coinY - 20, "+ALTIN!", "#ffd43b");
            }
          }

          // Forgiving, accurate hitbox at Farida's feet
          if (Math.abs((p.x + 19) - 75) < 16 && (s.y + 24) > pipeTop + 6) {
            api.lose("BORUYA ÇARPTIN!");
            return;
          }
          if (!p.passed && p.x + 38 < 62) {
            p.passed = true;
            s.cleared++;
            window.sound.playWin();
            api.popup(75, s.y - 45, `${s.cleared}/3 SÜPER!`, '#a7f070');
            if (s.cleared >= 3) {
              api.win("WORLD 1 BOSS GEÇİLDİ! ★");
              return;
            }
          }
        }
        const runBob = s.y >= s.gy ? Math.abs(Math.sin(s.t * 14)) * 4 : 0;
        window.GBA_RENDER.drawCharacter(ctx, 'farida_dentist', 75, s.y - runBob, 50, 68);
        window.GBA_RENDER.drawGBABanner(ctx, W, `DOKUN VE ZIPLA! (${s.cleared}/3)`);
      }
    },

    // =======================================================================
    // WORLD 2: KORSAN DENİZLERİ & NİNJA KÖYÜ (GAMES 11 - 20)
    // =======================================================================

    // 11. Gomu Gomu Grapple Past Moving Bomb
    {
      id: 11, level: 2,
      title: "GOMU GOMU NİŞAN!",
      sub: "Bombaya değmeden üstteki 2 korsan etine dokun!",
      duration: 5800,
      init(s) {
        s.t = 0; s.firing = false; s.hx = W / 2; s.hy = H - 85; s.vx = 0; s.vy = 0;
        s.targets = [{ x: 90, y: 125, got: false }, { x: W - 90, y: 125, got: false }];
        s.bombX = W / 2; s.bDir = 1;
      },
      onPointer(type, x, y, s) {
        if (type === 'down' && !s.firing) {
          const ang = Math.atan2(y - (H - 85), x - W / 2);
          s.vx = Math.cos(ang) * 780;
          s.vy = Math.sin(ang) * 780;
          s.firing = true;
          window.sound.playPop();
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.bombX += s.bDir * 155 * dt;
        if (s.bombX >= W - 55) { s.bombX = W - 55; s.bDir = -1; }
        if (s.bombX <= 55) { s.bombX = 55; s.bDir = 1; }

        if (s.firing) {
          s.hx += s.vx * dt;
          s.hy += s.vy * dt;
          if (Math.hypot(s.hx - s.bombX, s.hy - 235) < 22) {
            api.lose("BOMBAYA ÇARPTIN!");
            return;
          }
          s.targets.forEach(t => {
            if (!t.got && Math.hypot(s.hx - t.x, s.hy - t.y) < 48) {
              t.got = true;
              s.firing = false; s.hx = W / 2; s.hy = H - 85;
              window.sound.playWin();
              api.spawnParticles(t.x, t.y, '#ffd43b', 12);
              api.popup(t.x, t.y, "GOMU GOMU!", "#ffd43b");
            }
          });
          if (s.hx < 0 || s.hx > W || s.hy < 0 || s.hy > H) {
            s.firing = false; s.hx = W / 2; s.hy = H - 85;
          }
          if (s.targets.every(t => t.got)) {
            api.win("HAZİNELER ALINDI!");
            return;
          }
        }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'sunset', s.t);

        // Stretching rubber arm + fist
        ctx.strokeStyle = '#141013'; ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(W / 2, H - 85); ctx.lineTo(s.hx, s.hy); ctx.stroke();
        ctx.strokeStyle = '#ffccaa'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(W / 2, H - 85); ctx.lineTo(s.hx, s.hy); ctx.stroke();
        if (s.firing) drawPixelBox(ctx, s.hx - 12, s.hy - 12, 24, 24, '#ffccaa', '#141013', '#e87a1e');

        window.GBA_RENDER.drawBomb(ctx, s.bombX, 235, 3, s.t);
        s.targets.forEach(t => {
          if (!t.got) window.GBA_RENDER.drawSprite(ctx, 'meat', t.x, t.y + Math.sin(s.t * 5) * 4, 4);
        });
        window.GBA_RENDER.drawCharacter(ctx, 'farida_dentist', W / 2, H - 85, 50, 68);
        window.GBA_RENDER.drawGBABanner(ctx, W, "BOMBAYA DEĞMEDEN ETLERE DOKUN!");
      }
    },

    // 12. Flappy Straw Hat (FIXED & POLISHED: Gentle Start Hover + Wide Pipe Gaps + Coin Guides + Goal!)
    {
      id: 12, level: 2,
      title: "ŞAPKAYI UÇUR!",
      sub: "Dokunarak şapkayı boruların arasından bayrağa uçur!",
      duration: 6200,
      init(s) {
        s.t = 0;
        s.hx = 48;
        s.hy = 235;
        s.vy = 0;
        s.started = false;
        s.coins = [
          { x: 150, y: 220, got: false },
          { x: 255, y: 245, got: false }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type === 'down') {
          s.started = true;
          s.vy = -225;
          window.sound.playPop();
          api.spawnParticles(s.hx - 14, s.hy + 6, '#ffffff', 5);
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        // Hover smoothly for first 0.55s if player hasn't tapped yet so it NEVER drops immediately!
        if (!s.started && s.t < 0.55) {
          s.hx += 55 * dt;
          s.hy = 235 + Math.sin(s.t * 8) * 6;
        } else {
          s.started = true;
          s.hx += 74 * dt;
          s.hy += s.vy * dt;
          s.vy += 430 * dt;
        }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        // Mario Goal Post on the right
        drawPixelBox(ctx, W - 30, 80, 8, H - 136, '#fff6d3', '#141013', '#cbd5e1');
        window.GBA_RENDER.drawSprite(ctx, 'star', W - 26, 75, 2);

        const pipes = [
          { x: 150, gapY: 220, gapH: 152 },
          { x: 255, gapY: 245, gapH: 152 }
        ];
        for (const p of pipes) {
          const topH = p.gapY - p.gapH / 2 - 42;
          const botY = p.gapY + p.gapH / 2;
          window.GBA_RENDER.drawPipe(ctx, p.x - 19, 42, 38, topH);
          window.GBA_RENDER.drawPipe(ctx, p.x - 19, botY, 38, H - 56 - botY);

          if (Math.abs(s.hx - p.x) < 17 && (s.hy < p.gapY - p.gapH / 2 + 8 || s.hy > p.gapY + p.gapH / 2 - 8)) {
            api.lose("ŞAPKA BORUYA ÇARPTI!");
            return;
          }
        }

        s.coins.forEach(c => {
          if (!c.got) {
            window.GBA_RENDER.drawSprite(ctx, 'coin', c.x, c.y, 3);
            if (Math.hypot(s.hx - c.x, s.hy - c.y) < 34) {
              c.got = true;
              window.sound.playPop();
              api.popup(c.x, c.y - 22, "SÜPER!", "#ffd43b");
            }
          }
        });

        if (s.hy < 46 || s.hy > H - 58) {
          api.lose("ŞAPKA DÜŞTÜ!");
          return;
        }

        const tilt = Math.max(-0.35, Math.min(0.35, s.vy / 600));
        window.GBA_RENDER.drawSprite(ctx, 'strawhat', s.hx, s.hy, 3, tilt);

        if (s.hx >= W - 36) api.win("ŞAPKA BAYRAĞA ULAŞTI! ★");
        window.GBA_RENDER.drawGBABanner(ctx, W, "DOKUNARAK BORULARDAN UÇUR!");
      }
    },

    // 13. Swirling Rasengan Chakra Core
    {
      id: 13, level: 2,
      title: "RASENGAN ODAĞI!",
      sub: "Mavi çakra küresine 4 kez dokun, bombaya DOKUNMA!",
      duration: 5600,
      init(s) {
        s.t = 0; s.hits = 0; s.needed = 4;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const bx = W / 2 + Math.cos(s.t * 2.0) * 85;
        const by = 250 + Math.sin(s.t * 1.6) * 65;
        const rx = W / 2 - Math.cos(s.t * 2.0) * 85;
        const ry = 250 - Math.sin(s.t * 1.6) * 65;
        if (Math.hypot(x - bx, y - by) < 56) {
          s.hits++;
          window.sound.playPop();
          api.spawnParticles(bx, by, '#29adff', 12);
          api.popup(bx, by - 28, `ÇAKRA ${s.hits}/4!`, '#9cd8fc');
          if (s.hits >= s.needed) api.win("RASENGAN TAM GÜÇ!");
          return;
        }
        if (Math.hypot(x - rx, y - ry) < 32) {
          api.lose("BOMBAYA BASTIN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);
        const bx = W / 2 + Math.cos(s.t * 2.0) * 85;
        const by = 250 + Math.sin(s.t * 1.6) * 65;
        const rx = W / 2 - Math.cos(s.t * 2.0) * 85;
        const ry = 250 - Math.sin(s.t * 1.6) * 65;

        // Swirling Rasengan Orb
        ctx.fillStyle = '#141013';
        ctx.beginPath(); ctx.arc(bx, by, 38, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#29adff';
        ctx.beginPath(); ctx.arc(bx, by, 34, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(bx, by, 22, s.t * 10, s.t * 10 + 4.2); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(bx, by, 10 + s.hits * 2, 0, Math.PI * 2); ctx.fill();

        window.GBA_RENDER.drawBomb(ctx, rx, ry, 3, s.t);
        window.GBA_RENDER.drawGBABanner(ctx, W, `MAVİ KÜREYE DOKUN (${s.hits}/${s.needed})!`);
      }
    },

    // 14. 360° Shield Deflector
    {
      id: 14, level: 2,
      title: "SHURİKEN KALKANI!",
      sub: "Parmağınla altın kalkanı gelen 4 yıldıza doğru tut!",
      duration: 5600,
      init(s) {
        s.t = 0; s.ang = 0; s.blocked = 0;
        s.stars = [0, 1, 2, 3].map(i => ({
          ang: i * (Math.PI / 2),
          dist: 155 + i * 48,
          active: true
        }));
      },
      onPointer(type, x, y, s) {
        s.ang = Math.atan2(y - 255, x - W / 2);
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const cx = W / 2, cy = 255;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', cx, cy, 48, 64);

        // Curved Golden Chakra Shield Arc
        ctx.strokeStyle = '#141013'; ctx.lineWidth = 16;
        ctx.beginPath(); ctx.arc(cx, cy, 52, s.ang - 0.65, s.ang + 0.65); ctx.stroke();
        ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(cx, cy, 52, s.ang - 0.6, s.ang + 0.6); ctx.stroke();

        const shX = cx + Math.cos(s.ang) * 52;
        const shY = cy + Math.sin(s.ang) * 52;

        for (const st of s.stars) {
          if (!st.active) continue;
          st.dist -= 44 * dt;
          const sx = cx + Math.cos(st.ang) * st.dist;
          const sy = cy + Math.sin(st.ang) * st.dist;
          window.GBA_RENDER.drawSprite(ctx, 'shuriken', sx, sy, 3, s.t * 12);

          if (Math.hypot(sx - shX, sy - shY) < 48) {
            st.active = false;
            s.blocked++;
            window.sound.playSlice();
            api.spawnParticles(sx, sy, '#ffd43b', 10);
            api.popup(sx, sy - 16, "KLİNK!", "#ffd43b");
            if (s.blocked >= 4) { api.win("KUSURSUZ KALKAN!"); return; }
          } else if (st.dist < 22) {
            api.lose("SHURİKEN İSABET ETTİ!");
            return;
          }
        }
        window.GBA_RENDER.drawGBABanner(ctx, W, `KALKANI ÇEVİR! (${s.blocked}/4)`);
      }
    },

    // 15. Pirate Cannon Trajectory Shot
    {
      id: 15, level: 2,
      title: "HEDEFİ VUR!",
      sub: "Bombaya çarpmadan üstteki altın bloğu topla vur!",
      duration: 5600,
      init(s) {
        s.t = 0; s.tx = W / 2; s.balls = [];
      },
      onPointer(type, x, y, s, api) {
        if (type === 'down' && s.balls.length < 3) {
          s.balls.push({ x: W / 2, y: H - 95 });
          window.sound.playPop();
          api.spawnParticles(W / 2, H - 102, '#fff6d3', 6);
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.tx = W / 2 + Math.sin(s.t * 2.5) * 105;
        const bx = W / 2 - Math.sin(s.t * 2.5) * 95;

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'sunset', s.t);
        window.GBA_RENDER.drawSprite(ctx, 'qblock', s.tx, 120, 4);
        window.GBA_RENDER.drawBomb(ctx, bx, 225, 3, s.t);

        for (const b of s.balls) {
          b.y -= 540 * dt;
          ctx.fillStyle = '#141013';
          ctx.beginPath(); ctx.arc(b.x, b.y, 11, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#475569';
          ctx.beginPath(); ctx.arc(b.x - 2, b.y - 2, 6, 0, Math.PI * 2); ctx.fill();

          if (Math.hypot(b.x - bx, b.y - 225) < 22) {
            api.lose("BOMBAYA ÇARPTIN!");
            return;
          }
          if (Math.hypot(b.x - s.tx, b.y - 120) < 44) {
            api.spawnParticles(s.tx, 120, '#ffd43b', 18);
            api.win("TAM İSABET! GÜM!");
            return;
          }
        }
        s.balls = s.balls.filter(b => b.y > 0);

        // Wheeled Pirate Deck Cannon
        drawPixelBox(ctx, W / 2 - 18, H - 112, 36, 44, '#334155', '#141013', '#0f172a');
        drawPixelBox(ctx, W / 2 - 28, H - 78, 16, 20, '#8f563b', '#141013', '#592812');
        drawPixelBox(ctx, W / 2 + 12, H - 78, 16, 20, '#8f563b', '#141013', '#592812');
        window.GBA_RENDER.drawGBABanner(ctx, W, "DOKUN VE ALTIN BLOĞU VUR!");
      }
    },

    // 16. Kage Bunshin: Spot the Real Ninja Clone
    {
      id: 16, level: 2,
      title: "GERÇEK KLONU BUL!",
      sub: "Kalpli klonu izle, yer değiştirmeler bitince ONA DOKUN!",
      duration: 5800,
      init(s) {
        s.t = 0; s.phase = 'show'; s.swapCount = 4; s.timer = 0;
        const pts = [
          { x: 90, y: 185 }, { x: 270, y: 185 },
          { x: 90, y: 315 }, { x: 270, y: 315 }
        ];
        s.clones = pts.map((p, i) => ({ id: i, x: p.x, y: p.y, tx: p.x, ty: p.y }));
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' || s.phase !== 'pick') return;
        for (const c of s.clones) {
          if (Math.hypot(x - c.x, y - c.y) < 52) {
            if (c.id === 0) api.win("GERÇEK FARİDA BULUNDU!");
            else api.lose("SAHTE GÖLGE KLONU!");
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        if (s.t > 1.1 && s.phase === 'show') {
          s.phase = 'swap';
          api.spawnParticles(s.clones[0].x, s.clones[0].y, '#ffffff', 10);
        }
        if (s.phase === 'swap') {
          s.timer += dt;
          if (s.timer > 0.42) {
            s.timer = 0;
            if (s.swapCount > 0) {
              const a = Math.floor(Math.random() * 4);
              const b = (a + 1 + Math.floor(Math.random() * 3)) % 4;
              const tx = s.clones[a].tx, ty = s.clones[a].ty;
              s.clones[a].tx = s.clones[b].tx; s.clones[a].ty = s.clones[b].ty;
              s.clones[b].tx = tx; s.clones[b].ty = ty;
              s.swapCount--;
              window.sound.playClick();
            } else s.phase = 'pick';
          }
        }
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);
        s.clones.forEach(c => {
          c.x += (c.tx - c.x) * 14 * dt;
          c.y += (c.ty - c.y) * 14 * dt;
          window.GBA_RENDER.drawCharacter(ctx, 'farida_dentist', c.x, c.y, 48, 64);
          if (s.phase === 'show' && c.id === 0) {
            window.GBA_RENDER.drawSprite(ctx, 'heart', c.x, c.y - 44 + Math.sin(s.t * 10) * 4, 3);
          }
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, s.phase === 'pick' ? "ŞİMDİ GERÇEK KLONA DOKUN!" : "KALPLİ KLONU İZLE!");
      }
    },

    // 17. Kunai Spinning Wooden Log (Real Pixel Kunai Sprites + Tree Rings!)
    {
      id: 17, level: 2,
      title: "KUNAİ SAPLA!",
      sub: "Diğer bıçaklara ÇARPMADAN kütüğe 3 kunai sapla!",
      duration: 5800,
      init(s) {
        s.t = 0; s.rot = 0; s.stuck = [0, Math.PI]; s.added = 0;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const hitAngle = (Math.PI / 2 - (s.rot % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2);
        for (const a of s.stuck) {
          const diff = Math.abs(Math.atan2(Math.sin(hitAngle - a), Math.cos(hitAngle - a)));
          if (diff < 0.24) {
            api.lose("DİĞER KUNAİYE ÇARPTIN!");
            return;
          }
        }
        s.stuck.push(hitAngle);
        s.added++;
        window.sound.playSlice();
        api.spawnParticles(W / 2, 210 + 62, '#ffd43b', 10);
        api.popup(W / 2, 305, `${s.added}/3 SAPLANDI!`, '#a7f070');
        if (s.added >= 3) api.win("USTA NİNJA!");
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.rot += 2.15 * dt;
        const cx = W / 2, cy = 205, r = 60;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        // Stuck Kunai rotating around the log
        s.stuck.forEach(a => {
          const tot = a + s.rot;
          const kx = cx + Math.cos(tot) * (r + 18);
          const ky = cy + Math.sin(tot) * (r + 18);
          window.GBA_RENDER.drawSprite(ctx, 'kunai', kx, ky, 3, tot - Math.PI / 2);
        });

        // Concentric Wooden Log Target
        ctx.fillStyle = '#141013';
        ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8f563b';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#eab308';
        ctx.beginPath(); ctx.arc(cx, cy, r - 10, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.stroke();

        // Next Kunai ready at bottom
        window.GBA_RENDER.drawSprite(ctx, 'kunai', cx, H - 86, 3, 0);
        window.GBA_RENDER.drawGBABanner(ctx, W, `BOŞLUĞA FIRLAT! (${s.added}/3)`);
      }
    },

    // 18. Grand Line Ocean & Sea Rocks Slalom
    {
      id: 18, level: 2,
      title: "KAYALARDAN KAÇ!",
      sub: "Parmağınla kaydırarak deniz kayalarına çarpmadan ilerle!",
      duration: 4600,
      init(s) {
        s.t = 0; s.px = W / 2; s.survived = 0;
        s.rocks = [
          { x: 75, y: 40 },
          { x: 265, y: -55 },
          { x: 180, y: -150 },
          { x: 90, y: -245 },
          { x: 255, y: -340 }
        ];
      },
      onPointer(type, x, y, s) {
        s.px = Math.max(40, Math.min(W - 40, x));
      },
      update(dt, s, _W, _H, api) {
        s.t += dt; s.survived += dt;
        const ctx = api.ctx;
        // Grand Line Ocean Background
        ctx.fillStyle = '#1d57a5'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#29adff';
        for (let wy = 40; wy < H; wy += 48) {
          const off = (s.t * 80 + wy) % 60;
          for (let wx = -40; wx < W + 40; wx += 60) {
            ctx.fillRect(wx + off, wy, 28, 6);
          }
        }

        for (const r of s.rocks) {
          r.y += 215 * dt;
          if (r.y > H + 30) { r.y -= 480; }
          // Seafoam + Jagged Reef Rock
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(r.x, r.y + 8, 26, 0, Math.PI * 2); ctx.fill();
          drawPixelBox(ctx, r.x - 22, r.y - 18, 44, 36, '#475569', '#141013', '#1e293b');
          if (Math.hypot(s.px - r.x, (H - 95) - r.y) < 25) {
            api.lose("KAYAYA ÇARPTIN!");
            return;
          }
        }
        // Mini Pirate Boat under Farida
        drawPixelBox(ctx, s.px - 28, H - 78, 56, 22, '#8f563b', '#141013', '#592812');
        window.GBA_RENDER.drawCharacter(ctx, 'farida_dentist', s.px, H - 102, 48, 64);
        if (s.survived >= 3.2) api.win("GRAND LINE AŞILDI!");
        window.GBA_RENDER.drawGBABanner(ctx, W, "KAYDIR VE KAYALARDAN KAÇ!");
      }
    },

    // 19. Ninja Hand-Sign Memory Sequence
    {
      id: 19, level: 2,
      title: "SIRAYI TEKRARLA!",
      sub: "Parlayan 3 mührün sırasını izle ve aynı sırayla DOKUN!",
      duration: 6200,
      init(s) {
        s.t = 0;
        s.seq = [0, 1, 2, 3].sort(() => Math.random() - 0.5).slice(0, 3);
        s.step = 0;
        s.pads = [
          { x: 95, y: 185, col: '#e62e2d', label: '1' },
          { x: 265, y: 185, col: '#29adff', label: '2' },
          { x: 95, y: 315, col: '#38c848', label: '3' },
          { x: 265, y: 315, col: '#ffd43b', label: '4' }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' || s.t < 1.8) return;
        for (let i = 0; i < 4; i++) {
          const p = s.pads[i];
          if (Math.hypot(x - p.x, y - p.y) < 50) {
            if (i === s.seq[s.step]) {
              s.step++;
              window.sound.playPop();
              api.spawnParticles(p.x, p.y, '#ffffff', 10);
              api.popup(p.x, p.y - 30, "DOĞRU!", "#a7f070");
              if (s.step >= 3) api.win("DOĞRU MÜHÜR SIRASI!");
            } else {
              api.lose("YANLIŞ SIRA!");
            }
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        let activeIdx = -1;
        if (s.t < 1.8) {
          const slot = Math.floor((s.t / 1.8) * 3);
          const subPhase = ((s.t / 1.8) * 3) % 1;
          if (subPhase < 0.76) activeIdx = s.seq[slot];
        }
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);

        s.pads.forEach((p, idx) => {
          const lit = idx === activeIdx;
          if (lit) {
            drawPixelBox(ctx, p.x - 48, p.y - 48, 96, 96, '#ffffff', '#ffd43b', '#ffffff');
          }
          drawPixelBox(ctx, p.x - 42, p.y - 42, 84, 84, lit ? '#ffffff' : p.col, '#141013', '#000');
          ctx.fillStyle = '#141013';
          ctx.font = '900 22px "Press Start 2P", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(p.label, p.x, p.y + 2);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, s.t < 1.8 ? "PARLAYAN SIRAYI İZLE!" : `AYNI SIRAYLA DOKUN! (${s.step}/3)`);
      }
    },

    // 20. WORLD 2 BOSS: Shuriken Volley
    {
      id: 20, level: 2,
      title: "BOSS: GERİ PÜSKÜRT!",
      sub: "Yıldız altındaki kutu YEŞİL olduğunda 3 kez DOKUN!",
      duration: 6000,
      init(s) {
        s.t = 0; s.by = 95; s.vy = 220; s.hits = 0;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        if (s.vy > 0 && Math.abs(s.by - 325) < 68) {
          s.vy = -(340 + s.hits * 35);
          s.hits++;
          window.sound.playSlice();
          api.spawnParticles(W / 2, s.by, '#ffd43b', 14);
          api.popup(W / 2, s.by - 25, `${s.hits}/3 PÜSKÜRTÜLDÜ!`, '#ffd43b');
          if (s.hits >= 3) api.win("WORLD 2 BOSS GEÇİLDİ! ★");
        } else if (s.by > 205) {
          api.lose("KUTU YEŞİLKEN VUR!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.by += s.vy * dt;
        if (s.by < 90 && s.vy < 0) s.vy = 235 + s.hits * 32;
        if (s.by > H - 40) { api.lose("YILDIZI KAÇIRDIN!"); return; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'sunset', s.t);
        const inZone = s.vy > 0 && Math.abs(s.by - 325) < 68;
        drawPixelBox(ctx, W / 2 - 58, 272, 116, 102, inZone ? 'rgba(56, 200, 72, 0.5)' : 'rgba(255, 212, 59, 0.28)', inZone ? '#38c848' : '#ffd43b', '#141013');
        window.GBA_RENDER.drawCharacter(ctx, 'farida_dentist', W / 2, 398, 50, 68);
        window.GBA_RENDER.drawSprite(ctx, 'shuriken', W / 2, s.by, 4, s.t * 15);
        window.GBA_RENDER.drawGBABanner(ctx, W, `KUTU YEŞİLKEN DOKUN! (${s.hits}/3)`);
      }
    },

    // =======================================================================
    // WORLD 3: DEDEKTİF DOSYALARI & GECE NÖBETİ (GAMES 21 - 30)
    // =======================================================================

    // 21. Detective Parabolic Arc Cup Shuffle
    {
      id: 21, level: 3,
      title: "İPUCU HANGİSİNDE?",
      sub: "Kalbin girdiği fincanı yay çizerek karışırken İZLE ve BUL!",
      duration: 6200,
      init(s) {
        s.t = 0;
        s.phase = 'reveal';
        s.slotsX = [60, 140, 220, 300];
        s.cups = [0, 1, 2, 3].map(i => ({ id: i, slot: i, x: 60 + i * 80, y: 265 }));
        s.winnerId = Math.floor(Math.random() * 4);
        s.swapsLeft = 4;
        s.anim = null;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' || s.phase !== 'pick') return;
        for (const c of s.cups) {
          if (Math.hypot(x - c.x, y - c.y) < 46) {
            if (c.id === s.winnerId) {
              c.y -= 45;
              api.win("DOĞRU İPUCU BULUNDU!");
            } else {
              api.lose("YANLIŞ FİNCAN!");
            }
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'castle', s.t);

        // Detective Velvet Table
        drawPixelBox(ctx, 20, 290, W - 40, 56, '#7f1d1d', '#141013', '#450a0a');

        if (s.phase === 'reveal' && s.t > 1.15) {
          s.phase = 'shuffle';
        }

        if (s.phase === 'shuffle') {
          if (!s.anim) {
            if (s.swapsLeft > 0) {
              const a = Math.floor(Math.random() * 4);
              const b = (a + 1 + Math.floor(Math.random() * 3)) % 4;
              s.anim = {
                a, b, p: 0,
                ax0: s.slotsX[s.cups[a].slot],
                bx0: s.slotsX[s.cups[b].slot]
              };
              const tmp = s.cups[a].slot;
              s.cups[a].slot = s.cups[b].slot;
              s.cups[b].slot = tmp;
              s.swapsLeft--;
              window.sound.playClick();
            } else {
              s.phase = 'pick';
            }
          } else {
            s.anim.p += dt * 2.8;
            const p = Math.min(1, s.anim.p);
            const ca = s.cups[s.anim.a];
            const cb = s.cups[s.anim.b];
            ca.x = s.anim.ax0 + (s.anim.bx0 - s.anim.ax0) * p;
            cb.x = s.anim.bx0 + (s.anim.ax0 - s.anim.bx0) * p;
            ca.y = 265 - Math.sin(p * Math.PI) * 58;
            cb.y = 265 + Math.sin(p * Math.PI) * 58;
            if (p >= 1) {
              ca.y = 265; cb.y = 265;
              s.anim = null;
            }
          }
        }

        s.cups.forEach(c => {
          const lift = (s.phase === 'reveal' && c.id === s.winnerId) ? -55 : 0;
          if (s.phase === 'reveal' && c.id === s.winnerId) {
            window.GBA_RENDER.drawSprite(ctx, 'heart', c.x, 275, 3);
          }
          // Inverted Porcelain Cup + Gold Rim
          drawPixelBox(ctx, c.x - 28, c.y + 18 + lift, 56, 10, '#ffd43b', '#141013', '#e87a1e');
          drawPixelBox(ctx, c.x - 24, c.y - 28 + lift, 48, 48, '#29adff', '#141013', '#1d57a5');
        });

        window.GBA_RENDER.drawGBABanner(ctx, W, s.phase === 'pick' ? "DOĞRU FİNCANA DOKUN!" : "KALPLİ FİNCANI İZLE!");
      }
    },

    // 22. Dexter Safe Lock (Vault Dial with Tick Marks)
    {
      id: 22, level: 3,
      title: "KASAYI AÇ!",
      sub: "Kırmızı ibre yeşil hedefin üstündeyken 2 kez DOKUN!",
      duration: 5600,
      init(s) {
        s.t = 0; s.ang = 0; s.target = Math.PI * 1.5; s.dir = 1; s.locks = 0; s.needed = 2;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const diff = Math.abs(Math.atan2(Math.sin(s.ang - s.target), Math.cos(s.ang - s.target)));
        if (diff < 0.65) {
          s.locks++;
          s.dir *= -1.15;
          s.target = (s.target + 2.4) % (Math.PI * 2);
          window.sound.playWin();
          api.spawnParticles(W / 2, 250, '#38c848', 12);
          api.popup(W / 2, 130, `KİLİT ${s.locks}/2 AÇIK!`, '#a7f070');
          if (s.locks >= s.needed) api.win("KASA AÇILDI!");
        } else {
          api.lose("YEŞİL HEDEFİ KAÇIRDIN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.ang = (s.ang + s.dir * 2.65 * dt) % (Math.PI * 2);
        const cx = W / 2, cy = 250, r = 82;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);

        // Circular Vault Dial
        drawPixelBox(ctx, cx - 104, cy - 104, 208, 208, '#334155', '#141013', '#1e293b');
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

        const tx = cx + Math.cos(s.target) * r, ty = cy + Math.sin(s.target) * r;
        drawPixelBox(ctx, tx - 20, ty - 20, 40, 40, '#38c848', '#141013', '#1a7a3e');
        const px = cx + Math.cos(s.ang) * r, py = cy + Math.sin(s.ang) * r;
        drawPixelBox(ctx, px - 12, py - 12, 24, 24, '#e62e2d', '#141013', '#9e1919');
        drawPixelBox(ctx, cx - 22, cy - 22, 44, 44, '#ffd43b', '#141013', '#e87a1e');

        window.GBA_RENDER.drawGBABanner(ctx, W, `YEŞİLDE DOKUN! (${s.locks}/${s.needed})`);
      }
    },

    // 23. Red John File Match
    {
      id: 23, level: 3,
      title: "GERÇEK KANITI BUL!",
      sub: "Sadece KALP sembollü dosyaya dokun! Mikroba basma!",
      duration: 5000,
      init(s) {
        s.t = 0;
        s.cards = [
          { x: 75, y: 175 }, { x: 180, y: 175 }, { x: 285, y: 175 },
          { x: 75, y: 310 }, { x: 180, y: 310 }, { x: 285, y: 310 }
        ];
        s.winIdx = Math.floor(Math.random() * 6);
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        for (let i = 0; i < 6; i++) {
          const c = s.cards[i];
          if (Math.hypot(x - c.x, y - c.y) < 48) {
            if (i === s.winIdx) api.win("GERÇEK KANIT BULUNDU!");
            else api.lose("TUZAK DOSYA!");
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'castle', s.t);
        s.cards.forEach((c, i) => {
          const ox = Math.sin(s.t * 3.5 + i) * 5;
          // Manila Folder Tab + Body
          drawPixelBox(ctx, c.x - 36 + ox, c.y - 52, 32, 12, '#fcd34d', '#141013', '#d97706');
          drawPixelBox(ctx, c.x - 36 + ox, c.y - 42, 72, 86, '#fff6d3', '#141013', '#e87a1e');
          if (i === s.winIdx) window.GBA_RENDER.drawSprite(ctx, 'heart', c.x + ox, c.y + 4, 3);
          else window.GBA_RENDER.drawSprite(ctx, 'germ', c.x + ox, c.y + 4, 3);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, "KALPLİ DOSYAYA DOKUN!");
      }
    },

    // 24. Stealth Laser Hallway
    {
      id: 24, level: 3,
      title: "LAZERLERDEN GEÇ!",
      sub: "Parmağınla Farida'yı boşluklardan geçirip yıldıza ulaştır!",
      duration: 5800,
      init(s) {
        s.t = 0; s.px = W / 2; s.py = H - 75; s.tx = W / 2; s.ty = H - 75;
      },
      onPointer(type, x, y, s) {
        if (type === 'down' || type === 'move') {
          s.tx = Math.max(36, Math.min(W - 36, x));
          s.ty = Math.max(85, Math.min(H - 65, y));
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const dx = s.tx - s.px, dy = s.ty - s.py;
        const dist = Math.hypot(dx, dy);
        const maxStep = 340 * dt;
        if (dist > 0) {
          const step = Math.min(dist, maxStep);
          s.px += (dx / dist) * step;
          s.py += (dy / dist) * step;
        }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);
        window.GBA_RENDER.drawSprite(ctx, 'star', W / 2, 92, 3);

        const lasers = [
          { y: 175, gapX: W / 2 + Math.sin(s.t * 2.2) * 80 },
          { y: 275, gapX: W / 2 - Math.sin(s.t * 2.0) * 80 }
        ];
        for (const lz of lasers) {
          // Wall laser emitters + glowing red beams
          drawPixelBox(ctx, 2, lz.y - 10, 14, 20, '#94a3b8', '#141013', '#475569');
          drawPixelBox(ctx, W - 16, lz.y - 10, 14, 20, '#94a3b8', '#141013', '#475569');
          ctx.fillStyle = '#e62e2d';
          ctx.fillRect(16, lz.y - 4, Math.max(0, lz.gapX - 52 - 16), 8);
          ctx.fillRect(lz.gapX + 52, lz.y - 4, Math.max(0, W - 16 - (lz.gapX + 52)), 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(16, lz.y - 1, Math.max(0, lz.gapX - 52 - 16), 2);
          ctx.fillRect(lz.gapX + 52, lz.y - 1, Math.max(0, W - 16 - (lz.gapX + 52)), 2);

          if (Math.abs(s.py - lz.y) < 15 && Math.abs(s.px - lz.gapX) > 44) {
            api.lose("LAZERE YAKALANDIN!");
            return;
          }
        }

        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', s.px, s.py, 44, 58);
        if (s.py <= 116) api.win("LAZERLER GEÇİLDİ!");
        window.GBA_RENDER.drawGBABanner(ctx, W, "FARİDA'YI YILDIZA SÜRÜKLE!");
      }
    },

    // 25. Rotating Fingerprint Ring Alignment
    {
      id: 25, level: 3,
      title: "ŞİFREYİ HİZALA!",
      sub: "Halkalara dokunarak tüm blokları ÜSTTE YEŞİL yap!",
      duration: 5800,
      init(s) {
        s.t = 0;
        s.rings = [3, 2, 3];
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const d = Math.hypot(x - W / 2, y - 245);
        const idx = d < 54 ? 0 : d < 94 ? 1 : 2;
        s.rings[idx] = (s.rings[idx] + 1) % 4;
        window.sound.playClick();
        if (s.rings[idx] === 0) api.spawnParticles(W / 2, 245 - [36, 74, 112][idx], '#38c848', 8);
        if (s.rings.every(r => r === 0)) api.win("ŞİFRE ÇÖZÜLDÜ!");
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const cx = W / 2, cy = 245;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);
        drawPixelBox(ctx, cx - 18, cy - 146, 36, 22, '#ffd43b', '#141013', '#e87a1e');

        [36, 74, 112].forEach((rad, idx) => {
          ctx.strokeStyle = s.rings[idx] === 0 ? '#38c848' : '#1e293b';
          ctx.lineWidth = 10;
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
          const a = -Math.PI / 2 + s.rings[idx] * (Math.PI / 2);
          const bx = cx + Math.cos(a) * rad, by = cy + Math.sin(a) * rad;
          drawPixelBox(ctx, bx - 14, by - 14, 28, 28, s.rings[idx] === 0 ? '#38c848' : '#e62e2d', '#141013', '#000');
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, "HALKALARA DOKUN -> ÜSTTE HİZALA!");
      }
    },

    // 26. Patrick Jane Hypnosis Pocket Watch Pendulum
    {
      id: 26, level: 3,
      title: "SARKACI YAKALA!",
      sub: "Altın cep saati ortadaki yeşil kutudayken 2 kez DOKUN!",
      duration: 5400,
      init(s) {
        s.t = 0; s.hits = 0; s.needed = 2;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const ang = Math.sin(s.t * (2.7 + s.hits * 0.5)) * 0.85;
        if (Math.abs(ang) < 0.38) {
          s.hits++;
          window.sound.playWin();
          api.spawnParticles(W / 2, 255, '#ffd43b', 12);
          api.popup(W / 2, 185, "HİPNOZ!", "#a7f070");
          if (s.hits >= s.needed) api.win("HİPNOZ BAŞARILI!");
        } else {
          api.lose("ORTADAKİ YEŞİLDE DOKUN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ang = Math.sin(s.t * (2.7 + s.hits * 0.5)) * 0.85;
        const px = W / 2 + Math.sin(ang) * 155;
        const py = 100 + Math.cos(ang) * 155;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'castle', s.t);
        const inZone = Math.abs(ang) < 0.38;
        drawPixelBox(ctx, W / 2 - 48, 218, 96, 78, inZone ? 'rgba(56,200,72,0.55)' : 'rgba(56,200,72,0.22)', '#38c848', '#1a7a3e');

        // Brass Chain + Golden Pocket Watch
        ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(W / 2, 95); ctx.lineTo(px, py); ctx.stroke();
        ctx.fillStyle = '#141013';
        ctx.beginPath(); ctx.arc(px, py, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd43b';
        ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff6d3';
        ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#141013'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 10); ctx.lineTo(px + 8, py); ctx.stroke();

        window.GBA_RENDER.drawGBABanner(ctx, W, `ORTADA DOKUN! (${s.hits}/${s.needed})`);
      }
    },

    // 27. Searchlight Evader (Angled Spotlight Beams from Sky!)
    {
      id: 27, level: 3,
      title: "IŞIKLARDAN KAÇ!",
      sub: "Parmağınla kaydırarak sarı projektör ışıklarından kaç!",
      duration: 4400,
      init(s) {
        s.t = 0; s.px = W / 2; s.survived = 0;
      },
      onPointer(type, x, y, s) {
        s.px = Math.max(40, Math.min(W - 40, x));
      },
      update(dt, s, _W, _H, api) {
        s.t += dt; s.survived += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);
        const l1 = W / 2 - Math.cos(s.t * 2.2) * 115;
        const l2 = W / 2 + Math.cos(s.t * 2.5) * 115;
        [l1, l2].forEach((lx, idx) => {
          // Angled spotlight cone from roof
          ctx.fillStyle = 'rgba(255, 212, 59, 0.28)';
          ctx.beginPath();
          ctx.moveTo(idx === 0 ? 40 : W - 40, 45);
          ctx.lineTo(lx - 32, 360);
          ctx.lineTo(lx + 32, 360);
          ctx.closePath();
          ctx.fill();

          drawPixelBox(ctx, lx - 30, 342, 60, 24, 'rgba(255,212,59,0.85)', '#e62e2d', '#e87a1e');
          if (s.t > 0.7 && Math.abs(s.px - lx) < 25) {
            api.lose("PROJEKTÖRE YAKALANDIN!");
          }
        });
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', s.px, 325, 48, 64);
        if (s.survived >= 3.0) api.win("GİZLİCE GEÇTİN!");
        window.GBA_RENDER.drawGBABanner(ctx, W, "KAYDIR VE IŞIKLARDAN KAÇ!");
      }
    },

    // 28. Forensic Pipette Dropper (Graduated Lab Test Tube Filling with Green Liquid)
    {
      id: 28, level: 3,
      title: "TÜPLERİ DOLDUR!",
      sub: "Cam tüp tam ortanın altındayken 2 kez DOKUN!",
      duration: 5600,
      init(s) {
        s.t = 0; s.drops = []; s.hits = 0;
      },
      onPointer(type, x, y, s) {
        if (type === 'down') {
          s.drops.push({ x: W / 2, y: 125 });
          window.sound.playPop();
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const tx = W / 2 + Math.sin(s.t * 2.4) * 100;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);

        // Lab Pipette at top
        drawPixelBox(ctx, W / 2 - 14, 64, 28, 32, '#e62e2d', '#141013', '#9e1919');
        drawPixelBox(ctx, W / 2 - 7, 96, 14, 28, '#e2e8f0', '#141013', '#94a3b8');

        // Moving Glass Beaker / Tube + Green Liquid Level
        drawPixelBox(ctx, tx - 44, 315, 88, 72, '#e0f2fe', '#141013', '#7dd3fc');
        if (s.hits > 0) {
          ctx.fillStyle = '#38c848';
          ctx.fillRect(tx - 39, 382 - s.hits * 30, 78, s.hits * 30);
        }

        for (const d of s.drops) {
          d.y += 550 * dt;
          drawPixelBox(ctx, d.x - 8, d.y - 10, 16, 20, '#38c848', '#141013', '#1a7a3e');
          if (d.y >= 320) {
            if (Math.abs(d.x - tx) < 48) {
              d.done = true;
              s.hits++;
              window.sound.playWin();
              api.spawnParticles(tx, 320, '#38c848', 12);
              api.popup(tx, 290, `${s.hits}/2 DOLDU!`, '#a7f070');
              if (s.hits >= 2) { api.win("ANALİZ TAMAMLANDI!"); return; }
            } else {
              api.lose("DAMLA DIŞARI DÜŞTÜ!");
              return;
            }
          }
        }
        s.drops = s.drops.filter(d => !d.done);
        window.GBA_RENDER.drawGBABanner(ctx, W, `TÜP ORTADAYKEN DOKUN! (${s.hits}/2)`);
      }
    },

    // 29. Bomb Defusal Wire Cut
    {
      id: 29, level: 3,
      title: "DOĞRU KABLOYU KES!",
      sub: "Üstte yazan renkteki kabloya DOKUN!",
      duration: 5200,
      init(s) {
        s.t = 0;
        s.opts = [
          { name: 'MAVİ KABLOYU KES!', label: 'MAVİ', col: '#29adff' },
          { name: 'YEŞİL KABLOYU KES!', label: 'YEŞİL', col: '#38c848' },
          { name: 'SARI KABLOYU KES!', label: 'SARI', col: '#ffd43b' },
          { name: 'KIRMIZI KABLOYU KES!', label: 'KIRMIZI', col: '#e62e2d' }
        ];
        s.target = Math.floor(Math.random() * 4);
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        for (let i = 0; i < 4; i++) {
          const wy = 165 + i * 62;
          if (Math.abs(y - wy) < 28) {
            if (i === s.target) {
              api.spawnParticles(x, wy, '#ffd43b', 16);
              api.win("BOMBA İMHA EDİLDİ!");
            } else {
              api.lose("YANLIŞ KABLO! GÜM!");
            }
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'castle', s.t);
        drawPixelBox(ctx, 24, 118, W - 48, 285, '#334155', '#141013', '#1e293b');
        s.opts.forEach((o, i) => {
          const wy = 165 + i * 62;
          drawPixelBox(ctx, 42, wy - 18, W - 84, 36, o.col, '#141013', '#000');
          ctx.fillStyle = '#141013';
          ctx.font = '900 13px "Press Start 2P", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(o.label, W / 2, wy + 2);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, s.opts[s.target].name);
      }
    },

    // 30. WORLD 3 BOSS: Bullet-Hell Interrogation Box
    {
      id: 30, level: 3,
      title: "BOSS: MERMİLERDEN KAÇ!",
      sub: "Kalbi sürükle: Bombalardan kaç, 3 altını topla!",
      duration: 6000,
      init(s) {
        s.t = 0; s.px = W / 2; s.py = 260; s.got = 0;
        s.coins = [{ x: 95, y: 175, c: false }, { x: 265, y: 175, c: false }, { x: 180, y: 345, c: false }];
        s.bullets = [
          { x: 65, y: 130, vx: 132, vy: 112 },
          { x: 295, y: 370, vx: -132, vy: -112 }
        ];
      },
      onPointer(type, x, y, s) {
        s.px = Math.max(55, Math.min(W - 55, x));
        s.py = Math.max(125, Math.min(385, y));
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);
        drawPixelBox(ctx, 40, 110, W - 80, 290, '#141013', '#ffffff', '#000');

        for (const b of s.bullets) {
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.x < 55) { b.x = 55; b.vx = Math.abs(b.vx); }
          if (b.x > W - 55) { b.x = W - 55; b.vx = -Math.abs(b.vx); }
          if (b.y < 125) { b.y = 125; b.vy = Math.abs(b.vy); }
          if (b.y > 385) { b.y = 385; b.vy = -Math.abs(b.vy); }
          window.GBA_RENDER.drawBomb(ctx, b.x, b.y, 2, s.t);
          if (s.t > 0.75 && Math.hypot(s.px - b.x, s.py - b.y) < 17) {
            api.lose("BOMBAYA ÇARPTIN!");
            return;
          }
        }
        s.coins.forEach(c => {
          if (c.c) return;
          window.GBA_RENDER.drawSprite(ctx, 'coin', c.x, c.y, 3);
          if (Math.hypot(s.px - c.x, s.py - c.y) < 34) {
            c.c = true; s.got++; window.sound.playPop();
            api.spawnParticles(c.x, c.y, '#ffd43b', 10);
            api.popup(c.x, c.y - 20, `${s.got}/3!`, '#ffd43b');
            if (s.got >= 3) api.win("WORLD 3 BOSS GEÇİLDİ! ★");
          }
        });
        window.GBA_RENDER.drawSprite(ctx, 'heart', s.px, s.py, 3);
        window.GBA_RENDER.drawGBABanner(ctx, W, `BOMBADAN KAÇ, ALTIN TOPLA (${s.got}/3)`);
      }
    }
  ];
})();
