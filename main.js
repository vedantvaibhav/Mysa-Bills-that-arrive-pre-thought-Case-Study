/* ============================================================
   Mysa Case Study — main.js
   1. IntersectionObserver scroll reveals (fade up)
   2. Count-up for the 99% stat when it enters view
   3. Mobile hamburger nav
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 0. Always reload from the top ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------- 1. Scroll reveals ----------
     Apply a subtle fade-up to each section's direct children, with a
     gentle stagger within each section so headline → body → image
     cascade smoothly into view. */
  function initReveals() {
    var sections = document.querySelectorAll(".sec");
    if (!sections.length) return;

    var items = [];
    sections.forEach(function (sec) {
      Array.prototype.forEach.call(sec.children, function (child, i) {
        child.classList.add("reveal");
        // capped stagger for elements that enter together
        child.style.transitionDelay = Math.min(i, 3) * 0.12 + "s";
        items.push(child);
      });
    });

    if (reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    // Reveal an element once its top edge scrolls into the lower ~88% of
    // the viewport. Runs on load (above-the-fold reveals immediately) and
    // on scroll. No IntersectionObserver dependency — reliable everywhere.
    function check() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var j = items.length - 1; j >= 0; j--) {
        var r = items[j].getBoundingClientRect();
        if (r.top < vh * 0.88) {
          items[j].classList.add("is-visible");
          items.splice(j, 1);
        }
      }
    }

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    window.addEventListener("load", check);  // re-check once images settle layout
  }

  /* ---------- 2. Count-up stat ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (c) { c.textContent = c.dataset.target; });
      return;
    }

    function run(el) {
      var target = parseInt(el.dataset.target, 10) || 0;
      var duration = 1500;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (c) { obs.observe(c); });
  }

  /* ---------- 3. Mobile hamburger nav ---------- */
  function initNav() {
    var nav = document.querySelector(".topnav");
    var toggle = document.querySelector(".topnav__toggle");
    if (!nav || !toggle) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("topnav--open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // close the menu after a link is tapped or on tap outside
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".topnav__links a")) {
        nav.classList.remove("topnav--open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) {
        nav.classList.remove("topnav--open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function init() {
    initReveals();
    initCounters();
    initNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
