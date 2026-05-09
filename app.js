(() => {
  'use strict';
  const VERSION = '10.13.5';
  const $ = (id) => document.getElementById(id);

  const state = {
    score: Number(localStorage.getItem('outmaster_score') || 0),
    mode: localStorage.getItem('outmaster_mode') || 'button',
    bgmOn: localStorage.getItem('outmaster_bgm_on') === 'true',
    bgmVolume: Number(localStorage.getItem('outmaster_bgm_volume') || 0.35),
    seVolume: Number(localStorage.getItem('outmaster_se_volume') || 0.8),
  };

  const points = { single: 1, double: 2, triple: 3, bull: 5, good: 0, perfect: 0, miss: 0 };
  const labels = { single:'トッ', double:'トトッ', triple:'トトトッ', bull:'BULL!', good:'GOOD', perfect:'PERFECT!', miss:'MISS...' };
  const sounds = {};

  function setScreen(name) {
    const home = $('homeScreen');
    const settings = $('settingsScreen');
    home.classList.toggle('active', name === 'home');
    settings.classList.toggle('active', name === 'settings');
    home.setAttribute('aria-hidden', String(name !== 'home'));
    settings.setAttribute('aria-hidden', String(name !== 'settings'));
  }

  function updateScore() {
    $('score').textContent = state.score;
    localStorage.setItem('outmaster_score', String(state.score));
  }

  function playAudio(audio) {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = state.seVolume;
      audio.play().catch(() => {});
    } catch (_) {}
  }

  function hit(kind) {
    state.score += points[kind] || 0;
    $('message').textContent = labels[kind] || kind;
    updateScore();
    playAudio(sounds[kind]);
  }

  function applyMode(mode) {
    state.mode = mode;
    localStorage.setItem('outmaster_mode', mode);
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    $('message').textContent = `${mode.toUpperCase()} mode`;
  }

  function updateVolumes() {
    const bgm = $('bgm');
    bgm.volume = state.bgmVolume;
    Object.values(sounds).forEach(a => { if (a) a.volume = state.seVolume; });
    localStorage.setItem('outmaster_bgm_volume', String(state.bgmVolume));
    localStorage.setItem('outmaster_se_volume', String(state.seVolume));
  }

  function fadeBgm(to, ms = 700) {
    const bgm = $('bgm');
    const from = bgm.volume;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      bgm.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  async function toggleBgm() {
    const bgm = $('bgm');
    state.bgmOn = !state.bgmOn;
    localStorage.setItem('outmaster_bgm_on', String(state.bgmOn));
    if (state.bgmOn) {
      try {
        bgm.volume = 0;
        await bgm.play();
        fadeBgm(state.bgmVolume);
      } catch (_) {
        $('message').textContent = 'BGM blocked: tap again';
      }
    } else {
      fadeBgm(0);
      setTimeout(() => bgm.pause(), 750);
    }
  }

  async function clearPwaCache() {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      $('message').textContent = 'Cache cleared. Reloading...';
      setTimeout(() => location.reload(), 500);
    } catch (err) {
      $('message').textContent = 'Cache clear failed';
      console.error(err);
    }
  }

  function bind() {
    $('settingsBtn').addEventListener('click', () => setScreen('settings'));
    $('closeSettingsBtn').addEventListener('click', () => setScreen('home'));
    $('resetBtn').addEventListener('click', () => { state.score = 0; updateScore(); $('message').textContent = 'Reset!'; });
    $('bgmToggle').addEventListener('click', toggleBgm);
    $('clearCacheBtn').addEventListener('click', clearPwaCache);
    $('bgmVolume').addEventListener('input', (e) => { state.bgmVolume = Number(e.target.value); updateVolumes(); });
    $('seVolume').addEventListener('input', (e) => { state.seVolume = Number(e.target.value); updateVolumes(); });
    document.querySelectorAll('.target[data-hit]').forEach(btn => btn.addEventListener('click', () => hit(btn.dataset.hit)));
    document.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => applyMode(btn.dataset.mode)));
  }

  function initAudio() {
    sounds.single = $('seSingle'); sounds.double = $('seDouble'); sounds.triple = $('seTriple'); sounds.bull = $('seBull');
    sounds.good = $('seGood'); sounds.perfect = $('sePerfect'); sounds.miss = $('seMiss');
    $('bgmVolume').value = state.bgmVolume;
    $('seVolume').value = state.seVolume;
    updateVolumes();
  }

  async function registerSw() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register(`./sw.js?v=${VERSION}`);
      await reg.update();
    } catch (err) {
      console.warn('SW register/update failed', err);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    $('versionLabel').textContent = `v${VERSION}`;
    initAudio(); bind(); updateScore(); applyMode(state.mode); setScreen('home'); registerSw();
  });
})();
