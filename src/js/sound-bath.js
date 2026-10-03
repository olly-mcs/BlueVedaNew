// Sound bath player: the sticky play / pause / stop / volume control on every page.
//
// Browsers only allow sound after the visitor interacts with the page, so the
// sound bath starts on the first click, tap or key press. After that it carries
// on from the same spot on each new page (Chrome allows this straight away;
// Safari waits for the next tap). Pausing or stopping is remembered, so the
// site stays quiet until the visitor presses play again.
(function () {
  var player = document.querySelector(".sound-player");
  if (!player) return;

  var STATE_KEY = "bluveda-sound"; // localStorage: { off, volume }
  var POS_KEY = "bluveda-sound-position"; // sessionStorage: seconds
  var FADE_EDGE = 4; // seconds faded at the start and end of each loop

  var playBtn = player.querySelector(".sound-player__play");
  var stopBtn = player.querySelector(".sound-player__stop");
  var volToggle = player.querySelector(".sound-player__vol-toggle");
  var slider = player.querySelector(".sound-player__slider input");

  var state = read(localStorage, STATE_KEY, { off: false, volume: 0.4 });
  var audio = new Audio(player.getAttribute("data-src"));
  audio.preload = "none";
  audio.loop = true;

  var ctx, gain; // Web Audio, so volume also works on iPhone
  var playing = false;
  var waitingForGesture = false;
  var lastSave = 0;

  slider.value = Math.round(state.volume * 100);

  function read(store, key, fallback) {
    try {
      var value = JSON.parse(store.getItem(key));
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }
  function write(store, key, value) {
    try { store.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function setupAudioGraph() {
    if (ctx || !(window.AudioContext || window.webkitAudioContext)) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      ctx = gain = null;
    }
  }

  // Volume follows the slider, eased in and out near the loop point.
  function targetLevel() {
    if (!playing) return 0;
    var t = audio.currentTime, d = audio.duration;
    var edge = isFinite(d) && d > 0 ? Math.min(t, d - t) : FADE_EDGE;
    return state.volume * Math.max(0, Math.min(1, edge / FADE_EDGE));
  }
  function applyLevel(seconds) {
    var level = targetLevel();
    if (gain) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(level, ctx.currentTime, seconds || 0.25);
    } else {
      audio.volume = level;
    }
  }

  function render() {
    player.classList.toggle("is-playing", playing);
    playBtn.setAttribute("aria-label", playing ? "Pause sound bath" : "Play sound bath");
    playBtn.setAttribute("aria-pressed", String(playing));
  }

  function start() {
    setupAudioGraph();
    if (ctx && ctx.state === "suspended") ctx.resume();
    var resumeAt = read(sessionStorage, POS_KEY, 0);
    if (resumeAt && !audio.currentTime) {
      audio.addEventListener("loadedmetadata", function seek() {
        audio.removeEventListener("loadedmetadata", seek);
        if (resumeAt < audio.duration) audio.currentTime = resumeAt;
      });
    }
    var attempt = audio.play();
    if (attempt && attempt.then) {
      attempt.then(function () {
        // The audio engine can stay suspended without a click; don't play silently.
        if (!ctx || ctx.state === "running") return begin();
        ctx.resume();
        setTimeout(function () {
          if (ctx.state === "running") begin(); else blocked();
        }, 400);
      }, blocked);
    } else {
      begin();
    }
  }
  function begin() {
    playing = true;
    render();
    applyLevel(1);
  }
  function blocked() {
    audio.pause();
    playing = false;
    render();
    waitForGesture();
  }

  function halt(reset) {
    playing = false;
    render();
    applyLevel(0.15);
    setTimeout(function () {
      if (playing) return;
      audio.pause();
      if (reset) {
        audio.currentTime = 0;
        write(sessionStorage, POS_KEY, 0);
      }
    }, 600);
  }

  // Start on the first click, tap or key press anywhere except the player itself.
  function onGesture(event) {
    if (player.contains(event.target)) return;
    stopWaiting();
    if (!state.off && !playing) start();
  }
  function waitForGesture() {
    if (waitingForGesture) return;
    waitingForGesture = true;
    ["pointerdown", "keydown", "touchend"].forEach(function (type) {
      document.addEventListener(type, onGesture, true);
    });
  }
  function stopWaiting() {
    waitingForGesture = false;
    ["pointerdown", "keydown", "touchend"].forEach(function (type) {
      document.removeEventListener(type, onGesture, true);
    });
  }

  playBtn.addEventListener("click", function () {
    stopWaiting();
    state.off = playing;
    write(localStorage, STATE_KEY, state);
    if (playing) halt(false); else start();
  });

  stopBtn.addEventListener("click", function () {
    stopWaiting();
    state.off = true;
    write(localStorage, STATE_KEY, state);
    halt(true);
  });

  volToggle.addEventListener("click", function () {
    var open = player.classList.toggle("is-volume-open");
    volToggle.setAttribute("aria-expanded", String(open));
    if (open) slider.focus();
  });
  document.addEventListener("click", function (event) {
    if (!player.contains(event.target) && player.classList.contains("is-volume-open")) {
      player.classList.remove("is-volume-open");
      volToggle.setAttribute("aria-expanded", "false");
    }
  });

  slider.addEventListener("input", function () {
    state.volume = slider.value / 100;
    player.classList.toggle("is-muted", state.volume === 0);
    write(localStorage, STATE_KEY, state);
    applyLevel(0.05);
  });
  player.classList.toggle("is-muted", state.volume === 0);

  audio.addEventListener("timeupdate", function () {
    applyLevel();
    var now = Date.now();
    if (now - lastSave > 2000) {
      lastSave = now;
      write(sessionStorage, POS_KEY, audio.currentTime);
    }
  });
  window.addEventListener("pagehide", function () {
    if (audio.currentTime) write(sessionStorage, POS_KEY, audio.currentTime);
  });

  render();
  if (!state.off) {
    // Carry on straight away if the browser allows it, otherwise wait for a click.
    if (read(sessionStorage, POS_KEY, 0)) start(); else waitForGesture();
  }
})();
