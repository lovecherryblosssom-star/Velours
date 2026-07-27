/* =========================================================
   VELOURS — interactions
   Bootstrap's JS bundle handles the navbar collapse, dropdown,
   tabs, carousel, accordion, modal, offcanvas, and alert
   dismissal automatically via data attributes — nothing is
   duplicated here. This file covers: the scroll-aware nav,
   the two components Bootstrap requires manual init for
   (tooltips + popovers), gentle scroll reveals, and the two
   form confirmations (reservation modal + newsletter toast).
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* ---- Nav: switch from transparent-on-hero to solid once we scroll past it ---- */
  var nav = document.getElementById("vlrsNav");
  var hero = document.getElementById("hero");

  function updateNavState() {
    var heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 90) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  }
  updateNavState();
  window.addEventListener("scroll", updateNavState, { passive: true });

  /* ---- Close the mobile menu automatically after a link or button is tapped ---- */
  var navLinks = document.querySelectorAll(
    "#vlrsNavLinks .nav-link:not(.dropdown-toggle), #vlrsNavLinks .dropdown-item, #vlrsNavLinks .vlrs-btn"
  );
  var collapseEl = document.getElementById("vlrsNavLinks");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (collapseEl.classList.contains("show") && window.bootstrap) {
        var bsCollapse = window.bootstrap.Collapse.getOrCreateInstance(collapseEl);
        bsCollapse.hide();
      }
    });
  });

  /* ---- Tooltips & popovers: Bootstrap opts these in manually for performance ---- */
  if (window.bootstrap) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
      new window.bootstrap.Tooltip(el);
    });
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
      new window.bootstrap.Popover(el);
    });
  }

  /* ---- Gentle reveal-on-scroll for section headers and cards ---- */
  var revealTargets = document.querySelectorAll(
    ".vlrs-section-head, .vlrs-card, .vlrs-ritual-step, .vlrs-suite, .vlrs-journal-card, .vlrs-pool, .vlrs-gallery-item"
  );
  revealTargets.forEach(function (el) { el.classList.add("vlrs-reveal"); });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Reservation form: brief spinner, then a confirmation modal ---- */
  var form = document.getElementById("vlrsForm");
  var modalEl = document.getElementById("vlrsModal");
  var submitBtn = document.getElementById("vlrsSubmitBtn");
  var btnLabel = submitBtn.querySelector(".vlrs-btn-label");
  var btnSpinner = submitBtn.querySelector(".vlrs-btn-spinner");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    btnLabel.textContent = "Sending";
    btnSpinner.classList.remove("d-none");

    // Simulated request delay — in production this is where a real fetch() would go.
    window.setTimeout(function () {
      btnSpinner.classList.add("d-none");
      btnLabel.textContent = "Request Reservation";
      submitBtn.disabled = false;

      if (window.bootstrap) {
        var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
      form.reset();
    }, 850);
  });

  /* ---- Newsletter signup: confirm with a toast rather than a page reload ---- */
  var newsletter = document.getElementById("vlrsNewsletter");
  var toastEl = document.getElementById("vlrsToast");

  newsletter.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = newsletter.querySelector("input");
    if (!input.value || !input.checkValidity()) {
      input.reportValidity();
      return;
    }
    if (window.bootstrap) {
      var toast = window.bootstrap.Toast.getOrCreateInstance(toastEl);
      toast.show();
    }
    newsletter.reset();
  });

});