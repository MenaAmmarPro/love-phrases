"use strict";

(function () {
  var PHRASES = [
    "You make the ordinary feel like it was made for us.",
    "I like the way the world looks when I am thinking of you.",
    "A little text from you lights up my whole day.",
    "Your laugh is my favourite sound, always.",
    "I still get butterflies thinking of you.",
    "Thank you for being the soft place to land.",
    "The distance is real, but us — that is realer.",
    "I would pick one minute with you over anything else.",
    "Your kindness sneaks right into my heart.",
    "You are the first thing I want to tell good news to.",
    "You are my quiet joy.",
    "I love how we say nothing and still understand.",
    "You make white days feel golden.",
    "You are my favourite 'us'.",
    "Every new day I am glad it has you in it.",
    "You are the warmth I carry with me.",
    "I choose you, every single day.",
    "Your heart is my favourite place.",
    "You make me braver in the softest way.",
    "I could stare at your messages all day.",
    "You are the exhalation after a long day.",
    "You are poetry I get to hold.",
    "You make pizza taste better, and that is saying a lot.",
    "I love the way you care — quietly and fully.",
    "You are home, no matter how far.",
    "I smile to myself when I think of you.",
    "You are the sun through my window.",
    "Talking to you untangles my thoughts.",
    "You make me feel seen in all the right ways.",
    "You are the answer to a question I didn't know to ask."
  ];

  var LS = "mena-phrases";
  var state = {
    drawn: 0,
    last: 0,
    pocket: []
  };

  var currentIndex = null;

  function $(id) { return document.getElementById(id); }

  function load() {
    try {
      var raw = window.localStorage.getItem(LS);
      if (!raw) return;
      var p = JSON.parse(raw);
      state.drawn = p.drawn | 0;
      state.last = p.last | 0;
      state.pocket = Array.isArray(p.pocket) ? p.pocket.slice(0, 30) : [];
    } catch (e) {}
  }

  function save() {
    try {
      window.localStorage.setItem(LS, JSON.stringify(state));
    } catch (e) {}
  }

  function pick(except) {
    var idx;
    var tries = 0;
    do {
      idx = Math.floor(Math.random() * PHRASES.length);
      tries++;
      if (tries > 100) break;
    } while (PHRASES.length > 1 && except !== null && idx === except);
    return idx;
  }

  function draw() {
    currentIndex = pick(currentIndex);
    $("phrase").textContent = PHRASES[currentIndex];
    state.drawn++;
    state.last = Date.now();
    save();
    renderStats();
    $("note").textContent = "One for you \u2665";
  }

  function renderStats() {
    $("drawn").textContent = String(state.drawn);
    $("last").textContent = state.last ? fmtDate(state.last) : "never";
    $("favs").textContent = String(state.pocket.length);
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
  }

  function copy() {
    if (currentIndex === null) { $("note").textContent = "Draw one first \u2665"; return; }
    var text = PHRASES[currentIndex];
    function ok() { $("note").textContent = "Copied — send it to her \u2665"; }
    function bad() { $("note").textContent = "Copy this: " + text; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, bad);
      } else bad();
    } catch (e) { bad(); }
  }

  function share() {
    if (currentIndex === null) { $("note").textContent = "Draw one first \u2665"; return; }
    var url;
    try {
      url = window.location.origin + window.location.pathname + "?p=" + currentIndex;
    } catch (e) { url = "?p=" + currentIndex; }
    function ok() { $("note").textContent = "Link copied \u2014 send it now \u2665"; }
    function bad() { $("note").textContent = "Copy this link: " + url; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(ok, bad);
      } else bad();
    } catch (e) { bad(); }
  }

  function keep() {
    if (currentIndex === null) return;
    var text = PHRASES[currentIndex];
    if (state.pocket.indexOf(text) >= 0) {
      $("note").textContent = "Already in your pocket \u2665"; return;
    }
    state.pocket.unshift(text);
    if (state.pocket.length > 30) state.pocket = state.pocket.slice(0, 30);
    save();
    renderPocket();
    $("note").textContent = "Kept in pocket \u2665";
  }

  function renderPocket() {
    var list = $("pocket");
    list.textContent = "";
    renderStats();
    if (!state.pocket.length) {
      var li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Your pocket is empty — keep the ones you love.";
      list.appendChild(li);
      return;
    }
    state.pocket.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      list.appendChild(li);
    });
  }

  function clearPocket() {
    state.pocket = [];
    save();
    renderPocket();
    $("note").textContent = "Pocket cleared.";
  }

  function readArrival() {
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { return false; }
    var p = params.get("p");
    if (p === null) return false;
    var idx = Number(p);
    if (!(idx >= 0 && idx < PHRASES.length)) return false;
    currentIndex = idx;
    $("phrase").textContent = PHRASES[currentIndex];
    $("arrive-note").textContent = "Ammar sent you this phrase \u2665";
    $("arrive-note").hidden = false;
    state.drawn++;
    state.last = Date.now();
    save();
    return true;
  }

  function boot() {
    load();
    var arrived = readArrival();
    if (!arrived && currentIndex === null) {
      currentIndex = pick(null);
      $("phrase").textContent = PHRASES[currentIndex];
      state.drawn++;
      state.last = Date.now();
      save();
    }
    renderStats();
    renderPocket();
    $("draw").addEventListener("click", draw);
    $("copy").addEventListener("click", copy);
    $("keep").addEventListener("click", keep);
    $("share").addEventListener("click", share);
    $("clear").addEventListener("click", clearPocket);

    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      try { navigator.serviceWorker.register("sw.js"); } catch (e) {}
    }
  }

  boot();
})();
