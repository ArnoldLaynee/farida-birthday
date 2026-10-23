// 50 Ultra-Polished GBA Microgames — PART 2 (Worlds 4–5: Games 31–50)
// Rich 16-bit pixel art sprites, custom stage props, particles, floating popups, and fair arcade physics!

(function () {
  const W = 360;
  const H = 480;
  const drawPixelBox = window.drawPixelBoxGBA;

  const part2 = [
    // =======================================================================
    // WORLD 4: KARPUZ VADİSİ & MADENLER (GAMES 31 - 40)
    // =======================================================================

    // 31. Watermelon Ninja Slicer (Swipe Trail + Sparking Bombs + Juice Bursts)
    {
      id: 31, level: 4,
      title: "KARPUZLARI KES!",
      sub: "Parmağını kaydırarak 4 karpuzu kes! Bombaya değme!",
      duration: 5800,
      init(s) {
        s.t = 0; s.sliced = 0; s.needed = 4;
        s.trail = [];
        s.items = [
          { x: 65, y: 390, vx: 25, vy: -395, bomb: false, cut: false },
          { x: 180, y: 410, vx: -15, vy: -410, bomb: true, cut: false },
          { x: 295, y: 400, vx: -30, vy: -400, bomb: false, cut: false },
          { x: 95, y: 445, vx: 35, vy: -425, bomb: false, cut: false },
          { x: 255, y: 455, vx: -35, vy: -420, bomb: true, cut: false },
          { x: 150, y: 470, vx: 20, vy: -435, bomb: false, cut: false },
          { x: 220, y: 480, vx: -20, vy: -440, bomb: false, cut: false }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' && type !== 'move') return;
        s.trail.push({ x, y, life: 0.18 });
        for (const f of s.items) {
          if (f.cut) continue;
          const hitR = f.bomb ? 24 : 44;
          if (Math.hypot(x - f.x, y - f.y) < hitR) {
            f.cut = true;
            if (f.bomb) {
              api.lose("BOMBAYI KESTİN!");
              return;
            }
            s.sliced++;
            window.sound.playSlice();
            api.spawnParticles(f.x, f.y, '#e62e2d', 12);
            api.spawnParticles(f.x, f.y, '#38c848', 6);
            api.popup(f.x, f.y - 20, "ŞLAK!", "#ffd43b");
            if (s.sliced >= s.needed) { api.win("KARPUZ USTASI! ★"); return; }
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        s.items.forEach(f => {
          if (f.cut) return;
          f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 405 * dt;
          if (f.y > H - 55 && f.vy > 0) f.vy = -395;
          if (f.bomb) {
            window.GBA_RENDER.drawBomb(ctx, f.x, f.y, 3, s.t);
          } else {
            window.GBA_RENDER.drawSprite(ctx, 'watermelon', f.x, f.y, 4, s.t * 3);
          }
        });

        // Blade swipe trail
        if (s.trail.length > 1) {
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5;
          ctx.beginPath();
          s.trail.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
        }
        s.trail.forEach(pt => { pt.life -= dt; });
        s.trail = s.trail.filter(pt => pt.life > 0);

        window.GBA_RENDER.drawGBABanner(ctx, W, `KARPUZ KES (${s.sliced}/${s.needed}) - BOMBADAN KAÇ!`);
      }
    },

    // 32. Trampoline Bounce
    {
      id: 32, level: 4,
      title: "KARPUZU DÜŞÜRME!",
      sub: "Trambolini kaydır ve karpuzu Farida'ya sektir!",
      duration: 5600,
      init(s) {
        s.t = 0; s.padX = 145; s.wx = 55; s.wy = 120; s.vx = 112; s.vy = 0; s.bounceAnim = 0;
      },
      onPointer(type, x, y, s) {
        s.padX = Math.max(54, Math.min(W - 54, x));
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        if (s.bounceAnim > 0) s.bounceAnim = Math.max(0, s.bounceAnim - dt * 40);
        s.wx += s.vx * dt; s.wy += s.vy * dt; s.vy += 570 * dt;
        if (s.vy > 0 && s.wy > H - 118 && s.wy < H - 65 && Math.abs(s.wx - s.padX) < 58) {
          s.vy = -445;
          s.bounceAnim = 8;
          window.sound.playPop();
          api.spawnParticles(s.wx, H - 96, '#ffd43b', 10);
          api.popup(s.wx, H - 125, "BOİNG!", "#a7f070");
        }
        if (s.wy > H - 38) {
          api.lose("KARPUZ YERE DÜŞTÜ!");
          return;
        }
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        // Elevated wooden platforms for Efe & Farida
        drawPixelBox(ctx, 8, 182, 68, 16, '#8f563b', '#141013', '#592812');
        drawPixelBox(ctx, W - 76, 182, 68, 16, '#8f563b', '#141013', '#592812');
        window.GBA_RENDER.drawCharacter(ctx, 'efe', 40, 148, 46, 66);
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', W - 44, 148, 48, 66, true);
        window.GBA_RENDER.drawSprite(ctx, 'watermelon', s.wx, s.wy, 4, s.t * 4);

        // Spring-loaded Trampoline
        const py = H - 96 + s.bounceAnim;
        drawPixelBox(ctx, s.padX - 42, H - 78, 12, 22, '#94a3b8', '#141013', '#475569');
        drawPixelBox(ctx, s.padX + 30, H - 78, 12, 22, '#94a3b8', '#141013', '#475569');
        drawPixelBox(ctx, s.padX - 54, py, 108, 20, '#ffd43b', '#141013', '#e87a1e');
        ctx.fillStyle = '#e62e2d';
        ctx.fillRect(s.padX - 24, py + 4, 48, 8);

        if (s.wx >= W - 75 && s.wy < 245) api.win("HARİKA SERVİS! ★");
        window.GBA_RENDER.drawGBABanner(ctx, W, "TRAMBOLİNİ KAYDIR VE SEKTİR!");
      }
    },

    // 33. Stardew Legend Fish (Real Pixel Fish Sprite + Water Bubbles)
    {
      id: 33, level: 4,
      title: "EFSANEVİ BALIK!",
      sub: "Basılı tut / bırak -> Yeşil barı balığın üstünde tut!",
      duration: 5800,
      init(s) {
        s.t = 0; s.barY = 240; s.fishY = 240; s.hold = false; s.prog = 48;
      },
      onPointer(type, x, y, s) {
        if (type === 'down') s.hold = true;
        if (type === 'up') s.hold = false;
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.fishY = 240 + Math.sin(s.t * 2.4) * 75 + Math.cos(s.t * 3.9) * 18;
        s.barY += (s.hold ? -235 : 210) * dt;
        s.barY = Math.max(125, Math.min(355, s.barY));

        const onFish = Math.abs(s.barY - s.fishY) < 54;
        s.prog += (onFish ? 52 : -18) * dt;
        if (s.prog <= 0) { api.lose("BALIK KAÇTI!"); return; }
        if (s.prog >= 100) { api.win("EFSANEVİ BALIK TUTULDU! ★"); return; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        // Wooden Fishing Gauge Frame + Water Column
        drawPixelBox(ctx, W / 2 - 52, 78, 138, 328, '#8f563b', '#141013', '#592812');
        drawPixelBox(ctx, W / 2 - 42, 86, 84, 312, '#1d57a5', '#141013', '#29adff');

        // Catch Bar + Pixel Golden Fish
        drawPixelBox(ctx, W / 2 - 34, s.barY - 46, 68, 92, onFish ? 'rgba(56,200,72,0.85)' : 'rgba(230,46,45,0.65)', '#141013', '#1a7a3e');
        window.GBA_RENDER.drawSprite(ctx, 'fish', W / 2, s.fishY, 3);

        // Progress Meter
        drawPixelBox(ctx, W / 2 + 52, 86, 22, 312, '#1e293b', '#141013', '#000');
        const ph = (302 * s.prog) / 100;
        ctx.fillStyle = s.prog > 70 ? '#38c848' : '#ffd43b';
        ctx.fillRect(W / 2 + 56, 394 - ph, 14, ph);

        window.GBA_RENDER.drawGBABanner(ctx, W, "BASILI TUT / BIRAK -> BALIĞI TUT!");
      }
    },

    // 34. Whack-a-Pest with Watermelon Decoys
    {
      id: 34, level: 4,
      title: "ZARARLILARI VUR!",
      sub: "4 mor mikrobu vur! Karpuza dokunma!",
      duration: 5600,
      init(s) {
        s.t = 0; s.hits = 0; s.needed = 4; s.active = 0; s.decoy = 2; s.timer = 0; s.cooldown = 0;
        s.holes = [
          { x: 80, y: 175 }, { x: 180, y: 175 }, { x: 280, y: 175 },
          { x: 80, y: 305 }, { x: 180, y: 305 }, { x: 280, y: 305 }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' || s.cooldown > 0) return;
        const aHole = s.holes[s.active];
        if (Math.hypot(x - aHole.x, y - aHole.y) < 50) {
          s.hits++;
          s.active = (s.active + 1 + Math.floor(Math.random() * 4)) % 6;
          s.decoy = (s.active + 2) % 6;
          s.timer = 0;
          s.cooldown = 0.18;
          window.sound.playPop();
          api.spawnParticles(aHole.x, aHole.y, '#a855f7', 10);
          api.popup(aHole.x, aHole.y - 25, "PAT!", "#a7f070");
          if (s.hits >= s.needed) api.win("BAHÇE TEMİZLENDİ!");
          return;
        }
        const dHole = s.holes[s.decoy];
        if (s.timer > 0.18 && Math.hypot(x - dHole.x, y - dHole.y) < 38) {
          api.lose("KARPUZU EZDİN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt; s.timer += dt;
        if (s.cooldown > 0) s.cooldown = Math.max(0, s.cooldown - dt);
        if (s.timer > 0.95) {
          s.timer = 0;
          s.active = (s.active + 1) % 6;
          s.decoy = (s.active + 3) % 6;
        }
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);
        s.holes.forEach((h, i) => {
          drawPixelBox(ctx, h.x - 38, h.y - 16, 76, 36, '#592812', '#141013', '#141013');
          if (i === s.active) window.GBA_RENDER.drawSprite(ctx, 'germ', h.x, h.y - 12, 3);
          else if (i === s.decoy) window.GBA_RENDER.drawSprite(ctx, 'watermelon', h.x, h.y - 10, 3);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, `MİKROBU VUR (${s.hits}/${s.needed}) - KARPUZA BASMA!`);
      }
    },

    // 35. Minecart Gap & Spike Jumper (Farida Riding Inside Wheeled Minecart + Coin Arcs!)
    {
      id: 35, level: 4,
      title: "MADEN ARABASI!",
      sub: "Dokunarak 3 engelin üzerinden vagonla zıpla!",
      duration: 6000,
      init(s) {
        s.t = 0; s.gy = 325; s.y = 325; s.vy = 0; s.jumps = 0; s.passed = 0;
        s.spikes = [
          { x: W + 35, p: false },
          { x: W + 215, p: false },
          { x: W + 395, p: false }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type === 'down' && s.jumps < 2) {
          s.vy = -575;
          s.jumps++;
          window.sound.playPop();
          api.spawnParticles(75, s.y + 24, '#ffd43b', 6);
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.y += s.vy * dt; s.vy += 1140 * dt;
        if (s.y >= s.gy) { s.y = s.gy; s.vy = 0; s.jumps = 0; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);

        // Wooden Rail Ties + Steel Track
        const tieOff = (s.t * 200) % 28;
        ctx.fillStyle = '#8f563b';
        for (let rx = -28; rx < W + 28; rx += 28) {
          ctx.fillRect(rx - tieOff, s.gy + 32, 12, 10);
        }
        drawPixelBox(ctx, 0, s.gy + 26, W, 8, '#cbd5e1', '#141013', '#64748b');

        for (const sp of s.spikes) {
          sp.x -= 200 * dt;
          window.GBA_RENDER.drawBomb(ctx, sp.x, s.gy + 6, 3, s.t);
          if (Math.abs(sp.x - 75) < 18 && s.y > s.gy - 18) {
            api.lose("VAGON BOMBAYA ÇARPTI!");
            return;
          }
          if (!sp.p && sp.x < 52) {
            sp.p = true; s.passed++;
            window.sound.playWin();
            api.popup(75, s.y - 45, `${s.passed}/3!`, '#ffd43b');
            if (s.passed >= 3) { api.win("MADENDEN ÇIKILDI! ★"); return; }
          }
        }

        // Farida riding inside Steel & Gold Minecart
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', 75, s.y - 24, 42, 56);
        drawPixelBox(ctx, 46, s.y - 12, 58, 34, '#ffd43b', '#141013', '#e87a1e');
        ctx.fillStyle = '#141013';
        ctx.beginPath(); ctx.arc(58, s.y + 24, 9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(92, s.y + 24, 9, 0, Math.PI * 2); ctx.fill();

        window.GBA_RENDER.drawGBABanner(ctx, W, `DOKUN VE ZIPLA! (${s.passed}/3)`);
      }
    },

    // 36. Number Order Tap (1 -> 5)
    {
      id: 36, level: 4,
      title: "SIRAYLA DOKUN: 1-5!",
      sub: "1'den 5'e kadar sırayla dokun! Yeşil kutuyu takip et!",
      duration: 5600,
      init(s) {
        s.t = 0; s.next = 1;
        const pts = [
          { x: 75, y: 155 }, { x: 275, y: 155 }, { x: 180, y: 245 },
          { x: 85, y: 340 }, { x: 270, y: 340 }
        ].sort(() => Math.random() - 0.5);
        s.nodes = pts.map((p, i) => ({ n: i + 1, x: p.x, y: p.y, done: false }));
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        for (const nd of s.nodes) {
          if (nd.done) continue;
          if (Math.hypot(x - nd.x, y - nd.y) < 46) {
            if (nd.n === s.next) {
              nd.done = true; s.next++; window.sound.playPop();
              api.spawnParticles(nd.x, nd.y, '#38c848', 10);
              api.popup(nd.x, nd.y - 24, `${nd.n}!`, '#a7f070');
              if (s.next > 5) api.win("SÜPER REFLEKS!");
            } else {
              api.lose("SIRAYI ŞAŞIRDIN!");
            }
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);
        s.nodes.forEach(nd => {
          if (nd.done) return;
          const isNext = nd.n === s.next;
          const bounce = isNext ? Math.sin(s.t * 10) * 4 : 0;
          drawPixelBox(ctx, nd.x - 34, nd.y - 34 + bounce, 68, 68, isNext ? '#38c848' : '#ffd43b', '#141013', isNext ? '#1a7a3e' : '#e87a1e');
          ctx.fillStyle = isNext ? '#ffffff' : '#141013';
          ctx.font = '900 22px "Press Start 2P", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(nd.n), nd.x, nd.y + 2 + bounce);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, `SIRADAKİ SAYI: ${Math.min(5, s.next)}`);
      }
    },

    // 37. Crow Dive-Bomb Defense
    {
      id: 37, level: 4,
      title: "KARPUZU KORU!",
      sub: "İnen 5 zararlıya dokunarak vur! Karpuza ulaşmasınlar!",
      duration: 5600,
      init(s) {
        s.t = 0;
        s.crows = [0, 1, 2, 3, 4].map(i => ({
          x: 52 + (i * 64),
          y: 75 - i * 30,
          vy: 60 + i * 5,
          alive: true
        }));
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' && type !== 'move') return;
        s.crows.forEach(c => {
          if (c.alive && Math.hypot(x - c.x, y - c.y) < 48) {
            c.alive = false;
            window.sound.playSlice();
            api.spawnParticles(c.x, c.y, '#a855f7', 10);
            api.popup(c.x, c.y - 16, "VURULDU!", "#ffd43b");
          }
        });
        if (s.crows.every(c => !c.alive)) api.win("KARPUZLAR GÜVENDE!");
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'sunset', s.t);
        // Wooden Garden Fence protecting the giant watermelon
        for (let fx = 30; fx < W - 20; fx += 36) {
          drawPixelBox(ctx, fx, H - 92, 14, 36, '#fff6d3', '#141013', '#cbd5e1');
        }
        window.GBA_RENDER.drawSprite(ctx, 'watermelon', W / 2, H - 82, 5);

        for (const c of s.crows) {
          if (!c.alive) continue;
          c.y += c.vy * dt;
          window.GBA_RENDER.drawSprite(ctx, 'germ', c.x, c.y, 3);
          if (c.y >= H - 95) {
            api.lose("KARPUZ YENDİ!");
            return;
          }
        }
        window.GBA_RENDER.drawGBABanner(ctx, W, "DOKUN VE ZARARLILARI VUR!");
      }
    },

    // 38. Blacksmith Geode Anvil Strike (Reveals Sparkling Pixel Diamond!)
    {
      id: 38, level: 4,
      title: "JEODU KIR!",
      sub: "İbre ortadaki yeşil bölgedeyken 2 kez DOKUN!",
      duration: 5400,
      init(s) {
        s.t = 0; s.pos = 0.1; s.dir = 1; s.hits = 0;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        if (Math.abs(s.pos - 0.5) <= 0.21) {
          s.hits++;
          s.dir *= -1.15;
          window.sound.playWin();
          api.spawnParticles(W / 2, 235, '#29adff', 14);
          api.popup(W / 2, 165, s.hits === 1 ? "ÇATLADI!" : "ELMAS!", "#9cd8fc");
          if (s.hits >= 2) api.win("PARLAYAN ELMAS ÇIKTI! ★");
        } else {
          api.lose("YEŞİLDE VURMALISIN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.pos += s.dir * 1.42 * dt;
        if (s.pos >= 1) { s.pos = 1; s.dir = -1; }
        if (s.pos <= 0) { s.pos = 0; s.dir = 1; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);

        // Iron Anvil + Geode / Diamond
        drawPixelBox(ctx, W / 2 - 58, 268, 116, 36, '#475569', '#141013', '#1e293b');
        if (s.hits >= 2) {
          window.GBA_RENDER.drawSprite(ctx, 'diamond', W / 2, 225, 5);
        } else {
          window.GBA_RENDER.drawSprite(ctx, 'qblock', W / 2 + (s.hits ? Math.sin(s.t * 30) * 3 : 0), 228, 5);
        }

        const bx = 40, by = 365, bw = W - 80, bh = 30;
        drawPixelBox(ctx, bx, by, bw, bh, '#1e293b', '#141013', '#000');
        ctx.fillStyle = '#38c848';
        ctx.fillRect(W / 2 - bw * 0.21, by + 3, bw * 0.42, bh - 9);
        drawPixelBox(ctx, bx + s.pos * bw - 6, by - 6, 12, bh + 12, '#ffd43b', '#141013', '#e87a1e');
        window.GBA_RENDER.drawGBABanner(ctx, W, `YEŞİLDE VUR! (${s.hits}/2)`);
      }
    },

    // 39. Electric Fence Gap Dash
    {
      id: 39, level: 4,
      title: "BOŞLUKLARDAN GEÇ!",
      sub: "Sağa/sola kaydırarak 3 bariyerin yeşil boşluğundan geç!",
      duration: 5600,
      init(s) {
        s.t = 0; s.px = W / 2; s.passed = 0;
        s.walls = [
          { y: 50, gapX: 95, p: false },
          { y: -95, gapX: 260, p: false },
          { y: -240, gapX: 175, p: false }
        ];
      },
      onPointer(type, x, y, s) {
        s.px = Math.max(36, Math.min(W - 36, x));
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);

        for (const w of s.walls) {
          w.y += 190 * dt;
          drawPixelBox(ctx, 0, w.y - 12, Math.max(0, w.gapX - 52), 24, '#e62e2d', '#141013', '#9e1919');
          drawPixelBox(ctx, w.gapX + 52, w.y - 12, Math.max(0, W - (w.gapX + 52)), 24, '#e62e2d', '#141013', '#9e1919');
          // Green guide zone inside the gap
          ctx.fillStyle = 'rgba(56, 200, 72, 0.32)';
          ctx.fillRect(w.gapX - 46, w.y - 10, 92, 20);

          if (Math.abs(w.y - 365) < 18 && Math.abs(s.px - w.gapX) > 44) {
            api.lose("BARİYERE ÇARPTIN!");
            return;
          }
          if (!w.p && w.y > 395) {
            w.p = true; s.passed++;
            window.sound.playPop();
            api.popup(s.px, 320, `${s.passed}/3!`, '#a7f070');
            if (s.passed >= 3) { api.win("BARİYERLER AŞILDI!"); return; }
          }
        }
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', s.px, 365, 46, 62);
        window.GBA_RENDER.drawGBABanner(ctx, W, `YEŞİL BOŞLUKTAN GEÇ! (${s.passed}/3)`);
      }
    },

    // 40. WORLD 4 BOSS: Mine Floor 100 Slime Survival
    {
      id: 40, level: 4,
      title: "BOSS: MADEN KATI 100!",
      sub: "Parmağınla Farida'yı yönlendir, 4 karpuzu topla!",
      duration: 6000,
      init(s) {
        s.t = 0; s.px = W / 2; s.py = 250; s.got = 0;
        s.melons = [
          { x: 75, y: 145, g: false }, { x: 285, y: 145, g: false },
          { x: 75, y: 365, g: false }, { x: 285, y: 365, g: false }
        ];
        s.slimes = [
          { x: 180, y: 115, vx: 132, vy: 112 },
          { x: 180, y: 380, vx: -132, vy: -112 }
        ];
      },
      onPointer(type, x, y, s) {
        s.px = Math.max(40, Math.min(W - 40, x));
        s.py = Math.max(95, Math.min(395, y));
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'underground', s.t);
        window.GBA_RENDER.drawSprite(ctx, 'diamond', 32, 95, 2);
        window.GBA_RENDER.drawSprite(ctx, 'diamond', W - 32, 95, 2);

        for (const sl of s.slimes) {
          sl.x += sl.vx * dt; sl.y += sl.vy * dt;
          if (sl.x < 45) { sl.x = 45; sl.vx = Math.abs(sl.vx); }
          if (sl.x > W - 45) { sl.x = W - 45; sl.vx = -Math.abs(sl.vx); }
          if (sl.y < 100) { sl.y = 100; sl.vy = Math.abs(sl.vy); }
          if (sl.y > 390) { sl.y = 390; sl.vy = -Math.abs(sl.vy); }
          window.GBA_RENDER.drawSprite(ctx, 'germ', sl.x, sl.y, 3);
          if (s.t > 0.75 && Math.hypot(s.px - sl.x, s.py - sl.y) < 20) {
            api.lose("CANAVARA YAKALANDIN!");
            return;
          }
        }
        s.melons.forEach(m => {
          if (m.g) return;
          window.GBA_RENDER.drawSprite(ctx, 'watermelon', m.x, m.y, 3);
          if (Math.hypot(s.px - m.x, s.py - m.y) < 40) {
            m.g = true; s.got++; window.sound.playPop();
            api.spawnParticles(m.x, m.y, '#38c848', 10);
            api.popup(m.x, m.y - 20, `${s.got}/4!`, '#a7f070');
            if (s.got >= 4) api.win("WORLD 4 BOSS GEÇİLDİ! ★");
          }
        });
        window.GBA_RENDER.drawCharacter(ctx, 'farida_dentist', s.px, s.py, 44, 58);
        window.GBA_RENDER.drawGBABanner(ctx, W, `KARPUZLARI TOPLA (${s.got}/4)`);
      }
    },

    // =======================================================================
    // WORLD 5: PASTA KALESİ FİNALİ (GAMES 41 - 50)
    // =======================================================================

    // 41. Precision Tea Pour (Teapot Spout + Pouring Tea Stream + Saucer)
    {
      id: 41, level: 5,
      title: "TAM ÇİZGİDE BIRAK!",
      sub: "Basılı tutarak çayı yeşil banda doldur ve ELİNİ ÇEK!",
      duration: 5600,
      init(s) {
        s.t = 0; s.pouring = false; s.fill = 12;
      },
      onPointer(type, x, y, s, api) {
        if (type === 'down') s.pouring = true;
        if (type === 'up' && s.pouring) {
          s.pouring = false;
          if (s.fill >= 62 && s.fill <= 94) api.win("TAVŞAN KANI ÇAY HAZIR! ★");
          else api.lose("YEŞİL BANTTA BIRAKMALISIN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        if (s.pouring) {
          s.fill += 45 * dt;
          if (s.fill > 97) { api.lose("ÇAY TAŞTI!"); return; }
        }
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'sunset', s.t);

        // Crimson Teapot at Top + Pouring Stream
        drawPixelBox(ctx, W / 2 - 42, 72, 84, 52, '#e62e2d', '#141013', '#9e1919');
        if (s.pouring) {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(W / 2 - 5, 124, 10, 240);
        }

        const bx = W / 2 - 64, by = 210, bw = 128, bh = 160;
        // Saucer plate
        drawPixelBox(ctx, bx - 22, by + bh, bw + 44, 14, '#e62e2d', '#141013', '#9e1919');
        drawPixelBox(ctx, bx, by, bw, bh, '#fff6d3', '#141013', '#29adff');
        const fh = (bh * s.fill) / 100;
        ctx.fillStyle = '#b45309';
        ctx.fillRect(bx + 5, by + bh - fh, bw - 10, fh);

        // Target green band
        ctx.fillStyle = 'rgba(56, 200, 72, 0.58)';
        ctx.fillRect(bx - 12, by + bh * 0.06, bw + 24, bh * 0.32);
        window.GBA_RENDER.drawGBABanner(ctx, W, "YEŞİL BANDA GELİNCE ELİNİ ÇEK!");
      }
    },

    // 42. Cake Tower Stacker (Frosting Drips + Strawberries)
    {
      id: 42, level: 5,
      title: "PASTAYI TAM OTURT!",
      sub: "3 katı alt katın üstüne denk getirerek DOKUN!",
      duration: 5800,
      init(s) {
        s.t = 0;
        s.layers = [{ x: W / 2, w: 140, y: 355 }];
        s.currX = 65; s.dir = 1;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const prev = s.layers[s.layers.length - 1];
        if (Math.abs(s.currX - prev.x) > 58) {
          api.lose("PASTA DEVRİLDİ!");
          return;
        }
        const count = s.layers.length;
        s.layers.push({ x: s.currX, w: 140 - count * 20, y: 355 - count * 42 });
        window.sound.playPop();
        api.spawnParticles(s.currX, 355 - count * 42, '#f472b6', 12);
        api.popup(s.currX, 330 - count * 42, `${count}/3 KAT!`, '#ffd43b');
        if (s.layers.length >= 4) api.win("4 KATLI PASTA HAZIR! ★");
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.currX += s.dir * 200 * dt;
        if (s.currX >= W - 55) { s.currX = W - 55; s.dir = -1; }
        if (s.currX <= 55) { s.currX = 55; s.dir = 1; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);
        // Cake Stand
        drawPixelBox(ctx, W / 2 - 86, 393, 172, 14, '#ffffff', '#141013', '#cbd5e1');

        s.layers.forEach((l, i) => {
          drawPixelBox(ctx, l.x - l.w / 2, l.y, l.w, 38, i % 2 === 0 ? '#f472b6' : '#fff6d3', '#141013', '#db2777');
          // White cream icing top + red berry dots
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(l.x - l.w / 2 + 3, l.y + 2, l.w - 8, 8);
          ctx.fillStyle = '#e62e2d';
          ctx.fillRect(l.x - 4, l.y - 6, 8, 8);
        });
        if (s.layers.length < 4) {
          const c = s.layers.length;
          const w = 140 - c * 20;
          const ly = 355 - c * 42 - 30;
          drawPixelBox(ctx, s.currX - w / 2, ly, w, 38, '#ffd43b', '#141013', '#e87a1e');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(s.currX - w / 2 + 3, ly + 2, w - 8, 8);
        }
        window.GBA_RENDER.drawGBABanner(ctx, W, `ORTALAYIP DOKUN! (${s.layers.length - 1}/3)`);
      }
    },

    // 43. Glossy Party Balloons vs. Trap Balloons
    {
      id: 43, level: 5,
      title: "RENKLİ BALONLAR!",
      sub: "4 pembe balonu patlat! Siyah X balonlara DOKUNMA!",
      duration: 5400,
      init(s) {
        s.t = 0; s.poppedCount = 0; s.needed = 4;
        s.balloons = Array.from({ length: 7 }, (_, i) => ({
          x: 65 + (i % 4) * 76,
          y: i < 4 ? 185 : 305,
          vx: (i % 2 === 0 ? 1 : -1) * 62,
          vy: (i % 3 === 0 ? 1 : -1) * 52,
          bad: i >= 5,
          popped: false
        }));
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        for (const b of s.balloons) {
          if (b.popped) continue;
          const hitR = b.bad ? 24 : 42;
          if (Math.hypot(x - b.x, y - b.y) < hitR) {
            b.popped = true;
            if (b.bad) { api.lose("TUZAK BALON PATLADI!"); return; }
            s.poppedCount++;
            window.sound.playPop();
            api.spawnParticles(b.x, b.y, '#f472b6', 12);
            api.popup(b.x, b.y - 22, "PAT!", "#ffd43b");
            if (s.poppedCount >= s.needed) {
              api.win("BALONLAR PATLATILDI!");
              return;
            }
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);
        s.balloons.forEach(b => {
          if (b.popped) return;
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.x < 45) { b.x = 45; b.vx = Math.abs(b.vx); }
          if (b.x > W - 45) { b.x = W - 45; b.vx = -Math.abs(b.vx); }
          if (b.y < 110) { b.y = 110; b.vy = Math.abs(b.vy); }
          if (b.y > 375) { b.y = 375; b.vy = -Math.abs(b.vy); }
          window.GBA_RENDER.drawBalloon(ctx, b.x, b.y, b.bad, s.t);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, `PEMBELERİ PATLAT (${s.poppedCount}/${s.needed})!`);
      }
    },

    // 44. Exact 50/50 Watermelon Center Cut
    {
      id: 44, level: 5,
      title: "TAM ORTADAN KES!",
      sub: "Şef bıçağı yeşil merkez bölgesindeyken DOKUN!",
      duration: 5400,
      init(s) {
        s.t = 0; s.kx = 60; s.dir = 1;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        if (Math.abs(s.kx - W / 2) <= 46) {
          window.sound.playSlice();
          api.spawnParticles(W / 2, 260, '#e62e2d', 18);
          api.win("%50 - %50 KUSURSUZ KESİM! ★");
        } else {
          api.lose("YEŞİL MERKEZİ KAÇIRDIN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        s.kx += s.dir * 220 * dt;
        if (s.kx >= W - 50) { s.kx = W - 50; s.dir = -1; }
        if (s.kx <= 50) { s.kx = 50; s.dir = 1; }

        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);
        // Wooden Kitchen Cutting Board
        drawPixelBox(ctx, 48, 185, W - 96, 165, '#fcd34d', '#141013', '#d97706');
        window.GBA_RENDER.drawSprite(ctx, 'watermelon', W / 2, 265, 8);

        ctx.fillStyle = 'rgba(56, 200, 72, 0.45)';
        ctx.fillRect(W / 2 - 42, 145, 84, 230);
        ctx.fillStyle = '#38c848';
        ctx.fillRect(W / 2 - 4, 145, 8, 230);

        // Silver Chef Knife + Handle
        drawPixelBox(ctx, s.kx - 10, 95, 20, 44, '#141013', '#141013', '#000');
        drawPixelBox(ctx, s.kx - 7, 138, 14, 235, '#e2e8f0', '#141013', '#94a3b8');
        window.GBA_RENDER.drawGBABanner(ctx, W, "YEŞİL BÖLGEDE DOKUN!");
      }
    },

    // 45. 4-Corner Present Ribbon Tie
    {
      id: 45, level: 5,
      title: "PAKETİ BAĞLA!",
      sub: "YEŞİL parlayan köşeye sırayla 4 kez dokun!",
      duration: 5400,
      init(s) {
        s.t = 0; s.step = 0;
        s.corners = [
          { x: 95, y: 175 }, { x: 265, y: 175 },
          { x: 265, y: 335 }, { x: 95, y: 335 }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const target = s.corners[s.step];
        if (target && Math.hypot(x - target.x, y - target.y) < 52) {
          s.step++;
          window.sound.playPop();
          api.spawnParticles(target.x, target.y, '#ffd43b', 10);
          api.popup(target.x, target.y - 25, "BAĞLANDI!", "#ffd43b");
          if (s.step >= 4) api.win("HEDİYE PAKETLENDİ! ★");
          return;
        }
        for (let i = s.step + 1; i < 4; i++) {
          const c = s.corners[i];
          if (Math.hypot(x - c.x, y - c.y) < 40) {
            api.lose("YEŞİL KÖŞEYE BASMALISIN!");
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'sunset', s.t);
        drawPixelBox(ctx, 95, 175, 170, 160, '#e62e2d', '#141013', '#9e1919');
        ctx.fillStyle = '#ffd43b';
        ctx.fillRect(W / 2 - 12, 175, 24, 160);
        ctx.fillRect(95, 243, 170, 24);
        window.GBA_RENDER.drawSprite(ctx, 'heart', W / 2, 255, 3);

        s.corners.forEach((c, i) => {
          const col = i === s.step ? '#38c848' : i < s.step ? '#ffd43b' : '#1e293b';
          drawPixelBox(ctx, c.x - 28, c.y - 28, 56, 56, col, '#141013', '#000');
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 16px "Press Start 2P", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), c.x, c.y + 2);
        });
        window.GBA_RENDER.drawGBABanner(ctx, W, `YEŞİL KÖŞEYE BAS! (${s.step}/4)`);
      }
    },

    // 46. Party Confetti Cannon Past Moving Bomb
    {
      id: 46, level: 5,
      title: "KONFETİ PATLAT!",
      sub: "Bombaya çarpmadan üstteki 2 altın bloğu vur!",
      duration: 5600,
      init(s) {
        s.t = 0; s.shots = [];
        s.targets = [{ x: 100, y: 115, hit: false }, { x: 260, y: 115, hit: false }];
      },
      onPointer(type, x, y, s) {
        if (type === 'down') {
          s.shots.push({ x: Math.max(60, Math.min(W - 60, x)), y: H - 85 });
          window.sound.playPop();
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const gx = W / 2 + Math.sin(s.t * 2.7) * 105;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);

        window.GBA_RENDER.drawBomb(ctx, gx, 232, 3, s.t);
        s.targets.forEach(t => { if (!t.hit) window.GBA_RENDER.drawSprite(ctx, 'qblock', t.x, t.y, 4); });

        for (const sh of s.shots) {
          sh.y -= 630 * dt;
          window.GBA_RENDER.drawSprite(ctx, 'star', sh.x, sh.y, 2, s.t * 10);
          if (Math.hypot(sh.x - gx, sh.y - 232) < 24) {
            api.lose("BOMBAYA ÇARPTIN!");
            return;
          }
          s.targets.forEach(t => {
            if (!t.hit && Math.hypot(sh.x - t.x, sh.y - t.y) < 42) {
              t.hit = true; sh.done = true; window.sound.playWin();
              api.spawnParticles(t.x, t.y, '#ffd43b', 14);
              api.spawnParticles(t.x, t.y, '#f472b6', 10);
              api.popup(t.x, t.y + 20, "KONFETİ!", "#a7f070");
            }
          });
        }
        s.shots = s.shots.filter(sh => !sh.done && sh.y > 0);
        if (s.targets.every(t => t.hit)) api.win("KONFETİLER PATLADI! ★");
        window.GBA_RENDER.drawGBABanner(ctx, W, "HEDEFİN ALTINA DOKUN VE VUR!");
      }
    },

    // 47. 3-Lane Birthday Rhythm Box (Real Pixel Musical Notes!)
    {
      id: 47, level: 5,
      title: "NOTALARI YAKALA!",
      sub: "İnen altın notalara dokun ve doğum günü melodisini çal!",
      duration: 5800,
      init(s) {
        s.t = 0; s.hit = 0; s.needed = 3;
        const lanes = [75, 180, 285];
        s.notes = [0, 1, 2, 3].map(i => ({
          x: lanes[i % 3],
          y: 55 - i * 90,
          done: false
        }));
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        for (const n of s.notes) {
          if (!n.done && Math.hypot(x - n.x, y - n.y) < 62) {
            n.done = true; s.hit++; window.sound.playPop();
            api.spawnParticles(n.x, n.y, '#ffd43b', 12);
            api.popup(n.x, n.y - 20, "♪ SÜPER!", "#ffd43b");
            if (s.hit >= s.needed) api.win("DOĞUM GÜNÜ MELODİSİ! ★");
            return;
          }
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'castle', s.t);

        // Rhythm Fretboard Lanes
        drawPixelBox(ctx, 32, 65, W - 64, 340, 'rgba(15, 23, 42, 0.72)', '#141013', '#000');
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
        for (const lx of [75, 180, 285]) {
          ctx.beginPath(); ctx.moveTo(lx, 68); ctx.lineTo(lx, 400); ctx.stroke();
        }
        drawPixelBox(ctx, 36, 320, W - 72, 64, 'rgba(56,200,72,0.45)', '#38c848', '#1a7a3e');

        for (const n of s.notes) {
          if (n.done) continue;
          n.y += 165 * dt;
          window.GBA_RENDER.drawSprite(ctx, 'note', n.x, n.y, 3);
          if (n.y > 435) {
            api.lose("NOTAYI KAÇIRDIN!");
            return;
          }
        }
        window.GBA_RENDER.drawGBABanner(ctx, W, `NOTALARA DOKUN! (${s.hit}/${s.needed})`);
      }
    },

    // 48. Birthday Camera Viewfinder Snap
    {
      id: 48, level: 5,
      title: "FOTOĞRAFI ÇEK!",
      sub: "Kadraj YEŞİL olduğunda (Efe ve Farida ortadayken) DOKUN!",
      duration: 5400,
      init(s) {
        s.t = 0;
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const dist = Math.abs(Math.sin(s.t * 2.2)) * 105;
        if (dist <= 62) {
          window.sound.playWin();
          api.flash('#ffffff', 0.85);
          api.win("HARİKA DOĞUM GÜNÜ POZU! ★");
        } else {
          api.lose("YEŞİL ÇERÇEVEDE ÇEK!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const offset = Math.sin(s.t * 2.2) * 105;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'overworld', s.t);

        const inFrame = Math.abs(offset) <= 62;
        drawPixelBox(ctx, W / 2 - 92, 168, 184, 158, inFrame ? 'rgba(56,200,72,0.3)' : 'rgba(255,255,255,0.18)', inFrame ? '#38c848' : '#e62e2d', '#141013');
        window.GBA_RENDER.drawCharacter(ctx, 'efe', W / 2 - 30 + offset, 255, 50, 68);
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', W / 2 + 30 - offset, 255, 52, 68, true);
        if (inFrame) {
          window.GBA_RENDER.drawSprite(ctx, 'heart', W / 2, 198, 3);
        }

        // Camera REC indicator
        ctx.fillStyle = '#e62e2d';
        ctx.beginPath(); ctx.arc(W / 2 - 74, 184, 6, 0, Math.PI * 2); ctx.fill();
        window.GBA_RENDER.drawGBABanner(ctx, W, "KADRAJ YEŞİLKEN DOKUN!");
      }
    },

    // 49. Castle Gate 3-Key Lock
    {
      id: 49, level: 5,
      title: "KALE KAPISINI AÇ!",
      sub: "Bombaya basmadan 3 altın kilide dokun!",
      duration: 5600,
      init(s) {
        s.t = 0;
        s.locks = [
          { x: 75, y: 155, open: false },
          { x: 180, y: 155, open: false },
          { x: 285, y: 155, open: false }
        ];
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down') return;
        const g1 = W / 2 + Math.sin(s.t * 3.1) * 115;
        const gy = 215 + Math.cos(s.t * 2.4) * 32;
        s.locks.forEach(l => {
          if (!l.open && Math.hypot(x - l.x, y - l.y) < 48) {
            l.open = true;
            window.sound.playPop();
            api.spawnParticles(l.x, l.y, '#ffd43b', 12);
            api.popup(l.x, l.y - 25, "AÇILDI!", "#ffd43b");
          }
        });
        if (s.locks.every(l => l.open)) {
          api.win("PASTA KALESİ AÇILDI! ★");
          return;
        }
        if (Math.hypot(x - g1, y - gy) < 30) {
          api.lose("BOMBAYA BASTIN!");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const g1 = W / 2 + Math.sin(s.t * 3.1) * 115;
        const gy = 215 + Math.cos(s.t * 2.4) * 32;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'castle', s.t);

        // Grand Castle Wooden Gate Arch
        drawPixelBox(ctx, 40, 110, W - 80, 295, '#592812', '#141013', '#3b180a');
        s.locks.forEach(l => {
          if (!l.open) window.GBA_RENDER.drawSprite(ctx, 'qblock', l.x, l.y, 4);
          else window.GBA_RENDER.drawSprite(ctx, 'star', l.x, l.y, 2);
        });
        window.GBA_RENDER.drawBomb(ctx, g1, gy, 3, s.t);
        const openCount = s.locks.filter(l => l.open).length;
        window.GBA_RENDER.drawGBABanner(ctx, W, `ALTIN BLOKLARA DOKUN! (${openCount}/3)`);
      }
    },

    // 50. FINAL BOSS (#50): 7 Birthday Candles on Decorated Two-Tier Cake!
    {
      id: 50, level: 5,
      title: "FİNAL: 7 MUMU ÜFLE!",
      sub: "Parmağını mumların üstünde kaydırarak 7 mumu da söndür!",
      duration: 7000,
      init(s) {
        s.t = 0;
        s.candles = Array.from({ length: 7 }, (_, i) => ({
          x: 66 + i * 38,
          lit: true,
          relightTimer: 0
        }));
      },
      onPointer(type, x, y, s, api) {
        if (type !== 'down' && type !== 'move') return;
        const sparkX = W / 2 + Math.sin(s.t * 2.8) * 120;
        if (Math.hypot(x - sparkX, y - 125) < 22) {
          api.lose("MOR MİKROBA DEĞDİN!");
          return;
        }
        s.candles.forEach(c => {
          if (c.lit && Math.hypot(x - c.x, y - 218) < 42) {
            c.lit = false;
            c.relightTimer = 4.5;
            window.sound.playPop();
            api.spawnParticles(c.x, 195, '#ffffff', 8);
            api.spawnParticles(c.x, 195, '#ffd43b', 6);
          }
        });
        if (s.candles.every(c => !c.lit)) {
          api.flash('#ffd43b', 0.6);
          api.win("İYİ Kİ DOĞDUN FARİDA! 50/50! ★");
        }
      },
      update(dt, s, _W, _H, api) {
        s.t += dt;
        const sparkX = W / 2 + Math.sin(s.t * 2.8) * 120;
        const ctx = api.ctx;
        window.GBA_RENDER.drawMarioStage(ctx, W, H, 'night', s.t);

        const bounce = Math.abs(Math.sin(s.t * 6)) * 5;
        window.GBA_RENDER.drawCharacter(ctx, 'efe', 46, 355 - bounce, 52, 76);
        window.GBA_RENDER.drawCharacter(ctx, 'farida_casual', W - 46, 355 - bounce, 56, 76, true);

        // Decorated Giant Two-Tier Birthday Cake + Icing Drips + Hearts
        drawPixelBox(ctx, W / 2 - 135, 368, 270, 12, '#ffffff', '#141013', '#cbd5e1');
        drawPixelBox(ctx, W / 2 - 122, 310, 244, 58, '#f472b6', '#141013', '#db2777');
        ctx.fillStyle = '#fff6d3';
        ctx.fillRect(W / 2 - 118, 312, 236, 12);
        drawPixelBox(ctx, W / 2 - 110, 255, 220, 56, '#fff6d3', '#141013', '#fcd34d');
        ctx.fillStyle = '#e62e2d';
        ctx.fillRect(W / 2 - 106, 257, 212, 10);
        window.GBA_RENDER.drawSprite(ctx, 'heart', W / 2, 340, 3);

        // Roaming hazard high above candles
        window.GBA_RENDER.drawSprite(ctx, 'germ', sparkX, 125, 3);

        s.candles.forEach(c => {
          if (!c.lit) {
            c.relightTimer -= dt;
            if (c.relightTimer <= 0) c.lit = true;
          }
          drawPixelBox(ctx, c.x - 5, 212, 10, 42, '#29adff', '#141013', '#1d57a5');
          if (c.lit) {
            // Glowing golden flame halo
            ctx.fillStyle = 'rgba(255, 212, 59, 0.32)';
            ctx.beginPath(); ctx.arc(c.x, 196, 14 + Math.sin(s.t * 16 + c.x) * 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e62e2d';
            ctx.fillRect(c.x - 6, 190, 12, 16);
            ctx.fillStyle = '#ffd43b';
            ctx.fillRect(c.x - 3, 194, 6, 10);
          }
        });

        const blown = s.candles.filter(c => !c.lit).length;
        window.GBA_RENDER.drawGBABanner(ctx, W, `MUMLARI SÖNDÜR! (${blown}/7)`);
      }
    }
  ];

  window.MICROGAMES = window.MICROGAMES.concat(part2);
})();
