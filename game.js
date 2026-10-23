// Main GBA Game Controller: 5 Worlds x 10 Microgames (50 Total) + Real 4-Life & Game Over System
// Strict background freeze during foreground intro + Fast 3-2-1-BAŞLA! countdown + GBA Juice Engine
(function () {
  const VIRTUAL_W = 360;
  const VIRTUAL_H = 480;
  const MAX_LIVES = 4;

  let currentLevel = 1; // 1 .. 5
  let levelGames = [];
  let gameIndexInLevel = 0;
  let practiceMode = false;
  let lives = MAX_LIVES;

  // Dialogue state
  let activeStoryKey = 'level1';
  let lineIndex = 0;
  let charIndex = 0;
  let typingTimer = null;
  let fullLineText = '';
  let currentSpeakerRole = 'efe';

  // Microgame runtime state
  let activeGame = null;
  let gameState = {};
  let gameTimeLeft = 0;
  let gameDuration = 5500;
  let gameRunning = false;
  let particles = [];
  let popups = [];
  let flashColor = '#ffffff';
  let flashAlpha = 0;
  let shakeAmount = 0;
  let lastFrameTime = performance.now();
  let pendingTimers = [];

  const screens = {
    title: document.getElementById('title-screen'),
    dialogue: document.getElementById('dialogue-screen'),
    arcade: document.getElementById('arcade-screen'),
    finale: document.getElementById('finale-screen')
  };

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = VIRTUAL_W;
  canvas.height = VIRTUAL_H;
  ctx.imageSmoothingEnabled = false;

  function clearPendingTimers() {
    pendingTimers.forEach(id => clearTimeout(id));
    pendingTimers = [];
  }

  function scheduleTimer(fn, ms) {
    const id = setTimeout(fn, ms);
    pendingTimers.push(id);
    return id;
  }

  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
  }

  function updateLivesHUD() {
    const row = document.getElementById('lives-row');
    row.innerHTML = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      const img = document.createElement('img');
      img.className = 'life-head';
      img.src = 'assets/farida_casual_head.png';
      if (i >= lives) {
        img.style.filter = 'grayscale(100%) brightness(0.35)';
        img.style.opacity = '0.45';
      }
      row.appendChild(img);
    }
  }

  // =========================================================================
  // GBA DIALOGUE ENGINE (5 WORLDS)
  // =========================================================================
  function startStoryLevel(levelNum) {
    clearPendingTimers();
    gameRunning = false;
    practiceMode = false;
    currentLevel = levelNum;
    lives = MAX_LIVES;
    updateLivesHUD();

    activeStoryKey = `level${levelNum}`;
    const story = window.STORY_DATA[activeStoryKey];

    document.getElementById('world-badge-title').textContent = story.worldTitle;
    document.getElementById('world-badge-sub').textContent = story.worldSub;

    lineIndex = 0;
    showScreen('dialogue');
    window.sound.startStardewBgm();
    renderDialogueLine();
  }

  function renderDialogueLine() {
    const story = window.STORY_DATA[activeStoryKey];
    const line = story.lines[lineIndex];
    if (!line) {
      window.sound.stopBgm();
      startLevelArcade(currentLevel);
      return;
    }

    currentSpeakerRole = line.role;
    document.getElementById('dialogue-speaker').textContent = line.speaker.toUpperCase();

    const efeActor = document.getElementById('actor-efe');
    const faridaActor = document.getElementById('actor-farida');
    if (line.role === 'farida' && line.portrait) {
      faridaActor.src = line.portrait;
    }
    efeActor.classList.toggle('speaking', line.role === 'efe');
    faridaActor.classList.toggle('speaking', line.role === 'farida');

    const choicesEl = document.getElementById('dialogue-choices');
    choicesEl.classList.remove('active');
    choicesEl.innerHTML = '';

    typeLineText(line.text, () => {
      if (line.choices && line.choices.length > 0) {
        choicesEl.innerHTML = '';
        line.choices.forEach(ch => {
          const btn = document.createElement('button');
          btn.className = 'gba-btn choice-btn';
          btn.textContent = ch.label;
          btn.onclick = (e) => {
            e.stopPropagation();
            window.sound.playClick();
            choicesEl.classList.remove('active');
            typeLineText(ch.reply, () => {
              document.getElementById('dialogue-hint').textContent = '▶ BAŞLAMAK İÇİN DOKUN!';
            });
          };
          choicesEl.appendChild(btn);
        });
        choicesEl.classList.add('active');
        document.getElementById('dialogue-hint').textContent = '▼ SEÇİM YAP:';
      }
    });
  }

  function typeLineText(text, onDone) {
    if (typingTimer) clearInterval(typingTimer);
    fullLineText = text;
    charIndex = 0;
    const textEl = document.getElementById('dialogue-text');
    textEl.textContent = '';
    document.getElementById('dialogue-hint').textContent = '▼ DEVAM...';

    typingTimer = setInterval(() => {
      charIndex++;
      textEl.textContent = fullLineText.slice(0, charIndex);
      if (charIndex % 2 === 0) {
        window.sound.playVoiceBlip(currentSpeakerRole === 'farida' ? 'bubu' : 'efe');
      }
      if (charIndex >= fullLineText.length) {
        clearInterval(typingTimer);
        typingTimer = null;
        if (onDone) onDone();
      }
    }, 20);
  }

  document.getElementById('dialogue-box-clickable').addEventListener('click', () => {
    window.sound.init();
    const choicesEl = document.getElementById('dialogue-choices');
    if (choicesEl.classList.contains('active')) return;

    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
      document.getElementById('dialogue-text').textContent = fullLineText;
      const story = window.STORY_DATA[activeStoryKey];
      const line = story.lines[lineIndex];
      if (line && line.choices) {
        renderDialogueLine();
      }
      return;
    }

    window.sound.playClick();
    lineIndex++;
    renderDialogueLine();
  });

  // =========================================================================
  // WARIOWARE MICROGAME ENGINE (FROZEN PREVIEW + FAST 3-2-1 + 4 LIVES)
  // =========================================================================
  function startLevelArcade(levelNum) {
    clearPendingTimers();
    levelGames = window.MICROGAMES.filter(g => g.level === levelNum);
    gameIndexInLevel = 0;
    lives = MAX_LIVES;
    updateLivesHUD();
    document.getElementById('gameover-modal').classList.remove('active');
    showScreen('arcade');
    launchCurrentMicrogame();
  }

  function launchSinglePracticeGame(gameObj) {
    clearPendingTimers();
    practiceMode = true;
    levelGames = [gameObj];
    gameIndexInLevel = 0;
    lives = MAX_LIVES;
    updateLivesHUD();
    document.getElementById('practice-modal').classList.remove('active');
    document.getElementById('gameover-modal').classList.remove('active');
    showScreen('arcade');
    launchCurrentMicrogame();
  }

  function getSpeedMultiplier() {
    if (practiceMode) return 1.0;
    return 1 + (currentLevel - 1) * 0.03 + (gameIndexInLevel >= 5 ? 0.02 : 0);
  }

  function launchCurrentMicrogame() {
    clearPendingTimers();
    gameRunning = false;

    activeGame = levelGames[gameIndexInLevel];
    if (!activeGame) {
      if (practiceMode) {
        showScreen('title');
        document.getElementById('practice-modal').classList.add('active');
        return;
      }
      if (currentLevel < 5) {
        startStoryLevel(currentLevel + 1);
      } else {
        showFinaleScreen();
      }
      return;
    }

    document.getElementById('stage-counter').textContent = practiceMode
      ? `OYUN #${activeGame.id}/50`
      : `WORLD ${currentLevel}-${gameIndexInLevel + 1}/10`;

    gameState = {};
    particles = [];
    popups = [];
    flashAlpha = 0;
    shakeAmount = 0;
    gameDuration = activeGame.duration || 5600;
    gameTimeLeft = gameDuration;

    // Initialize state so frozen preview renders starting layout at t = 0
    activeGame.init(gameState, VIRTUAL_W, VIRTUAL_H);

    const overlay = document.getElementById('command-overlay');
    const cdEl = document.getElementById('command-countdown');
    document.getElementById('command-title').textContent = activeGame.title;
    document.getElementById('command-sub').textContent = activeGame.sub;

    cdEl.classList.remove('hidden', 'go');
    cdEl.textContent = '3';
    overlay.classList.add('active');
    window.sound.playClick();

    // Fast 3 -> 2 -> 1 -> BAŞLA! sequence while background stays 100% frozen
    scheduleTimer(() => {
      cdEl.textContent = '2';
      window.sound.playClick();
    }, 300);

    scheduleTimer(() => {
      cdEl.textContent = '1';
      window.sound.playClick();
    }, 600);

    scheduleTimer(() => {
      cdEl.textContent = 'BAŞLA!';
      cdEl.classList.add('go');
      window.sound.playPop();
    }, 900);

    scheduleTimer(() => {
      overlay.classList.remove('active');
      lastFrameTime = performance.now();
      gameRunning = true;
    }, 1160);
  }

  function completeMicrogame(won, customMessage) {
    if (!gameRunning) return;
    gameRunning = false;
    clearPendingTimers();

    if (won) {
      window.sound.playWin();
      flash('#38c848', 0.28);
      spawnParticles(VIRTUAL_W / 2, VIRTUAL_H / 2, '#ffd43b', 28);
      spawnParticles(VIRTUAL_W / 2, VIRTUAL_H / 2 - 40, '#38c848', 18);
    } else {
      lives = Math.max(0, lives - 1);
      updateLivesHUD();
      window.sound.playLose();
      flash('#e62e2d', 0.35);
      shake(10);
    }

    const overlay = document.getElementById('command-overlay');
    const cdEl = document.getElementById('command-countdown');
    cdEl.classList.add('hidden');
    document.getElementById('command-title').textContent = won ? "BAŞARILI! ★" : `YANDIN! (${lives} CAN KALDI)`;
    document.getElementById('command-sub').textContent = customMessage || (won ? "Süpersin Farida!" : "1 Can Kaybettin!");
    overlay.classList.add('active');

    scheduleTimer(() => {
      overlay.classList.remove('active');
      if (!won && lives <= 0 && !practiceMode) {
        triggerGameOver();
        return;
      }
      gameIndexInLevel++;
      launchCurrentMicrogame();
    }, 1100);
  }

  function triggerGameOver() {
    window.sound.playLose();
    document.getElementById('gameover-sub').textContent = `World ${currentLevel} - Oyun ${gameIndexInLevel + 1}/10'da 4 canın bitti!`;
    document.getElementById('gameover-modal').classList.add('active');
  }

  function spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 70 + Math.random() * 160;
      particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        color,
        life: 0.65
      });
    }
  }

  function popup(x, y, text, color = '#ffd43b') {
    popups.push({
      x: Math.max(55, Math.min(VIRTUAL_W - 55, x)),
      y: Math.max(70, Math.min(VIRTUAL_H - 60, y)),
      text,
      color,
      life: 0.75
    });
  }

  function flash(color = '#ffffff', alpha = 0.25) {
    flashColor = color;
    flashAlpha = alpha;
  }

  function shake(intensity = 6) {
    shakeAmount = Math.max(shakeAmount, intensity);
  }

  function makeApi(isPreview = false) {
    if (isPreview) {
      return {
        ctx,
        win() {},
        lose() {},
        spawnParticles() {},
        popup() {},
        flash() {},
        shake() {}
      };
    }
    return {
      ctx,
      win: (msg) => completeMicrogame(true, msg),
      lose: (msg) => completeMicrogame(false, msg),
      spawnParticles,
      popup,
      flash,
      shake
    };
  }

  function tick(now) {
    const rawDt = Math.min(0.05, Math.max(0, (now - lastFrameTime) / 1000));
    lastFrameTime = now;

    if (screens.arcade.classList.contains('active') && activeGame) {
      if (gameRunning) {
        gameTimeLeft -= rawDt * 1000;
        if (gameTimeLeft <= 0) {
          gameTimeLeft = 0;
          completeMicrogame(false, "SÜRE BİTTİ! 1 Can Gitti!");
        }
      }

      const pct = Math.max(0, (gameTimeLeft / gameDuration) * 100);
      const fuseFill = document.getElementById('fuse-fill');
      fuseFill.style.width = `${pct}%`;
      fuseFill.style.background = pct < 28 ? '#e62e2d' : pct < 55 ? '#ffd43b' : '#38c848';

      ctx.save();
      if (shakeAmount > 0.2) {
        const sx = (Math.random() - 0.5) * shakeAmount * 2;
        const sy = (Math.random() - 0.5) * shakeAmount * 2;
        ctx.translate(sx, sy);
        shakeAmount *= 0.85;
      } else {
        shakeAmount = 0;
      }

      // CRITICAL FIX: Only advance game physics when gameRunning === true!
      // During the foreground 3-2-1 intro, dt = 0 renders a crisp frozen preview!
      if (gameRunning) {
        const dt = rawDt * getSpeedMultiplier();
        activeGame.update(dt, gameState, VIRTUAL_W, VIRTUAL_H, makeApi(false));
      } else {
        activeGame.update(0, gameState, VIRTUAL_W, VIRTUAL_H, makeApi(true));
      }

      // Render particles
      particles.forEach(p => {
        p.x += p.vx * rawDt;
        p.y += p.vy * rawDt;
        p.vy += 260 * rawDt;
        p.life -= rawDt;
        ctx.fillStyle = '#141013';
        ctx.fillRect(Math.floor(p.x) - 5, Math.floor(p.y) - 5, 10, 10);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x) - 4, Math.floor(p.y) - 4, 8, 8);
      });
      particles = particles.filter(p => p.life > 0);

      // Render floating GBA popups
      popups.forEach(pp => {
        pp.y -= 48 * rawDt;
        pp.life -= rawDt;
        ctx.save();
        ctx.font = '900 13px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#141013';
        ctx.fillText(pp.text, Math.floor(pp.x) + 2, Math.floor(pp.y) + 2);
        ctx.fillStyle = pp.color;
        ctx.fillText(pp.text, Math.floor(pp.x), Math.floor(pp.y));
        ctx.restore();
      });
      popups = popups.filter(pp => pp.life > 0);

      // Render subtle screen flash
      if (flashAlpha > 0.01) {
        ctx.fillStyle = flashColor;
        ctx.globalAlpha = flashAlpha;
        ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);
        ctx.globalAlpha = 1;
        flashAlpha *= 0.84;
      } else {
        flashAlpha = 0;
      }

      ctx.restore();
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIRTUAL_W,
      y: ((clientY - rect.top) / rect.height) * VIRTUAL_H
    };
  }

  function handlePointer(type, e) {
    if (!gameRunning || !activeGame) return;
    const pt = e.touches && e.touches[0] ? e.touches[0] : e;
    const { x, y } = getCanvasCoords(pt.clientX, pt.clientY);
    activeGame.onPointer(type, x, y, gameState, makeApi(false));
  }

  // Relative phone tilt tracking
  window.PHONE_GAMMA = null;
  window.addEventListener('deviceorientation', e => {
    if (typeof e.gamma === 'number') {
      window.PHONE_GAMMA = e.gamma;
    }
  });

  canvas.addEventListener('pointerdown', e => {
    window.sound.init();
    handlePointer('down', e);
  });
  canvas.addEventListener('pointermove', e => handlePointer('move', e));
  window.addEventListener('pointerup', e => handlePointer('up', e));
  window.addEventListener('pointercancel', e => handlePointer('up', e));

  // Keyboard support for PC play
  window.addEventListener('keydown', e => {
    if (!gameRunning || !activeGame) return;
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp') {
      e.preventDefault();
      activeGame.onPointer('down', VIRTUAL_W / 2, VIRTUAL_H / 2, gameState, makeApi(false));
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      activeGame.onPointer('down', 65, 375, gameState, makeApi(false));
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      activeGame.onPointer('down', VIRTUAL_W - 65, 375, gameState, makeApi(false));
    }
  });
  window.addEventListener('keyup', e => {
    if (!gameRunning || !activeGame) return;
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      activeGame.onPointer('up', VIRTUAL_W / 2, VIRTUAL_H / 2, gameState, makeApi(false));
    }
  });

  // =========================================================================
  // FINALE, GAME OVER & MODALS
  // =========================================================================
  function showFinaleScreen() {
    clearPendingTimers();
    showScreen('finale');
    document.getElementById('finale-banner-text').textContent = window.STORY_DATA.finale.bannerText;
    document.getElementById('love-letter-content').innerHTML = window.STORY_DATA.finale.letterHtml;
    window.sound.playBirthdaySong();
  }

  document.getElementById('btn-start-story').addEventListener('click', () => {
    window.sound.init();
    window.sound.playClick();
    startStoryLevel(1);
  });

  document.getElementById('btn-continue-stage').addEventListener('click', () => {
    window.sound.playClick();
    document.getElementById('gameover-modal').classList.remove('active');
    lives = MAX_LIVES;
    updateLivesHUD();
    launchCurrentMicrogame();
  });

  document.getElementById('btn-retry-world').addEventListener('click', () => {
    window.sound.playClick();
    document.getElementById('gameover-modal').classList.remove('active');
    startLevelArcade(currentLevel);
  });

  document.getElementById('btn-gameover-home').addEventListener('click', () => {
    clearPendingTimers();
    window.sound.playClick();
    document.getElementById('gameover-modal').classList.remove('active');
    showScreen('title');
  });

  document.getElementById('btn-open-practice').addEventListener('click', () => {
    window.sound.init();
    window.sound.playClick();
    populatePracticeGrid();
    document.getElementById('practice-modal').classList.add('active');
  });

  document.getElementById('btn-close-practice').addEventListener('click', () => {
    window.sound.playClick();
    document.getElementById('practice-modal').classList.remove('active');
  });

  document.getElementById('btn-open-qr').addEventListener('click', () => {
    window.sound.init();
    window.sound.playClick();
    document.getElementById('qr-modal').classList.add('active');
  });

  document.getElementById('btn-close-qr').addEventListener('click', () => {
    window.sound.playClick();
    document.getElementById('qr-modal').classList.remove('active');
  });

  document.getElementById('btn-replay-finale').addEventListener('click', () => {
    window.sound.playBirthdaySong();
  });

  document.getElementById('btn-back-title').addEventListener('click', () => {
    clearPendingTimers();
    window.sound.playClick();
    showScreen('title');
  });

  document.getElementById('btn-home-top').addEventListener('click', () => {
    clearPendingTimers();
    window.sound.playClick();
    window.sound.stopBgm();
    gameRunning = false;
    document.getElementById('command-overlay').classList.remove('active');
    document.getElementById('gameover-modal').classList.remove('active');
    showScreen('title');
  });

  document.getElementById('btn-mute-top').addEventListener('click', (e) => {
    const muted = window.sound.toggleMute();
    e.currentTarget.textContent = muted ? '🔇 SES KAPALI' : '🔊 SES AÇIK';
  });

  function populatePracticeGrid() {
    const grid = document.getElementById('practice-grid');
    grid.innerHTML = '';

    for (let w = 1; w <= 5; w++) {
      const wBtn = document.createElement('button');
      wBtn.className = 'gba-btn green practice-item';
      wBtn.style.gridColumn = w === 5 ? 'span 2' : 'span 1';
      wBtn.innerHTML = `<strong>▶ WORLD ${w} BAŞLAT (${(w - 1) * 10 + 1}-${w * 10})</strong>`;
      wBtn.onclick = () => {
        window.sound.playClick();
        document.getElementById('practice-modal').classList.remove('active');
        startStoryLevel(w);
      };
      grid.appendChild(wBtn);
    }

    window.MICROGAMES.forEach(g => {
      const btn = document.createElement('button');
      btn.className = 'gba-btn practice-item';
      btn.innerHTML = `<span style="font-size:0.65rem; color:#9e1919;">W${g.level} • #${g.id}</span><strong>${g.title}</strong>`;
      btn.onclick = () => {
        window.sound.playClick();
        launchSinglePracticeGame(g);
      };
      grid.appendChild(btn);
    });
  }
})();
