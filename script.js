/* =========================================================
   BIZCONNECT SOLUTIONS — SCRIPT
   Organised into small, clearly-labelled features so each
   one is easy to point to and explain in a viva.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. MOBILE NAVIGATION MENU
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('main-nav');

  function closeMenu() {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  function toggleMenu() {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  navToggle.addEventListener('click', toggleMenu);
  document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', closeMenu));

  /* ---------------------------------------------------------
     2. SMOOTH SCROLLING
     CSS `scroll-behavior: smooth` handles most of this; this
     listener keeps behaviour consistent for older browsers
     and works alongside `scroll-padding-top` so the sticky
     header never covers a section title.
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------------------------------------------------------
     3. ACTIVE NAVIGATION WHILE SCROLLING
  --------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => navObserver.observe(section));

  /* ---------------------------------------------------------
     4. SCROLL / REVEAL ANIMATIONS
  --------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------
     5. CURRENT YEAR IN FOOTER
  --------------------------------------------------------- */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     6. PORTFOLIO MODAL
     Each "View Details" button carries a data-project id;
     we look up the matching details and fill the modal
     before opening it. Escape and the close button both
     close it, and focus moves to the close button on open
     and back to the trigger button on close (basic
     accessibility for a modal dialog).
  --------------------------------------------------------- */
  const projectDetails = {
    ecommerce: {
      tag: 'HTML • CSS • JavaScript',
      title: 'E-Commerce Store',
      desc: 'A responsive online shopping interface built to show how a small store could browse and present products online.',
      features: [
        'Product grid with responsive card layout',
        'Category-style browsing with clear visual hierarchy',
        'Mobile-friendly layout tested down to 375px width',
      ],
    },
    landing: {
      tag: 'HTML • CSS • JavaScript',
      title: 'Business Landing Platform',
      desc: 'A professional corporate website concept focused on presenting services clearly and guiding visitors toward an enquiry.',
      features: [
        'Clear service breakdown with supporting visuals',
        'Enquiry-focused call-to-action placement',
        'Sticky navigation with active-section highlighting',
      ],
    },
    planner: {
      tag: 'HTML • CSS • JavaScript',
      title: 'Study Planner Web App',
      desc: 'A responsive web application concept designed to help students organize subjects, tasks and study schedules.',
      features: [
        'Simple, uncluttered task and schedule layout',
        'Responsive design for use on a phone between classes',
        'Built entirely with vanilla JavaScript, no dependencies',
      ],
    },
  };

  const modalOverlay = document.getElementById('modalOverlay');
  const projectModal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalFeatures = document.getElementById('modalFeatures');

  let lastFocusedTrigger = null;

  function openModal(projectId, triggerEl) {
    const details = projectDetails[projectId];
    if (!details) return;

    modalTag.textContent = details.tag;
    modalTitle.textContent = details.title;
    modalDesc.textContent = details.desc;
    modalFeatures.innerHTML = '';
    details.features.forEach((feature) => {
      const li = document.createElement('li');
      li.textContent = feature;
      modalFeatures.appendChild(li);
    });

    lastFocusedTrigger = triggerEl;
    modalOverlay.classList.add('is-open');
    projectModal.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocusedTrigger) lastFocusedTrigger.focus();
  }

  document.querySelectorAll('.project-details-btn').forEach((button) => {
    button.addEventListener('click', () => {
      openModal(button.getAttribute('data-project'), button);
    });
  });

  modalClose.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* ---------------------------------------------------------
     7. ENQUIRY FORM VALIDATION
     Validates each field on submit (and re-validates a field
     as soon as it's fixed), then shows a success or error
     message without reloading the page. Project Budget is
     optional, so it is not part of the required-field checks.
  --------------------------------------------------------- */
  const form = document.getElementById('enquiryForm');
  const feedback = document.getElementById('formFeedback');

  const requiredFields = {
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    service: document.getElementById('service'),
    message: document.getElementById('message'),
  };

  const errors = {
    fullName: document.getElementById('fullNameError'),
    email: document.getElementById('emailError'),
    phone: document.getElementById('phoneError'),
    service: document.getElementById('serviceError'),
    message: document.getElementById('messageError'),
  };

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Accepts 7-15 digits, optionally starting with +, and allows
  // spaces or hyphens between digits (e.g. "98765 43210").
  const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,14}$/;
  const MIN_MESSAGE_LENGTH = 20;

  function setFieldError(fieldName, message) {
    requiredFields[fieldName].classList.toggle('invalid', Boolean(message));
    errors[fieldName].textContent = message || '';
  }

  function validateField(fieldName) {
    const value = requiredFields[fieldName].value.trim();

    switch (fieldName) {
      case 'fullName':
        if (!value) return 'Please enter your full name.';
        if (value.length < 2) return 'Name looks too short.';
        return '';

      case 'email':
        if (!value) return 'Please enter your email address.';
        if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address.';
        return '';

      case 'phone':
        if (!value) return 'Please enter your phone number.';
        if (!PHONE_PATTERN.test(value)) return 'Please enter a valid phone number.';
        return '';

      case 'service':
        if (!value) return 'Please select a service.';
        return '';

      case 'message':
        if (!value) return 'Please describe your project.';
        if (value.length < MIN_MESSAGE_LENGTH) {
          return `Description should be at least ${MIN_MESSAGE_LENGTH} characters.`;
        }
        return '';

      default:
        return '';
    }
  }

  Object.keys(requiredFields).forEach((fieldName) => {
    requiredFields[fieldName].addEventListener('input', () => {
      setFieldError(fieldName, validateField(fieldName));
    });
    requiredFields[fieldName].addEventListener('change', () => {
      setFieldError(fieldName, validateField(fieldName));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    Object.keys(requiredFields).forEach((fieldName) => {
      const message = validateField(fieldName);
      setFieldError(fieldName, message);
      if (message) isFormValid = false;
    });

    feedback.classList.remove('success', 'error', 'show');

    if (!isFormValid) {
      feedback.textContent = 'Please fix the highlighted fields and try again.';
      feedback.classList.add('error', 'show');
      return;
    }

    // No backend is connected in this demo project — this is a
    // simulated front-end enquiry system, not a real submission.
    feedback.textContent = 'Thank you! Your enquiry has been submitted successfully. Our team will review your requirement and get back to you.';
    feedback.classList.add('success', 'show');
    form.reset();
    Object.keys(requiredFields).forEach((fieldName) => setFieldError(fieldName, ''));
  });

});