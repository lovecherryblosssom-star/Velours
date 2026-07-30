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
    ".vlrs-section-head, .vlrs-card, .vlrs-ritual-step, .vlrs-suite, .vlrs-journal-card, .vlrs-pool, .vlrs-gallery-figure"
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
  var toastText = document.getElementById("vlrsToastText");

  function showToast(message) {
    toastText.textContent = message;
    if (window.bootstrap) {
      var toast = window.bootstrap.Toast.getOrCreateInstance(toastEl);
      toast.show();
    }
  }

  newsletter.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = newsletter.querySelector("input");
    if (!input.value || !input.checkValidity()) {
      input.reportValidity();
      return;
    }
    showToast("Thank you — you're on the list.");
    newsletter.reset();
  });

  /* ---- Account: Sign In / Create Account ----
     This site has no backend (it's static files on GitHub Pages), so these
     forms don't create or check real accounts — there's nowhere for the
     data to go. They validate, give normal-feeling feedback, and reset.
     If real accounts are ever needed, this is the spot to wire up a
     backend/auth provider and swap these handlers for real API calls. */
  var accountModalEl = document.getElementById("accountModal");

  var signInForm = document.getElementById("signInForm");
  signInForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!signInForm.checkValidity()) {
      signInForm.reportValidity();
      return;
    }
    if (window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(accountModalEl).hide();
    }
    showToast("Signed in — welcome back.");
    signInForm.reset();
  });

  var signUpForm = document.getElementById("signUpForm");
  signUpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!signUpForm.checkValidity()) {
      signUpForm.reportValidity();
      return;
    }
    if (window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(accountModalEl).hide();
    }
    showToast("Account created — welcome to Velours.");
    signUpForm.reset();
  });

  /* ---- Journal pagination: swaps which 3 entries are visible ---- */
  var journalItems = document.querySelectorAll(".vlrs-journal-item");
  var paginationEl = document.getElementById("journalPagination");
  var pageLinks = paginationEl.querySelectorAll("li[data-page]");
  var prevBtn = paginationEl.querySelector('li[data-role="prev"]');
  var nextBtn = paginationEl.querySelector('li[data-role="next"]');
  var totalPages = pageLinks.length;
  var currentPage = 1;

  function showJournalPage(page) {
    currentPage = page;

    journalItems.forEach(function (item) {
      var match = item.getAttribute("data-page") === String(page);
      item.classList.toggle("d-none", !match);
    });

    pageLinks.forEach(function (li) {
      var isActive = li.getAttribute("data-page") === String(page);
      li.classList.toggle("active", isActive);
      if (isActive) {
        li.setAttribute("aria-current", "page");
      } else {
        li.removeAttribute("aria-current");
      }
    });

    prevBtn.classList.toggle("disabled", page === 1);
    nextBtn.classList.toggle("disabled", page === totalPages);
  }

  pageLinks.forEach(function (li) {
    li.querySelector(".page-link").addEventListener("click", function (e) {
      e.preventDefault();
      showJournalPage(parseInt(li.getAttribute("data-page"), 10));
    });
  });

  prevBtn.querySelector(".page-link").addEventListener("click", function (e) {
    e.preventDefault();
    if (currentPage > 1) showJournalPage(currentPage - 1);
  });

  nextBtn.querySelector(".page-link").addEventListener("click", function (e) {
    e.preventDefault();
    if (currentPage < totalPages) showJournalPage(currentPage + 1);
  });

});