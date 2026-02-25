/**
 * GANGA AARTI WEBSITE – SCRIPT.JS
 * Features: Navbar scroll, hamburger menu, scroll-reveal, particle canvas,
 *           gallery lightbox + filter, testimonials carousel, booking form validation, back-to-top
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     1. NAVBAR – scroll effect & active link
  ────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const offset = sec.offsetTop - 120;
      if (window.scrollY >= offset) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', () => {
    updateNavbar();
    updateActiveLink();
    updateBackToTop();
  }, { passive: true });

  updateNavbar();

  /* ──────────────────────────────────────────────
     2. HAMBURGER MENU
  ────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinksPanel = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinksPanel.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinksPanel.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksPanel.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ──────────────────────────────────────────────
     3. SCROLL-REVEAL (IntersectionObserver)
  ────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ──────────────────────────────────────────────
     4. PARTICLE CANVAS – floating golden sparks
  ────────────────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 60,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 1.2 + 0.4,
      speedX: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      hue: Math.random() > 0.5 ? 40 : 25, // gold or saffron
    };
  }

  for (let i = 0; i < 60; i++) {
    const p = createParticle();
    p.y = Math.random() * canvas.height; // scatter initial positions
    particles.push(p);
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 70%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.y -= p.speedY;
      p.x += p.speedX;
      p.opacity -= 0.003;

      if (p.y < -10 || p.opacity <= 0) {
        particles[i] = createParticle();
      }
    });
    animId = requestAnimationFrame(drawParticles);
  }

  // Only animate when hero is in view (performance)
  // Bug fix: guard against stacking multiple rAF loops if observer fires repeatedly
  let isAnimating = false;
  const heroSection = document.getElementById('home');
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!isAnimating) {
        isAnimating = true;
        drawParticles();
      }
    } else {
      isAnimating = false;
      cancelAnimationFrame(animId);
    }
  });
  heroObserver.observe(heroSection);

  /* ──────────────────────────────────────────────
     5. GALLERY – filter + lightbox
  ────────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentLightboxIndex = 0;
  let visibleItems = [];

  // Build initial visibleItems (all shown on load)
  galleryItems.forEach(item => visibleItems.push(item));

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      visibleItems = [];
      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        item.classList.toggle('hidden', !show);
        if (show) visibleItems.push(item);
      });
    });
  });

  // Open lightbox
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      currentLightboxIndex = visibleItems.indexOf(item);
      if (currentLightboxIndex < 0) return;
      openLightbox(currentLightboxIndex);
    });
  });

  function openLightbox(index) {
    const item = visibleItems[index];
    if (!item) return;
    lightboxImg.src = item.getAttribute('data-src');
    lightboxImg.alt = item.getAttribute('data-caption');
    lightboxCaption.textContent = item.getAttribute('data-caption');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  lightboxPrev.addEventListener('click', () => {
    currentLightboxIndex = (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
    openLightbox(currentLightboxIndex);
  });
  lightboxNext.addEventListener('click', () => {
    currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
    openLightbox(currentLightboxIndex);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });

  /* ──────────────────────────────────────────────
     6. TESTIMONIALS CAROUSEL
  ────────────────────────────────────────────── */
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const cards = track.querySelectorAll('.testimonial-card');

  let currentSlide = 0;
  let cardsPerView = getCardsPerView();
  let totalSlides = Math.max(1, cards.length - cardsPerView + 1);
  let autoPlayTimer;

  function getCardsPerView() {
    const w = window.innerWidth;
    if (w <= 600) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  // Build dots
  function buildDots() {
    cardsPerView = getCardsPerView();
    totalSlides = Math.max(1, cards.length - cardsPerView + 1);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    currentSlide = Math.min(Math.max(index, 0), totalSlides - 1);
    const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      const next = (currentSlide + 1) % totalSlides;
      goTo(next);
    }, 5000);
  }

  function stopAutoPlay() { clearInterval(autoPlayTimer); }

  prevBtn.addEventListener('click', () => { stopAutoPlay(); goTo(currentSlide - 1); startAutoPlay(); });
  nextBtn.addEventListener('click', () => { stopAutoPlay(); goTo(currentSlide + 1); startAutoPlay(); });

  window.addEventListener('resize', () => {
    cardsPerView = getCardsPerView();
    totalSlides = Math.max(1, cards.length - cardsPerView + 1);
    currentSlide = 0;
    buildDots();
    goTo(0);
  }, { passive: true });

  buildDots();
  startAutoPlay();

  /* ──────────────────────────────────────────────
     7. BOOKING FORM – validation + feedback
  ────────────────────────────────────────────── */
  const form = document.getElementById('bookingForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('bookingSubmit');

  // Set min date on the date picker to today
  const dateInput = document.getElementById('eventDate');
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  function showError(fieldId, message) {
    const errEl = document.getElementById(fieldId + 'Error');
    const input = document.getElementById(fieldId);
    if (errEl) errEl.textContent = message;
    if (input) input.style.borderColor = '#ff6b6b';
  }

  function clearError(fieldId) {
    const errEl = document.getElementById(fieldId + 'Error');
    const input = document.getElementById(fieldId);
    if (errEl) errEl.textContent = '';
    if (input) input.style.borderColor = '';
  }

  function validateForm() {
    let valid = true;
    const fields = ['name', 'phone', 'email', 'eventType', 'eventDate', 'location'];
    fields.forEach(f => clearError(f));

    const name = document.getElementById('name').value.trim();
    if (!name) { showError('name', 'Please enter your full name'); valid = false; }

    const phone = document.getElementById('phone').value.trim();
    if (!phone) { showError('phone', 'Please enter a phone number'); valid = false; }
    else if (!/^[+\d\s\-()]{7,20}$/.test(phone)) { showError('phone', 'Please enter a valid phone number'); valid = false; }

    const email = document.getElementById('email').value.trim();
    if (!email) { showError('email', 'Please enter your email address'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'Please enter a valid email address'); valid = false; }

    const eventType = document.getElementById('eventType').value;
    if (!eventType) { showError('eventType', 'Please select an event type'); valid = false; }

    const eventDate = document.getElementById('eventDate').value;
    if (!eventDate) { showError('eventDate', 'Please choose an event date'); valid = false; }

    const location = document.getElementById('location').value.trim();
    if (!location) { showError('location', 'Please enter the event location'); valid = false; }

    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Bug fix: hide any previous success message before re-validating
    formSuccess.hidden = true;
    if (!validateForm()) return;

    // Simulate submission
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    btnText.hidden = true;
    btnLoader.hidden = false;
    submitBtn.disabled = true;

    setTimeout(() => {
      btnText.hidden = false;
      btnLoader.hidden = true;
      submitBtn.disabled = false;
      formSuccess.hidden = false;
      form.reset();
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1800);
  });

  // Inline validation on blur
  // Bug fix: was calling validateForm() (all fields) on every blur — now only
  // validates & shows error for the individual field that lost focus.
  ['name', 'phone', 'email', 'eventType', 'eventDate', 'location'].forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.addEventListener('blur', () => {
      // Validate only this single field
      clearError(fieldId);
      const val = el.value.trim ? el.value.trim() : el.value;
      if (fieldId === 'name' && !val) showError('name', 'Please enter your full name');
      if (fieldId === 'phone') {
        if (!val) showError('phone', 'Please enter a phone number');
        else if (!/^[+\d\s\-()]{7,15}$/.test(val)) showError('phone', 'Please enter a valid phone number');
      }
      if (fieldId === 'email') {
        if (!val) showError('email', 'Please enter your email address');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) showError('email', 'Please enter a valid email address');
      }
      if (fieldId === 'eventType' && !el.value) showError('eventType', 'Please select an event type');
      if (fieldId === 'eventDate' && !el.value) showError('eventDate', 'Please choose an event date');
      if (fieldId === 'location' && !val) showError('location', 'Please enter the event location');
    });
    el.addEventListener('input', () => clearError(fieldId));
  });

  /* ──────────────────────────────────────────────
     8. BACK TO TOP BUTTON
  ────────────────────────────────────────────── */
  const backToTopBtn = document.getElementById('backToTop');

  function updateBackToTop() {
    backToTopBtn.classList.toggle('show', window.scrollY > 400);
  }

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ──────────────────────────────────────────────
     9. SMOOTH SCROLL for anchor links
  ────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
