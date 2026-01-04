window.onload = function () {

  const emulatedKeys = {
    q: 60, 2: 61, w: 62, 3: 63, e: 64,
    r: 65, 5: 66, t: 67, 6: 68, y: 69,
    7: 70, u: 71, i: 72
  };

  const pianoSounds = new Array(256).fill(null);
  const oscillators = new Array(256).fill(null);

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioContextCtor ? new AudioContextCtor() : null;

  function keyEl(midiCode) {
    return document.querySelector(`[data-midi-code="${midiCode}"]`);
  }

  function setKeyActive(midiCode, active) {
    const el = keyEl(midiCode);
    if (!el) return;
    el.classList.toggle("activeKey", !!active);
  }

  function midiToNoteName(midiCode) {
    const el = keyEl(midiCode);
    if (!el) return null;
    return el.getAttribute("data-note");
  }

  for (let midiCode = 36; midiCode <= 96; midiCode++) {
    const noteName = midiToNoteName(midiCode);
    if (!noteName) continue;

    const audio = new Audio(`../notes/${noteName}.mp3`);
    audio.preload = "auto";
    pianoSounds[midiCode] = audio;
  }

  function playPianoSound(midiCode) {
    const a = pianoSounds[midiCode];
    if (!a) return;

    a.pause();
    a.currentTime = 0;
    a.play().catch(() => { });

    setKeyActive(midiCode, true);
  }

  function stopPianoSound(midiCode) {
    const a = pianoSounds[midiCode];
    if (!a) return;

    a.pause();
    a.currentTime = 0;

    setKeyActive(midiCode, false);
  }

  function midiToFreq(midiCode) {

    return 440 * Math.pow(2, (midiCode - 69) / 12);
  }

  function playOscillator(midiCode) {
    if (!audioCtx) return;
    if (oscillators[midiCode]) return;

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = midiToFreq(midiCode);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.20, now + 0.02);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    oscillators[midiCode] = { osc, gain };

    setKeyActive(midiCode, true);
  }

  function stopOscillator(midiCode) {
    if (!audioCtx) return;
    const node = oscillators[midiCode];
    if (!node) return;

    const now = audioCtx.currentTime;
    node.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    node.osc.stop(now + 0.07);

    oscillators[midiCode] = null;
    setKeyActive(midiCode, false);
  }


  document.querySelectorAll(".key").forEach((el) => {
    const midiCode = Number(el.getAttribute("data-midi-code"));

    el.addEventListener("mousedown", () => playPianoSound(midiCode));
    el.addEventListener("mouseup", () => stopPianoSound(midiCode));
    el.addEventListener("mouseleave", () => stopPianoSound(midiCode));

    el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      playPianoSound(midiCode);
    }, { passive: false });

    el.addEventListener("touchend", (e) => {
      e.preventDefault();
      stopPianoSound(midiCode);
    }, { passive: false });
  });

  document.addEventListener("keydown", function (e) {
    const key = e.key.toLowerCase();
    if (emulatedKeys.hasOwnProperty(key)) {
      playOscillator(emulatedKeys[key]);
    }
  });

  document.addEventListener("keyup", function (e) {
    const key = e.key.toLowerCase();
    if (emulatedKeys.hasOwnProperty(key)) {
      stopOscillator(emulatedKeys[key]);
    }
  });

  function handleMIDIMessage(m) {
    const [status, note, velocity] = m.data;

    if (status === 144) {
      if (velocity > 0) playPianoSound(note);
      else stopPianoSound(note);
    } else if (status === 128) {
      stopPianoSound(note);
    }
  }

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then((access) => {
      access.inputs.forEach((input) => {
        input.onmidimessage = handleMIDIMessage;
      });

      access.onstatechange = () => {
        access.inputs.forEach((input) => {
          input.onmidimessage = handleMIDIMessage;
        });
      };
    }).catch(() => {

    });
  }
};
