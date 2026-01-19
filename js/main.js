/**
 * LUMIÈRE BEAUTY SALON
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // PRELOADER
    // ========================================
    const preloader = document.querySelector('.preloader');
    
    window.addEventListener('load', function() {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1000);
    });
    
    // Fallback in case load event doesn't fire
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 3000);
    
    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.querySelector('.navbar');
    
    function handleScroll() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load
    
    // ========================================
    // MOBILE NAVIGATION
    // ========================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // ========================================
    // SMOOTH SCROLL FOR NAVIGATION
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // ACTIVE NAV LINK ON SCROLL
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNavLink() {
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
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    
    // ========================================
    // TESTIMONIALS SLIDER
    // ========================================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    let currentTestimonial = 0;
    let testimonialInterval;
    
    function showTestimonial(index) {
        testimonialCards.forEach((card, i) => {
            card.classList.remove('active');
            dots[i].classList.remove('active');
        });
        
        testimonialCards[index].classList.add('active');
        dots[index].classList.add('active');
        currentTestimonial = index;
    }
    
    function nextTestimonial() {
        const next = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(next);
    }
    
    // Auto-rotate testimonials
    function startTestimonialRotation() {
        testimonialInterval = setInterval(nextTestimonial, 5000);
    }
    
    function stopTestimonialRotation() {
        clearInterval(testimonialInterval);
    }
    
    // Click handlers for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopTestimonialRotation();
            showTestimonial(index);
            startTestimonialRotation();
        });
    });
    
    startTestimonialRotation();
    
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
    
    // Add fade-in class to elements
    const fadeElements = document.querySelectorAll(
        '.about-grid, .service-card, .gallery-item, .team-card, .pricing-category, .booking-detail'
    );
    
    fadeElements.forEach((el, index) => {
        el.classList.add('fade-in-element');
        el.style.transitionDelay = `${index * 0.1}s`;
        fadeInObserver.observe(el);
    });
    
    // Add CSS for fade-in animation dynamically
    const style = document.createElement('style');
    style.textContent = `
        .fade-in-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-in-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // ========================================
    // GALLERY LIGHTBOX (Simple Version)
    // ========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const imgSrc = img.src.replace('w=400', 'w=1200').replace('w=600', 'w=1200');
            
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-overlay"></div>
                <div class="lightbox-content">
                    <button class="lightbox-close">&times;</button>
                    <img src="${imgSrc}" alt="${img.alt}">
                </div>
            `;
            
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
            
            // Add lightbox styles
            const lightboxStyle = document.createElement('style');
            lightboxStyle.textContent = `
                .lightbox {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease;
                }
                .lightbox-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(26, 21, 18, 0.95);
                }
                .lightbox-content {
                    position: relative;
                    max-width: 90%;
                    max-height: 90%;
                }
                .lightbox-content img {
                    max-width: 100%;
                    max-height: 90vh;
                    object-fit: contain;
                }
                .lightbox-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: none;
                    border: none;
                    color: #C4A484;
                    font-size: 2rem;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }
                .lightbox-close:hover {
                    color: #fff;
                }
            `;
            document.head.appendChild(lightboxStyle);
            
            // Close handlers
            const closeLightbox = () => {
                lightbox.remove();
                lightboxStyle.remove();
                document.body.style.overflow = '';
            };
            
            lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
            lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
            
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closeLightbox();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
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
                console.log('Booking submitted:', data);
                
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
    // PARALLAX EFFECT FOR HERO
    // ========================================
    const heroBg = document.querySelector('.hero-bg');
    
    if (heroBg && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
        });
    }
    
    // ========================================
    // SERVICE CARDS HOVER EFFECT
    // ========================================
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
        });
    });
    
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
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            if (value.length >= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
            } else if (value.length >= 3) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            }
            
            e.target.value = value;
        });
    }
    
    // ========================================
    // LAZY LOADING IMAGES
    // ========================================
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });
    
    images.forEach(img => imageObserver.observe(img));
    
    // ========================================
    // CONSOLE BRANDING
    // ========================================
    console.log(
        '%c✨ Nadia\'s Saloon ✨',
        'font-family: Georgia, serif; font-size: 20px; color: #C9A962; font-weight: bold;'
    );
    console.log(
        '%cWhere beauty meets artistry',
        'font-family: Georgia, serif; font-size: 14px; color: #8B7355; font-style: italic;'
    );
    
});
