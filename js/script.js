(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var navLinks = siteNav ? siteNav.querySelectorAll('a[href^="#"]') : [];

  function getHeaderOffset() {
    return header ? header.offsetHeight : 0;
  }

  function closeNav() {
    if (!header || !navToggle || !siteNav) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Otvori meni");
    document.body.style.overflow = "";
  }

  function openNav() {
    if (!header || !navToggle || !siteNav) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Zatvori meni");
    document.body.style.overflow = "hidden";
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", toggleNav);

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 767px)").matches) {
          closeNav();
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function scrollToHash(hash, instant) {
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - 8;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: instant ? "auto" : "smooth",
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      var idEl = document.querySelector(href);
      if (!idEl) return;
      e.preventDefault();
      scrollToHash(href);
      if (history.pushState) {
        history.pushState(null, "", href);
      }
    });
  });

  if (window.location.hash) {
    window.addEventListener("load", function () {
      scrollToHash(window.location.hash, true);
    });
  }

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var form = document.getElementById("contact-form");
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var messageInput = document.getElementById("message");
  var nameError = document.getElementById("name-error");
  var emailError = document.getElementById("email-error");
  var messageError = document.getElementById("message-error");
  var formSuccess = document.getElementById("form-success");

  function setError(input, errorEl, message) {
    if (!input || !errorEl) return;
    input.classList.toggle("invalid", !!message);
    errorEl.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateForm() {
    var valid = true;

    var nameVal = nameInput ? nameInput.value.trim() : "";
    if (!nameVal) {
      setError(nameInput, nameError, "Unesite ime i prezime.");
      valid = false;
    } else {
      setError(nameInput, nameError, "");
    }

    var emailVal = emailInput ? emailInput.value.trim() : "";
    if (!emailVal) {
      setError(emailInput, emailError, "Unesite adresu e-pošte.");
      valid = false;
    } else if (!emailPattern.test(emailVal)) {
      setError(emailInput, emailError, "Unesite ispravnu adresu e-pošte.");
      valid = false;
    } else {
      setError(emailInput, emailError, "");
    }

    var messageVal = messageInput ? messageInput.value.trim() : "";
    if (!messageVal) {
      setError(messageInput, messageError, "Unesite poruku.");
      valid = false;
    } else {
      setError(messageInput, messageError, "");
    }

    return valid;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (formSuccess) {
        formSuccess.hidden = true;
      }
      if (!validateForm()) {
        var firstInvalid =
          (nameInput && nameInput.classList.contains("invalid") && nameInput) ||
          (emailInput && emailInput.classList.contains("invalid") && emailInput) ||
          (messageInput && messageInput.classList.contains("invalid") && messageInput);
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      if (formSuccess) {
        formSuccess.hidden = false;
      }
      form.reset();
      setError(nameInput, nameError, "");
      setError(emailInput, emailError, "");
      setError(messageInput, messageError, "");
    });
  }

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -40px 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox-img") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var lightboxPrev = lightbox ? lightbox.querySelector(".lightbox-prev") : null;
  var lightboxNext = lightbox ? lightbox.querySelector(".lightbox-next") : null;
  var galleryButtons = document.querySelectorAll(".gallery-item[data-lightbox]");
  var galleryImages = [];

  galleryButtons.forEach(function (btn, index) {
    var img = btn.querySelector("img");
    if (img) {
      galleryImages.push({ src: img.src, alt: img.alt || "Slika iz galerije" });
    }
    btn.addEventListener("click", function () {
      openLightbox(index);
    });
  });

  var currentIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || !galleryImages.length) return;
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    var item = galleryImages[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
    lightboxImg.alt = "";
    document.body.style.overflow = "";
  }

  function showPrev() {
    openLightbox(currentIndex - 1);
  }

  function showNext() {
    openLightbox(currentIndex + 1);
  }

  if (lightbox && lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
  if (lightboxNext) lightboxNext.addEventListener("click", showNext);

  document.addEventListener("keydown", function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });
})();
