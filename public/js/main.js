/**
 * Nadia's Saloon
 * Main JavaScript File
 */

// Preloader: hide after DOM + short branded beat — NOT after full window.load (images/gallery
// assets would keep the splash up while you scroll or click). Full reload / refresh still shows splash.
(function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;

    const MIN_MS = 420;
    const HARD_CAP_MS = 3200;
    const t0 = performance.now();
    let hidden = false;

    function hide() {
        if (hidden) return;
        hidden = true;
        preloader.classList.add('hidden');
    }

    function scheduleHide() {
        const elapsed = performance.now() - t0;
        const wait = Math.max(0, MIN_MS - elapsed);
        setTimeout(hide, wait);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleHide, { once: true });
    } else {
        scheduleHide();
    }

    setTimeout(hide, HARD_CAP_MS);

    window.addEventListener(
        'pageshow',
        function (ev) {
            if (ev.persisted) hide();
        },
        { passive: true }
    );
})();

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.querySelector('.navbar');
    const topbar = document.querySelector('.topbar');
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY > 100;
                if (scrolled) {
                    navbar.classList.add('scrolled');
                    if (topbar) topbar.classList.add('topbar--hidden');
                    navbar.style.top = '0';
                } else {
                    navbar.classList.remove('scrolled');
                    if (topbar) topbar.classList.remove('topbar--hidden');
                    navbar.style.top = '';
                }
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on load
    
    // ========================================
    // MOBILE NAVIGATION
    // ========================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    navBackdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navBackdrop);

    function closeNav() {
        if (!hamburger || !navMenu) return;
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        navBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
        navBackdrop.setAttribute('aria-hidden', 'true');
    }

    function openNav() {
        if (!hamburger || !navMenu) return;
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        navBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Close menu');
        navBackdrop.setAttribute('aria-hidden', 'false');
    }

    if (hamburger && navMenu) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.addEventListener('click', function () {
            if (navMenu.classList.contains('active')) {
                closeNav();
            } else {
                openNav();
            }
        });

        navBackdrop.addEventListener('click', closeNav);

        navLinks.forEach(function (link) {
            link.addEventListener('click', closeNav);
        });
    }
    
    // ========================================
    // SMOOTH SCROLL FOR NAVIGATION (uses CSS scroll-margin on section[id])
    // ========================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                if (href === '#') {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
                    });
                }
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ========================================
    // ACTIVE NAV LINK ON SCROLL
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    let navTicking = false;
    
    function updateActiveNavLink() {
        if (!navTicking) {
            window.requestAnimationFrame(() => {
                const scrollPosition = window.scrollY + 100;
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    const sectionId = section.getAttribute('id');
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${sectionId}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
                navTicking = false;
            });
            navTicking = true;
        }
    }
    
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });

    if (navLinks.length && sections.length) {
        updateActiveNavLink();
    }
    
    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const fadeElements = document.querySelectorAll(
        '.about-teaser__inner, .service-card, .team-card, .booking-detail'
    );
    
    fadeElements.forEach((el, index) => {
        el.classList.add('fade-in-element');
        el.style.transitionDelay = `${index * 0.08}s`;
        fadeInObserver.observe(el);
    });
    
    // ========================================
    // BOOKING FORM HANDLING
    // ========================================
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData.entries());
            
            // Simple validation
            let isValid = true;
            const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'service', 'date', 'time'];
            
            requiredFields.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    input.style.borderColor = '#e74c3c';
                    isValid = false;
                } else {
                    input.style.borderColor = '';
                }
            });
            
            // Email validation
            const emailInput = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                emailInput.style.borderColor = '#e74c3c';
                isValid = false;
            }
            
            if (isValid) {
                // Show success message
                const submitBtn = bookingForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.textContent = 'Appointment Requested!';
                submitBtn.style.background = '#27ae60';
                submitBtn.disabled = true;
                
                // In a real application, you would send this data to a server
                
                // Reset form after delay
                setTimeout(() => {
                    bookingForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
        
        // Remove error styling on input
        bookingForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', function() {
                this.style.borderColor = '';
            });
        });
    }
    
    // ========================================
    // COUNTER ANIMATION FOR EXPERIENCE
    // ========================================
    const experienceNumber = document.querySelector('.experience-number');
    
    if (experienceNumber) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(experienceNumber, 15);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        countObserver.observe(experienceNumber);
    }
    
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 30;
        const duration = 2000;
        const stepTime = duration / 30;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, stepTime);
    }
    
    // ========================================
    // PHONE NUMBER FORMATTING
    // ========================================
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Allow international format for Pakistani numbers
            let value = e.target.value.replace(/[^\d+]/g, '');
            e.target.value = value;
        });
    }
    
});
