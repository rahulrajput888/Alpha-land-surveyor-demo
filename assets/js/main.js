/* ==========================================================================
   Alpha Land Surveys — interface script
   loader · header · drawer · reveals · counters · rotator · 3D tilt
   parallax · flip cards · reviews carousel · FAQ · enquiry form · video slot
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none)").matches;
  var WA = "918460238311";                     // WhatsApp number (digits only)

  /* ------------------------------------------------------------ store ---- */
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      if (val === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ toast ---- */
  var toastEl = $("#toast"), toastT = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastT);
    toastT = window.setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }
  window.alsToast = toast;

  /* ----------------------------------------------------------- loader ---- */
  (function loader() {
    var el = $("#loader"), count = $("#loaderCount");
    if (!el) return;
    var start = performance.now(), DUR = 1700;
    (function tick(now) {
      var p = Math.min(1, now - start >= 0 ? (now - start) / DUR : 1);
      if (count) count.textContent = Math.round(p * 100) + "%";
      if (p < 1) window.requestAnimationFrame(tick);
      else {
        el.classList.add("is-done");
        root.classList.add("is-ready");
        window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 760);
      }
    })(start);
  })();

  /* theme: single light theme only (dark mode removed on client request) */
  root.setAttribute("data-theme","light"); localStorage.removeItem("als_theme");

  /* ----------------------------------------------------- header / nav ---- */
  var header = $("#header"), fab = $("#fab"), ticking = false, yNow = 0;
  var yPrev = 0;
  function onScroll() {
    yNow = window.scrollY || window.pageYOffset;
    if (header) {
      header.classList.toggle("is-stuck", yNow > 10);
      var down = yNow > yPrev + 4, up = yNow < yPrev - 4;
      if (down && yNow > 360 && !document.body.classList.contains("drawer-open")) header.classList.add("is-hidden");
      else if (up || yNow < 120) header.classList.remove("is-hidden");
    }
    if (fab) fab.classList.toggle("show", yNow > 620);
    yPrev = yNow; ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (fab) fab.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* active section in the nav */
  (function activeNav() {
    var links = $$(".nav a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var live = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { live[e.target.id] = e.isIntersecting; });
      links.forEach(function (a) { a.removeAttribute("aria-current"); });
      var ids = Object.keys(live).filter(function (k) { return live[k]; });
      if (!ids.length) return;
      ids.sort(function (a, b) { return document.getElementById(a).getBoundingClientRect().top - document.getElementById(b).getBoundingClientRect().top; });
      var a = map[ids[0]]; if (a) a.setAttribute("aria-current", "true");
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* ----------------------------------------------------------- drawer ---- */
  var drawer = $("#drawer"), burger = $("#burger");
  function openDrawer() {
    document.body.classList.add("drawer-open");
    if (!drawer) return;
    drawer.classList.add("open");
    if (burger) { burger.classList.add("is-open"); burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Close menu"); }
    document.body.classList.add("no-scroll");
  }
  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    if (!drawer) return;
    drawer.classList.remove("open");
    if (burger) { burger.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Open menu"); }
    document.body.classList.remove("no-scroll");
  }
  if (burger) burger.addEventListener("click", function () { drawer && drawer.classList.contains("open") ? closeDrawer() : openDrawer(); });
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest && t.closest("[data-close]")) closeDrawer();
      var a = t.closest ? t.closest("a[href^='#']") : null;
      if (a) closeDrawer();
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  /* ---------------------------------------------------------- reveals ---- */
  (function reveals() {
    var items = $$(".reveal, .reveal--fade");
    if (!items.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    /* hero pieces wait for the loader to lift so their entrance is actually seen */
    function arm() { items.forEach(function (el) { io.observe(el); }); }
    if (root.classList.contains("is-ready")) arm();
    else {
      var armed = false, mo = new MutationObserver(function () { if (root.classList.contains("is-ready") && !armed) { armed = true; mo.disconnect(); setTimeout(arm, 60); } });
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
      setTimeout(function () { if (!armed) { armed = true; mo.disconnect(); arm(); } }, 4200);
    }
  })();

  /* --------------------------------------------------------- counters ---- */
  (function counters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    function run(el) {
      var to = parseFloat(el.getAttribute("data-count")) || 0;
      var dec = (el.getAttribute("data-dec") | 0), suffix = el.getAttribute("data-suffix") || "";
      var dur = 1300, t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        var v = to * e;
        el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-IN")) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      })(t0);
    }
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-count")) || 0;
      el.textContent = Math.round(to).toLocaleString("en-IN") + (el.getAttribute("data-suffix") || "");
    }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------- rotator ---- */
  (function rotator() {
    var words = $$(".rotator .swap");
    if (words.length < 2) return;
    var i = 0;
    if (reduce) return;
    window.setInterval(function () {
      words[i].classList.remove("on"); words[i].classList.add("off");
      i = (i + 1) % words.length;
      words[i].classList.remove("off"); words[i].classList.add("on");
    }, 2500);
  })();

  /* ------------------------------------------------------------ 3D tilt -- */
  (function tilt() {
    if (touch || reduce) return;
    $$("[data-tilt]").forEach(function (card) {
      var lim = parseFloat(card.getAttribute("data-tilt")) || 8;
      var raf = 0, tx = 0, ty = 0;
      function apply() {
        raf = 0;
        card.style.setProperty("--rx", (-ty * lim).toFixed(2) + "deg");
        card.style.setProperty("--ry", (tx * lim).toFixed(2) + "deg");
      }
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        if (!raf) raf = window.requestAnimationFrame(apply);
      }, { passive: true });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  })();

  /* --------------------------------------------------------- parallax ---- */
  (function parallax() {
    var items = $$("[data-par]");
    if (!items.length || reduce) return;
    var ticking = false;
    function upd() {
      ticking = false;
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var k = parseFloat(el.getAttribute("data-par")) || 0.1;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = "translate3d(0," + (-mid * k).toFixed(1) + "px,0)";
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  })();

  /* ------------------------------------------------------- flip cards ---- */
  (function flips() {
    $$("[data-flip]").forEach(function (card) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-pressed", "false");
      card.addEventListener("click", function () {
        var on = card.classList.toggle("is-flipped");
        card.setAttribute("aria-pressed", on ? "true" : "false");
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
        if (e.key === "Escape") { card.classList.remove("is-flipped"); card.setAttribute("aria-pressed", "false"); }
      });
    });
  })();

  /* ---------------------------------------------------- review slider ---- */
  (function reviews() {
    var vp = $("#rvViewport"), idx = $("#rvIdx"), dots = $$("[data-rv]");
    if (!vp) return;
    function setIdx(i) {
      if (idx) idx.textContent = ("0" + (i + 1)).slice(-2);
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === i); });
    }
    var t = 0;
    vp.addEventListener("scroll", function () {
      window.clearTimeout(t);
      t = window.setTimeout(function () {
        var cards = $$(".rv", vp); if (!cards.length) return;
        var vr = vp.getBoundingClientRect(), mid = vr.left + vr.width / 2, best = 0, bd = Infinity;
        cards.forEach(function (c, i) {
          var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bd) { bd = d; best = i; }
        });
        setIdx(best);
      }, 90);
    }, { passive: true });
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () {
        var c = $$(".rv", vp)[i];
        if (c) vp.scrollTo({ left: c.offsetLeft - vp.offsetLeft - 8, behavior: reduce ? "auto" : "smooth" });
      });
    });
    $$("[data-rvstep]").forEach(function (b) {
      b.addEventListener("click", function () {
        var step = parseInt(b.getAttribute("data-rvstep"), 10) || 1;
        vp.scrollBy({ left: step * (vp.clientWidth * 0.86), behavior: reduce ? "auto" : "smooth" });
      });
    });
  })();

  /* ------------------------------------------------------------- FAQ ----- */
  $$(".faq__item").forEach(function (item) {
    var btn = $(".faq__q", item), ans = $(".faq__a", item);
    if (!btn || !ans) return;
    btn.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      $$(".faq__item").forEach(function (f) {
        f.classList.remove("is-open");
        var b = $(".faq__q", f), a = $(".faq__a", f);
        if (b) b.setAttribute("aria-expanded", "false");
        if (a) a.style.maxHeight = "0px";
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        ans.style.maxHeight = (ans.scrollHeight + 16) + "px";
      }
    });
  });

  /* ------------------------------------------------ scroll motion graphics --
     progress bar · process timeline fill · scroll-drawn contour lines ·
     velocity-reactive marquee · clip-path wipes */
  (function scrollMotion() {
    var bar = $("#progressBar");
    var fill = $("#stepsFill"), steps = $$("[data-step]"), track = $("#stepsTrack");
    var contours = $$("[data-contour]"), covSec = $("#coverage");
    var mq = $("#marqueeTrack");
    var vh = window.innerHeight, doc = document.documentElement;

    contours.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L; });

    var lastY = window.pageYOffset, vel = 0, mqX = 0, rafOn = false;
    function frame() {
      rafOn = false;
      var y = window.pageYOffset;
      vel = vel * 0.86 + (y - lastY) * 0.14; lastY = y;

      if (bar) { var max = doc.scrollHeight - vh; bar.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + "%"; }

      if (track && fill && steps.length) {
        var r = track.getBoundingClientRect();
        var p = (vh * 0.62 - r.top) / r.height; p = Math.max(0, Math.min(1, p));
        fill.style.setProperty("--p", p.toFixed(3));
        steps.forEach(function (s, i) {
          var sr = s.getBoundingClientRect();
          s.classList.toggle("is-on", sr.top + sr.height * 0.4 < vh * 0.64);
        });
      }

      if (contours.length && covSec) {
        var cr = covSec.getBoundingClientRect();
        var cp = (vh - cr.top) / (cr.height + vh * 0.4); cp = Math.max(0, Math.min(1, cp));
        contours.forEach(function (pth, i) {
          var L = +pth.dataset.len, local = Math.max(0, Math.min(1, cp * 1.6 - i * 0.12));
          pth.style.strokeDashoffset = L * (1 - local);
        });
      }
    }
    /* sticky service cards: the ones already stacked shrink + dim slightly → depth */
    var stackCards = $$(".services--stack .svc"), stackOn = window.matchMedia("(min-width:821px)");
    function stackDepth() {
      if (!stackCards.length || !stackOn.matches) return;
      for (var i = 0; i < stackCards.length; i++) {
        var card = stackCards[i], next = stackCards[i + 1];
        if (!next) { card.style.transform = ""; card.style.filter = ""; continue; }
        var cb = card.getBoundingClientRect(), nb = next.getBoundingClientRect();
        var overlap = Math.max(0, Math.min(1, (cb.bottom - nb.top) / (cb.height * 0.9)));
        var sc = 1 - overlap * 0.05, br = 1 - overlap * 0.08;
        card.style.transform = overlap > 0 ? "scale(" + sc.toFixed(4) + ")" : "";
        card.style.filter = overlap > 0 ? "brightness(" + br.toFixed(3) + ")" : "";
      }
    }
    function onScroll() { if (!rafOn) { rafOn = true; requestAnimationFrame(function () { frame(); stackDepth(); }); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { vh = window.innerHeight; onScroll(); });
    frame();

    /* marquee: base drift via CSS; scroll velocity adds a push in the scroll direction */
    if (mq && !reduce) {
      mq.style.animation = "none";
      var half = 0;
      function measure() { half = mq.scrollWidth / 2; }
      measure(); window.addEventListener("resize", measure);
      (function loop() {
        var speed = 0.55 + Math.min(6, Math.abs(vel) * 0.09);
        mqX -= speed * (vel < -0.5 ? -1 : 1);
        if (half > 0) { if (mqX <= -half) mqX += half; if (mqX > 0) mqX -= half; }
        mq.style.transform = "translate3d(" + mqX.toFixed(2) + "px,0,0)";
        vel *= 0.94;
        requestAnimationFrame(loop);
      })();
    }

    /* clip-path wipes ride on the existing reveal observer (is-in class) — nothing extra needed */
  })();


  /* --------------------------------------------- hero survey HUD ticker --
     Coordinates drift gently; moving the pointer over the stage "re-measures"
     and the crosshair follows. Pure cosmetics, zero dependencies. */
  (function hudTicker() {
    var lat = $("#hudLat"), lng = $("#hudLng"), sat = $("#hudSat"), stage = $("#stage"), cross = $("#cross");
    if (!lat || !lng) return;
    var la = 28.70412, ln = 77.10251, tla = la, tln = ln, t = 0, s = 21;
    function fmt(v, suf) { return v.toFixed(5) + "° " + suf; }
    function tick() {
      t++;
      if (t % 90 === 0) { tla = 28.70412 + (Math.random() - .5) * 0.0004; tln = 77.10251 + (Math.random() - .5) * 0.0004; }
      if (t % 240 === 0 && sat) { s = 19 + Math.floor(Math.random() * 5); sat.textContent = s; }
      la += (tla - la) * 0.04; ln += (tln - ln) * 0.04;
      lat.textContent = fmt(la, "N"); lng.textContent = fmt(ln, "E");
      if (!document.hidden) requestAnimationFrame(tick);
    }
    if (!reduce) requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", function () { if (!document.hidden && !reduce) requestAnimationFrame(tick); });
    if (stage && cross && !touch && !reduce) {
      stage.addEventListener("pointermove", function (e) {
        var r = stage.querySelector(".stage__main").getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        if (x < 0 || x > 1 || y < 0 || y > 1) return;
        cross.style.animation = "none";
        cross.style.transform = "translate(" + (x * 700).toFixed(1) + "px," + (y * 500).toFixed(1) + "px)";
        tla = 28.70412 + (0.5 - y) * 0.0012; tln = 77.10251 + (x - 0.5) * 0.0012;
      }, { passive: true });
      stage.addEventListener("pointerleave", function () { cross.style.animation = ""; cross.style.transform = ""; });
    }
  })();

  /* -------------------------------------------- headings: word split ---- */
  (function splitWords() {
    if (reduce) return;
    $$(".section-head h2").forEach(function (h2) {
      if (h2.dataset.split) return;
      var i = 0;
      function wrap(node) {
        if (node.nodeType === 3) {
          var parts = node.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var s = document.createElement("span"); s.textContent = p; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.tagName !== "BR") {
          Array.prototype.slice.call(node.childNodes).forEach(wrap);
        }
      }
      Array.prototype.slice.call(h2.childNodes).forEach(wrap);
      h2.dataset.split = "1";
    });
  })();

  /* ------------------------------------------------ magnetic buttons ---- */
  (function magnetic() {
    if (touch || reduce) return;
    $$(".hero__cta .btn, .header .btn--accent, .cta-band .btn").forEach(function (b) {
      b.setAttribute("data-mag", "");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.22).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  })();

  /* ------------------------------------------- reviews: auto-advance ---- */
  (function autoReviews() {
    var vp = $("#rvViewport"); if (!vp || reduce) return;
    var bar = document.createElement("div"); bar.className = "reviews__bar"; bar.innerHTML = "<i></i>";
    vp.parentNode.insertBefore(bar, vp.nextSibling);
    var fill = bar.firstChild, p = 0, paused = false, visible = false, DUR = 5200, last = performance.now();
    ["pointerenter", "touchstart", "focusin"].forEach(function (ev) { vp.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["pointerleave", "touchend", "focusout"].forEach(function (ev) { vp.addEventListener(ev, function () { paused = false; }, { passive: true }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(vp);
    function next() {
      var cards = $$(".rv", vp); if (!cards.length) return;
      var vr = vp.getBoundingClientRect(), mid = vr.left + vr.width / 2, cur = 0, bd = Infinity;
      cards.forEach(function (c, i) { var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; cur = i; } });
      var n = cards[(cur + 1) % cards.length];
      vp.scrollTo({ left: n.offsetLeft - vp.offsetLeft - 8, behavior: "smooth" });
    }
    (function loop(now) {
      var dt = now - last; last = now;
      if (visible && !paused && !document.hidden) { p += dt / DUR; if (p >= 1) { p = 0; next(); } }
      fill.style.width = (p * 100).toFixed(1) + "%";
      requestAnimationFrame(loop);
    })(performance.now());
  })();

  /* ------------------------------------------------------------ form ----- */
  (function form() {
    var f = $("#enquiryForm");
    if (!f) return;
    var ok = $("#formOk");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = ($("#fName") || {}).value || "";
      var phone = ($("#fPhone") || {}).value || "";
      var service = ($("#fService") || {}).value || "";
      var place = ($("#fPlace") || {}).value || "";
      var msg = ($("#fMsg") || {}).value || "";
      if (!name.trim() || phone.replace(/\D/g, "").length < 10) {
        toast("Naam aur 10-digit mobile number daal do.");
        return;
      }
      var text = "Hello Alpha Land Surveys,\n"
        + "Name: " + name + "\n"
        + "Phone: " + phone + "\n"
        + "Service: " + service + "\n"
        + (place ? "Location: " + place + "\n" : "")
        + (msg ? "Details: " + msg + "\n" : "")
        + "Please share a quote and site-visit time.";
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      if (ok) { ok.classList.add("show"); }
      toast("WhatsApp par enquiry khul gayi — bas Send dabana hai.");
    });
  })();

  /* ------------------------------------------------------- phone links --- */
  $$("[data-wa]").forEach(function (a) {
    a.setAttribute("href", "https://wa.me/" + WA + "?text=" + encodeURIComponent(a.getAttribute("data-wa")));
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });

  /* ------------------------------------------------------------ misc ----- */
  $$(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* anchor clicks: smooth scroll with header offset (CSS scroll-margin does the math) */
  $$("a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      try { history.replaceState(null, "", id); } catch (err) {}
    });
  });
})();
