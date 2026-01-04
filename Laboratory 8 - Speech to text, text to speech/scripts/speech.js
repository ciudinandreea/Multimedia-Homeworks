window.addEventListener("load", () => {
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

  const supportMsg = document.getElementById("supportMsg");
  if (!SpeechRecognitionCtor) {
    supportMsg.innerHTML =
      "<span class='err'><b>SpeechRecognition is not supported</b> in this browser. Use Chrome / Edge on desktop.</span>";
  } else {
    supportMsg.textContent = "Tip: allow microphone access when prompted.";
  }

  const recognition = SpeechRecognitionCtor ? new SpeechRecognitionCtor() : null;

  const el = {
    difficulty: document.getElementById("difficulty"),
    language: document.getElementById("language"),
    voice: document.getElementById("voice"),
    rate: document.getElementById("rate"),
    pitch: document.getElementById("pitch"),
    rateVal: document.getElementById("rateVal"),
    pitchVal: document.getElementById("pitchVal"),
    timeout: document.getElementById("timeout"),
    continuous: document.getElementById("continuous"),
    multiplayer: document.getElementById("multiplayer"),

    start: document.getElementById("start"),
    stop: document.getElementById("stop"),
    newGame: document.getElementById("newGame"),
    repeat: document.getElementById("repeat"),
    help: document.getElementById("help"),
    giveUp: document.getElementById("giveUp"),

    status: document.getElementById("status"),
    player: document.getElementById("player"),
    attempts: document.getElementById("attempts"),
    range: document.getElementById("range"),
    time: document.getElementById("time"),
    transcript: document.getElementById("transcript"),
    confidence: document.getElementById("confidence"),
    hint: document.getElementById("hint"),
    history: document.getElementById("history"),

    rangeCanvas: document.getElementById("rangeCanvas"),
    statsCanvas: document.getElementById("statsCanvas"),
    games: document.getElementById("games"),
    winrate: document.getElementById("winrate"),
    avgAttempts: document.getElementById("avgAttempts"),
    avgTime: document.getElementById("avgTime"),
    commonRange: document.getElementById("commonRange"),
    bestAttempts: document.getElementById("bestAttempts"),
    bestScore: document.getElementById("bestScore"),

    achLucky: document.getElementById("achLucky"),
    achSkilled: document.getElementById("achSkilled"),
    achDedicated: document.getElementById("achDedicated"),
    achPerfect: document.getElementById("achPerfect"),
  };

  const rangeCtx = el.rangeCanvas.getContext("2d");
  const statsCtx = el.statsCanvas.getContext("2d");
  const LS_GAMES = "lab8_games_v1";
  const LS_BEST = "lab8_best_v1";
  const LS_ACH = "lab8_achievements_v1";
  const LS_WINS = "lab8_multiplayer_wins_v1";

  function loadJson(key, fallback) {
    try {
      const s = localStorage.getItem(key);
      if (!s) return fallback;
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  }
  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  const I18N = {
    "en-US": {
      ready: "Ready",
      listening: "Listening…",
      stopped: "Stopped",
      won: (n) => `You won! The number was ${n}.`,
      tooLow: "Too low.",
      tooHigh: "Too high.",
      invalid: "I didn't understand a number. Try again.",
      giveUp: (n) => `You gave up. The number was ${n}.`,
      help: "Say a number to guess. Commands: new game, repeat, help, give up.",
      timeout: "I didn't hear anything. Please try again.",
      yourTurn: (p) => `${p}'s turn.`,
      smart: (temp) => temp,
      score: (s) => `Score: ${s}`,
      cmd: {
        newGame: ["new game", "restart", "start over"],
        repeat: ["repeat"],
        help: ["help"],
        giveUp: ["give up", "surrender"],
      }
    },
  };

  function t() {
    const lang = el.language.value;
    return I18N[lang] || I18N["en-US"];
  }
  const WORDS = {
    "en-US": {
      zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10,
      eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19,
      twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90,
      hundred:100, thousand:1000
    },
  };

  function parseSpokenNumber(text, lang) {
    const digits = text.replace(/[^\d]/g, "");
    if (digits.length > 0) {
      const n = parseInt(digits, 10);
      if (!Number.isNaN(n)) return n;
    }

    const map = WORDS[lang] || WORDS["en-US"];
    const cleaned = text
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/\band\b/g, " ")
      .replace(/\bet\b/g, " ")
      .replace(/\bund\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) return NaN;

    const tokens = cleaned.split(" ");
    let total = 0;
    let current = 0;

    for (const tok of tokens) {
      const v = map[tok];
      if (typeof v !== "number") {
        if (map[cleaned] !== undefined) return map[cleaned];
        continue;
      }
      if (v === 100 || v === 1000) {
        current = (current === 0 ? 1 : current) * v;
        total += current;
        current = 0;
      } else {
        current += v;
      }
    }
    total += current;
    return total === 0 ? NaN : total;
  }

  const DIFFICULTY = {
    easy: { min: 1, max: 50 },
    medium: { min: 1, max: 100 },
    hard: { min: 1, max: 1000 },
  };

  let target = 0;
  let minBound = 0;
  let maxBound = 0;
  let attempts = 0;
  let startMs = 0;
  let ended = false;

  let lastHint = "";
  let lastSpoken = "";

  let currentPlayer = 0; 
  let attemptsByPlayer = [0, 0];

  let listening = false;
  let stopRequested = false;
  let reminderTimer = null;
  let uiTimer = null;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;

  function beep(freq, ms) {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = 0.08;

    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();

    setTimeout(() => {
      o.stop();
      o.disconnect();
      g.disconnect();
    }, ms);
  }

  function sound(type) {
    if (type === "win") { beep(880, 120); setTimeout(()=>beep(1175,120),140); }
    else if (type === "error") { beep(220, 160); }
    else if (type === "hint") { beep(440, 80); }
    else if (type === "command") { beep(520, 70); }
  }

  const synth = window.speechSynthesis;

  let voices = [];
  function refreshVoices() {
    voices = synth.getVoices();
    const lang = el.language.value;
    const filtered = voices.filter(v => (v.lang || "").toLowerCase().startsWith(lang.toLowerCase().slice(0,2)));
    const list = filtered.length ? filtered : voices;

    el.voice.innerHTML = "";
    list.forEach((v, i) => {
      const opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      el.voice.appendChild(opt);
    });

    if (el.voice.options.length > 0) el.voice.selectedIndex = 0;
  }

  if (synth) {
    synth.onvoiceschanged = () => {
      refreshVoices();
      speak("Voices loaded. " + (t().ready || "Ready"), { announce: false });
    };
    setTimeout(refreshVoices, 200);
  }

  function speak(text, opts = {}) {
    if (!synth) return;
    const utter = new SpeechSynthesisUtterance(text);
    const lang = el.language.value;
    utter.lang = lang;
    utter.rate = parseFloat(el.rate.value);
    utter.pitch = parseFloat(el.pitch.value);

    const desired = el.voice.value;
    const v = voices.find(v => v.name === desired);
    if (v) utter.voice = v;

    if (!opts.queue) synth.cancel();
    synth.speak(utter);
    lastSpoken = text;
  }

  function setStatus(text, cls = "") {
    el.status.textContent = text;
    el.status.className = cls;
  }

  function setHint(text, cls="") {
    el.hint.textContent = text;
    el.hint.className = cls;
    lastHint = text;
  }

  function updateRangeLabel() {
    el.range.textContent = `${minBound}–${maxBound}`;
  }

  function currentPlayerName() {
    return el.multiplayer.checked ? (currentPlayer === 0 ? "Player 1" : "Player 2") : "Solo";
  }

  function updatePlayerLabel() {
    el.player.textContent = currentPlayerName();
  }

  function resetHistoryUI() {
    el.history.innerHTML = "";
  }

  function addHistoryItem(obj) {
    const li = document.createElement("li");
    const who = el.multiplayer.checked ? ` (${obj.player})` : "";
    li.textContent = `${obj.guess}${who} — "${obj.transcript}"`;
    el.history.appendChild(li);
  }

  function drawRangeCanvas() {
    const d = DIFFICULTY[el.difficulty.value];
    const W = el.rangeCanvas.width;
    const H = el.rangeCanvas.height;

    const pad = 60;
    const y = 70;
    const left = pad;
    const right = W - pad;
    const barW = right - left;

    rangeCtx.clearRect(0, 0, W, H);
    rangeCtx.fillStyle = "#0b1020";
    rangeCtx.fillRect(0, 0, W, H);

    rangeCtx.strokeStyle = "rgba(255,255,255,.25)";
    rangeCtx.lineWidth = 2;
    rangeCtx.beginPath();
    rangeCtx.moveTo(left, y);
    rangeCtx.lineTo(right, y);
    rangeCtx.stroke();

    const xMin = left + ((minBound - d.min) / (d.max - d.min)) * barW;
    const xMax = left + ((maxBound - d.min) / (d.max - d.min)) * barW;

    rangeCtx.fillStyle = "rgba(255,255,255,.10)";
    rangeCtx.fillRect(left, y - 14, Math.max(0, xMin - left), 28);

    rangeCtx.fillStyle = "rgba(124, 220, 140, .35)";
    rangeCtx.fillRect(xMin, y - 14, Math.max(0, xMax - xMin), 28);
 
    rangeCtx.fillStyle = "rgba(255,255,255,.10)";
    rangeCtx.fillRect(xMax, y - 14, Math.max(0, right - xMax), 28);

    rangeCtx.fillStyle = "rgba(255,255,255,.85)";
    rangeCtx.font = "14px system-ui, sans-serif";
    rangeCtx.fillText(String(d.min), left - 10, y + 40);
    rangeCtx.fillText(String(d.max), right - 25, y + 40);

    rangeCtx.fillStyle = "rgba(255,255,255,.75)";
    rangeCtx.fillText(`Remaining: ${minBound}–${maxBound}`, left, y - 28);

    const games = currentGameGuesses;
    rangeCtx.strokeStyle = "rgba(255,255,255,.9)";
    rangeCtx.lineWidth = 2;

    for (const g of games) {
      const x = left + ((g.guess - d.min) / (d.max - d.min)) * barW;
      rangeCtx.beginPath();
      rangeCtx.moveTo(x, y - 22);
      rangeCtx.lineTo(x, y + 22);
      rangeCtx.stroke();

      rangeCtx.fillStyle = "rgba(255,255,255,.85)";
      rangeCtx.font = "12px system-ui, sans-serif";
      rangeCtx.fillText(String(g.guess), x - 10, y - 26);
    }
  }

  function drawStatsCanvas(gameList) {
    const W = el.statsCanvas.width;
    const H = el.statsCanvas.height;
    statsCtx.clearRect(0, 0, W, H);
    statsCtx.fillStyle = "#0b1020";
    statsCtx.fillRect(0, 0, W, H);

    const wins = gameList.filter(g => g.won);
    if (wins.length === 0) {
      statsCtx.fillStyle = "rgba(255,255,255,.8)";
      statsCtx.font = "16px system-ui, sans-serif";
      statsCtx.fillText("No wins yet — win a game to see the chart.", 24, 40);
      return;
    }

    const maxBucket = 15;
    const buckets = new Array(maxBucket).fill(0);
    for (const g of wins) {
      const a = Math.min(maxBucket, Math.max(1, g.attempts));
      buckets[a - 1] += 1;
    }

    const pad = 50;
    const chartW = W - pad * 2;
    const chartH = H - pad * 2;

    const maxVal = Math.max(...buckets, 1);
    const barW = chartW / buckets.length;

    statsCtx.strokeStyle = "rgba(255,255,255,.25)";
    statsCtx.lineWidth = 2;
    statsCtx.beginPath();
    statsCtx.moveTo(pad, H - pad);
    statsCtx.lineTo(W - pad, H - pad);
    statsCtx.stroke();

    for (let i = 0; i < buckets.length; i++) {
      const val = buckets[i];
      const h = (val / maxVal) * chartH;
      const x = pad + i * barW + 6;
      const y = (H - pad) - h;
      const w = barW - 12;

      statsCtx.fillStyle = "rgba(124, 220, 140, .55)";
      statsCtx.fillRect(x, y, w, h);

      statsCtx.fillStyle = "rgba(255,255,255,.85)";
      statsCtx.font = "12px system-ui, sans-serif";
      statsCtx.fillText(String(i + 1), x + w / 2 - 4, H - pad + 18);
    }

    statsCtx.fillStyle = "rgba(255,255,255,.9)";
    statsCtx.font = "14px system-ui, sans-serif";
    statsCtx.fillText("Wins by attempts (1–14, 15 = 15+)", pad, pad - 10);
  }

  function updateStatsUI() {
    const games = loadJson(LS_GAMES, []);
    el.games.textContent = String(games.length);

    const wins = games.filter(g => g.won).length;
    const rate = games.length ? Math.round((wins / games.length) * 100) : 0;
    el.winrate.textContent = `${rate}%`;
    const winGames = games.filter(g => g.won);
    if (winGames.length) {
      const avgA = winGames.reduce((s, g) => s + (g.attempts || 0), 0) / winGames.length;
      const avgT = winGames.reduce((s, g) => s + (g.durationMs || 0), 0) / winGames.length;
      el.avgAttempts.textContent = avgA.toFixed(1);
      el.avgTime.textContent = `${(avgT / 1000).toFixed(1)}s`;
    } else {
      el.avgAttempts.textContent = "—";
      el.avgTime.textContent = "—";
    }

    const allGuesses = games.flatMap(g => Array.isArray(g.guesses) ? g.guesses : []);
    if (allGuesses.length) {
      const maxGuess = Math.max(...allGuesses);
      const bucketSize = 10;
      const buckets = new Map();
      for (const val of allGuesses) {
        const b = Math.floor(val / bucketSize) * bucketSize;
        buckets.set(b, (buckets.get(b) || 0) + 1);
      }
      let bestB = null, bestC = -1;
      for (const [b, c] of buckets.entries()) {
        if (c > bestC) { bestC = c; bestB = b; }
      }
      if (bestB !== null) el.commonRange.textContent = `${bestB}–${bestB + bucketSize - 1}`;
      else el.commonRange.textContent = "—";
    } else {
      el.commonRange.textContent = "—";
    }


    const best = loadJson(LS_BEST, { bestAttempts: null, bestScore: null });
    el.bestAttempts.textContent = best.bestAttempts ?? "—";
    el.bestScore.textContent = best.bestScore ?? "—";

    drawStatsCanvas(games);
    updateAchievementUI();
  }

  function updateAchievementUI() {
    const ach = loadJson(LS_ACH, {
      lucky: false,
      skilled: false,
      dedicated: false,
      perfect: false
    });

    el.achLucky.classList.toggle("on", !!ach.lucky);
    el.achSkilled.classList.toggle("on", !!ach.skilled);
    el.achDedicated.classList.toggle("on", !!ach.dedicated);
    el.achPerfect.classList.toggle("on", !!ach.perfect);
  }

  function unlockAchievement(key) {
    const ach = loadJson(LS_ACH, {
      lucky: false,
      skilled: false,
      dedicated: false,
      perfect: false
    });
    if (!ach[key]) {
      ach[key] = true;
      saveJson(LS_ACH, ach);
      updateAchievementUI();
    }
  }

  function saveGameRecord(won, extra = {}) {
    const durationMs = Date.now() - startMs;
    const record = {
      date: new Date().toISOString(),
      won,
      difficulty: el.difficulty.value,
      lang: el.language.value,
      attempts,
      durationMs,
      guesses: currentGameGuesses.map(g => g.guess),
      ...extra
    };

    const games = loadJson(LS_GAMES, []);
    games.push(record);
    saveJson(LS_GAMES, games);

    const score = computeScore(attempts, durationMs);
    const best = loadJson(LS_BEST, { bestAttempts: null, bestScore: null });

    if (won) {
      if (best.bestAttempts === null || attempts < best.bestAttempts) best.bestAttempts = attempts;
      if (best.bestScore === null || score > best.bestScore) best.bestScore = score;
      saveJson(LS_BEST, best);
    }

    if (won && attempts === 1) unlockAchievement("lucky");
    if (won && attempts <= 5) unlockAchievement("skilled");
    if (games.length >= 10) unlockAchievement("dedicated");
    if (won && extra.lastConfidence !== undefined && extra.lastConfidence >= 0.95) unlockAchievement("perfect");

    updateStatsUI();
    return score;
  }

  function computeScore(attempts, durationMs) {
    const seconds = durationMs / 1000;
    const raw = 1000 - attempts * 40 - seconds * 2;
    return Math.max(0, Math.round(raw));
  }

  function clearReminder() {
    if (reminderTimer) clearTimeout(reminderTimer);
    reminderTimer = null;
  }

  function armReminder() {
    clearReminder();
    const sec = parseInt(el.timeout.value, 10);
    if (!sec) return;
    reminderTimer = setTimeout(() => {

      setHint(t().timeout, "warn");
      speak(t().timeout, { queue: false });
      sound("error");
      if (el.continuous.checked && listening && recognition) {
        try { recognition.stop(); } catch {}
      }
    }, sec * 1000);
  }

  function startListening() {
    if (!recognition || ended) return;
    stopRequested = false;
    listening = true;

    recognition.lang = el.language.value;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    try {
      recognition.start();
      setStatus(t().listening);
      armReminder();
    } catch {
    }
  }

  function stopListening() {
    if (!recognition) return;
    stopRequested = true;
    listening = false;
    clearReminder();
    try { recognition.stop(); } catch {}
    setStatus(t().stopped);
  }

  function matchesAny(text, arr) {
    const v = text.toLowerCase();
    return arr.some(k => v.includes(k));
  }

  function handleCommand(raw) {
    const cmd = t().cmd;
    if (matchesAny(raw, cmd.giveUp)) return "giveUp";
    if (matchesAny(raw, cmd.newGame)) return "newGame";
    if (matchesAny(raw, cmd.repeat)) return "repeat";
    if (matchesAny(raw, cmd.help)) return "help";
    return null;
  }

  let currentGameGuesses = [];

  function setDifficultyRange() {
    const d = DIFFICULTY[el.difficulty.value];
    minBound = d.min;
    maxBound = d.max;
    updateRangeLabel();
  }

  function newGame() {
    const d = DIFFICULTY[el.difficulty.value];
    target = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
    minBound = d.min;
    maxBound = d.max;
    attempts = 0;
    startMs = Date.now();
    ended = false;
    currentGameGuesses = [];

    currentPlayer = 0;
    attemptsByPlayer = [0, 0];

    el.attempts.textContent = "0";
    el.transcript.textContent = "—";
    el.confidence.textContent = "";
    setHint("—");
    resetHistoryUI();
    updateRangeLabel();
    updatePlayerLabel();
    setStatus(t().ready);

    drawRangeCanvas();

    if (uiTimer) clearInterval(uiTimer);
    uiTimer = setInterval(() => {
      if (!startMs || ended) return;
      const sec = (Date.now() - startMs) / 1000;
      el.time.textContent = `${sec.toFixed(1)}s`;
    }, 100);

    if (el.multiplayer.checked) speak(t().yourTurn(currentPlayerName()), { queue: false });

  }

  function smartTemperature(guess) {
    const d = DIFFICULTY[el.difficulty.value];
    const span = d.max - d.min;
    const diff = Math.abs(guess - target);
    const pct = diff / span;

    if (pct >= 0.35) return "Very cold";
    if (pct >= 0.20) return "Cold";
    if (pct >= 0.10) return "Warm";
    return "Hot";
  }

  function applyGuess(guess, raw, confidence) {
    if (ended) return;

    const d = DIFFICULTY[el.difficulty.value];
    if (guess < d.min || guess > d.max) {
      const msg = `${t().invalid} (${d.min}-${d.max})`;
      setHint(msg, "warn");
      speak(msg);
      sound("error");
      return;
    }

    attempts += 1;
    el.attempts.textContent = String(attempts);

    if (el.multiplayer.checked) {
      attemptsByPlayer[currentPlayer] += 1;
    }

    currentGameGuesses.push({ guess, transcript: raw, player: currentPlayerName(), confidence });
    addHistoryItem({ guess, transcript: raw, player: currentPlayerName() });

    if (guess < target) minBound = Math.max(minBound, guess + 1);
    if (guess > target) maxBound = Math.min(maxBound, guess - 1);
    updateRangeLabel();

    if (guess === target) {
      ended = true;
      listening = false;
      clearReminder();
      if (uiTimer) clearInterval(uiTimer);

      setStatus("Won");
      const msg = t().won(target);
      setHint(msg);
      speak(msg);
      sound("win");

      if (el.multiplayer.checked) {
        const wins = loadJson(LS_WINS, { p1: 0, p2: 0 });
        if (currentPlayer === 0) wins.p1 += 1; else wins.p2 += 1;
        saveJson(LS_WINS, wins);
      }

      const score = saveGameRecord(true, { lastConfidence: confidence });
      speak(t().score(score), { queue: true });

      return;
    }

    const direction = (guess < target) ? t().tooLow : t().tooHigh;
    const temp = smartTemperature(guess);
    const hint = `${direction} ${t().smart(temp)}.`;

    setHint(hint);
    speak(hint);
    sound("hint");

    drawRangeCanvas();

    if (el.multiplayer.checked) {
      currentPlayer = currentPlayer === 0 ? 1 : 0;
      updatePlayerLabel();
      speak(t().yourTurn(currentPlayerName()), { queue: true });
    }
  }

  function giveUp() {
    if (ended) return;
    ended = true;
    listening = false;
    clearReminder();
    if (uiTimer) clearInterval(uiTimer);

    const msg = t().giveUp(target);
    setStatus("Ended");
    setHint(msg, "warn");
    speak(msg);
    sound("error");

    saveGameRecord(false, {});
  }

  if (recognition) {
    recognition.onresult = (event) => {
      clearReminder();

      const raw = (event.results?.[0]?.[0]?.transcript || "").toLowerCase().trim();
      const confidence = event.results?.[0]?.[0]?.confidence;

      el.transcript.textContent = raw || "—";
      el.confidence.textContent = (typeof confidence === "number") ? ` (confidence: ${confidence.toFixed(2)})` : "";

      const cmd = handleCommand(raw);
      if (cmd) {
        sound("command");
        if (cmd === "giveUp") { giveUp(); newGame(); }
        else if (cmd === "newGame") { newGame(); speak(t().ready); }
        else if (cmd === "repeat") { if (lastHint) speak(lastHint); }
        else if (cmd === "help") { speak(t().help); setHint(t().help); }
        return;
      }

      const n = parseSpokenNumber(raw, el.language.value);
      if (Number.isNaN(n)) {
        setHint(t().invalid, "warn");
        speak(t().invalid);
        sound("error");
        return;
      }

      applyGuess(n, raw, confidence);

      if (!ended && listening) armReminder();
    };

    recognition.onerror = (err) => {
      clearReminder();
      const code = err?.error || "unknown";
      let msg = `Speech error: ${code}`;

      if (code === "not-allowed" || code === "service-not-allowed") msg = "Microphone permission denied. Please allow mic access.";
      if (code === "no-speech") msg = "No speech detected. Try again.";
      if (code === "audio-capture") msg = "No microphone found.";
      if (code === "network") msg = "Network error (speech service).";

      setHint(msg, "err");
      setStatus("Error");
      speak(msg);
      sound("error");

      if (el.continuous.checked && listening && !stopRequested) {
        try { recognition.stop(); } catch {}
      }
    };

    recognition.onend = () => {
      clearReminder();
      if (stopRequested) return;
      if (!listening) return;

      if (!ended && el.continuous.checked) {
        setTimeout(() => startListening(), 250);
      } else {
        setStatus(t().ready);
      }
    };
  }

  el.rate.addEventListener("input", () => el.rateVal.textContent = parseFloat(el.rate.value).toFixed(1));
  el.pitch.addEventListener("input", () => el.pitchVal.textContent = parseFloat(el.pitch.value).toFixed(1));

  el.language.addEventListener("change", () => {
    refreshVoices();
    newGame();
    updateStatsUI();
  });

  el.difficulty.addEventListener("change", () => {
    newGame();
  });

  el.multiplayer.addEventListener("change", () => {
    newGame();
  });

  el.start.addEventListener("click", () => {
    if (!recognition) return;
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    startListening();
  });

  el.stop.addEventListener("click", () => stopListening());
  el.newGame.addEventListener("click", () => { newGame(); speak(t().ready); });
  el.repeat.addEventListener("click", () => { if (lastHint) speak(lastHint); });
  el.help.addEventListener("click", () => { speak(t().help); setHint(t().help); });
  el.giveUp.addEventListener("click", () => { giveUp(); newGame(); });

  newGame();
  updateStatsUI();
});
