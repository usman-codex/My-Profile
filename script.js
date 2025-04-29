document.addEventListener('DOMContentLoaded', () => {

    // --- === Configuration === ---
    const STICKY_NAV_OFFSET = 50;
    const SCROLL_TOP_VISIBILITY_OFFSET = 300;
    const COUNTER_ANIMATION_DURATION = 1500; // ms
    const FORM_CONFIRMATION_TIMEOUT = 3000; // ms
    // Add Formspree/EmailJS endpoint here
    const CONTACT_FORM_ENDPOINT = "YOUR_FORM_ENDPOINT_HERE"; // <<< IMPORTANT: REPLACE THIS!

    // --- === Element Selections === ---
    const navbar = document.querySelector('.navbar'); // Keep if custom navbar, adjust/remove if Bootstrap navbar
    const hamburger = document.querySelector('.hamburger'); // Remove if using Bootstrap navbar-toggler
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper'); // Remove if using Bootstrap collapse
    const navLinks = document.querySelectorAll('.nav-link'); // Keep for closing menu on click if custom mobile nav
    const themeToggle = document.getElementById('themeToggle'); // Keep
    const contactForm = document.getElementById('contact-form'); // Keep
    const formStatus = document.getElementById('form-status'); // Keep
    const formSuccessOverlay = document.getElementById('form-success-overlay'); // Keep
    const scrollToTopBtn = document.querySelector('.scroll-to-top'); // Keep
    const statNumbers = document.querySelectorAll('.stat-number[data-target]'); // Keep
    const animatedElements = document.querySelectorAll('[data-animation]'); // Keep
    const filterBtns = document.querySelectorAll('.filter-btn'); // Keep
    const gridItemsContainer = document.querySelector('.skills-grid, .projects-grid'); // Helper to find items within grid
    // Custom Modal elements - Remove if using Bootstrap modals
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modalCloseBtns = document.querySelectorAll('.modal-close-button');
    // Add selectors for elements needing advanced JS (magnetic, tilt, etc.) - Keep

    // --- === State Variables === ---
    let isMobileMenuOpen = false; // Remove if using Bootstrap navbar

    // --- === Core Functions === ---

    // Apply theme (light/dark) - Keep
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('portfolioTheme', theme);
    };

    // Initialize theme - Keep
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('portfolioTheme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            applyTheme(prefersDark ? 'dark' : 'light');
        }
    };

    // Toggle Mobile Menu - Remove if using Bootstrap navbar
    const toggleMobileMenu = () => {
        // Check if hamburger exists before toggling (in case it was removed for Bootstrap)
        if (!hamburger || !navMenuWrapper) return;
        isMobileMenuOpen = !isMobileMenuOpen;
        hamburger.classList.toggle('active', isMobileMenuOpen);
        navMenuWrapper.classList.toggle('active', isMobileMenuOpen);
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    };

    // Close Mobile Menu - Remove if using Bootstrap navbar
    const closeMobileMenu = () => {
        // Check if hamburger exists before trying to close
        if (!hamburger || !navMenuWrapper) return;
        if (isMobileMenuOpen) {
            toggleMobileMenu();
        }
    };

    // Handle Scroll Events - Keep
    const handleScroll = () => {
        // Sticky Nav - May need adjustment based on final navbar implementation
        if (navbar) {
            navbar.classList.toggle('sticky', window.scrollY > STICKY_NAV_OFFSET);
        }
        // Scroll Top Button
        if (scrollToTopBtn) {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > SCROLL_TOP_VISIBILITY_OFFSET);
        }
        // Add more scroll-based logic here (e.g., active nav link highlighting)
    };

    // Animate Counter Function - Keep
    const animateCounter = (element) => {
        const target = +element.dataset.target;
        if (isNaN(target)) return; // Prevent errors if data-target is missing/invalid
        const duration = COUNTER_ANIMATION_DURATION;
        let start = 0;
        const increment = target / (duration / 16); // Calculate increment per frame (approx 60fps)
        let current = 0;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            current = Math.min(target, Math.floor(increment * (progress / 16))); // Approx calculation

            element.textContent = (element.textContent.includes('+') ? '+' : '') + current + (element.textContent.includes('%') ? '%' : '');

            if (current < target) {
                requestAnimationFrame(step);
            } else {
                 element.textContent = (element.textContent.includes('+') ? '+' : '') + target + (element.textContent.includes('%') ? '%' : ''); // Ensure final value is exact
                 element.dataset.animated = 'true'; // Mark as animated
            }
        };
        requestAnimationFrame(step);
    };


    // Handle Form Submission - Keep (Ensure form ID and elements match)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm) return; // Exit if form doesn't exist

        // Basic check for endpoint placeholder
        if (CONTACT_FORM_ENDPOINT === "YOUR_FORM_ENDPOINT_HERE") {
             alert("Please replace YOUR_FORM_ENDPOINT_HERE in script.js with your actual form endpoint (e.g., from Formspree or EmailJS).");
             return;
        }

        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('.submit-button');
        const buttonText = submitButton ? submitButton.querySelector('.button-text') : null;

        // Reset status
        if(formStatus){
            formStatus.textContent = '';
            formStatus.className = 'form-status-message'; // Reset classes
        }

        if (submitButton) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
        }


        try {
            const response = await fetch(CONTACT_FORM_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                if (formSuccessOverlay) formSuccessOverlay.classList.add('show');
                contactForm.reset();
                setTimeout(() => {
                    if (formSuccessOverlay) formSuccessOverlay.classList.remove('show');
                }, FORM_CONFIRMATION_TIMEOUT);
            } else {
                const data = await response.json().catch(() => ({})); // Attempt to get error from response
                if(formStatus){
                    formStatus.textContent = data.error || 'Submission failed. Please try again.';
                    formStatus.classList.add('error', 'visible');
                } else {
                    alert(data.error || 'Submission failed. Please try again.'); // Fallback alert
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
             if(formStatus){
                formStatus.textContent = 'Network error. Please check connection or form endpoint.';
                formStatus.classList.add('error', 'visible');
             } else {
                 alert('Network error. Please check connection or form endpoint.'); // Fallback alert
             }
        } finally {
            if (submitButton) {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }
    };

    // Open Modal - Remove if using Bootstrap Modals
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    };

    // Close Modal - Remove if using Bootstrap Modals
    const closeModal = (modal) => {
         if (modal && modal.classList.contains('modal-overlay')) { // Ensure it's the overlay
            modal.classList.remove('active');
             // Only re-enable scroll if no other modals are open
             if (!document.querySelector('.modal-overlay.active')) {
                 document.body.style.overflow = '';
             }
         }
    };

    // Close All Modals - Remove if using Bootstrap Modals
    const closeAllModals = () => {
        modalOverlays.forEach(overlay => closeModal(overlay));
    };

    // Filter Grid Items (Skills/Projects) - Keep, ensure grid structure uses cols
    const filterGrid = (filter, gridContainer) => {
        if (!gridContainer) return;
        const itemsToFilter = gridContainer.querySelectorAll('.col[data-filter-tag]'); // Target .col divs with the tag

        itemsToFilter.forEach(item => {
            const itemTags = item.dataset.filterTag || '';
            const shouldShow = filter === 'all' || itemTags.toLowerCase().split(' ').includes(filter.toLowerCase());

            // Add transition effect classes (optional)
            if (shouldShow) {
                item.style.display = ''; // Reset display
                // item.classList.remove('fade-out'); // Example
                // item.classList.add('fade-in'); // Example
            } else {
                 // item.classList.add('fade-out'); // Example
                 // item.classList.remove('fade-in'); // Example
                 // Hide after transition (if using CSS transitions)
                 // setTimeout(() => { item.style.display = 'none'; }, 300); // Match CSS transition duration
                item.style.display = 'none'; // Direct hide if no transition
            }
        });
    };


    // --- === Event Listeners === ---

    // Theme Toggle - Keep
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // Mobile Menu Toggle - Remove if using Bootstrap navbar
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    // Close mobile menu on link click - Remove if using Bootstrap navbar
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    // Close mobile menu on wrapper click - Remove if using Bootstrap navbar
    if (navMenuWrapper) {
        navMenuWrapper.addEventListener('click', (e) => {
            if (e.target === navMenuWrapper) {
                closeMobileMenu();
            }
        });
    }

    // Scroll Listener - Keep
    window.addEventListener('scroll', handleScroll);

    // Contact Form - Keep
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Scroll To Top Button - Keep
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Filter Buttons Listener - Keep
    filterBtns.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.dataset.filter;
            // Find the closest grid container (skills or projects)
            const targetGrid = button.closest('section').querySelector('.skills-grid, .projects-grid');

            if (targetGrid) {
                 // Update active button state
                 button.parentElement.querySelector('.filter-btn.active')?.classList.remove('active');
                 button.classList.add('active');
                 filterGrid(filterValue, targetGrid);
            }
        });
    });

    // Modal Listeners - Remove if using Bootstrap Modals
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
             e.preventDefault();
             const targetId = trigger.dataset.modalTarget;
             if (targetId) {
                 openModal(targetId);
             }
        });
    });
    modalCloseBtns.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.closest('.modal-overlay'));
        });
    });
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) { // Ensure click is on the overlay itself
                 closeModal(overlay);
            }
        });
    });
    // Close modals on Escape key - Remove if using Bootstrap Modals
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
             closeAllModals();
        }
    });


    // --- === Intersection Observer Setup === --- Keep
    const observerCallback = (entries, observerInstance) => {
        entries.forEach(entry => {
            const target = entry.target;
            const delay = target.dataset.delay || '0s';

            if (entry.isIntersecting) {
                 target.style.setProperty('--animation-delay', delay);
                 target.classList.add('is-visible');

                // Trigger counter animation only if it's a counter and not already animated
                if (target.matches('.stat-number[data-target]') && !target.dataset.animated) {
                    animateCounter(target);
                }

                // Optionally unobserve after first animation to prevent re-triggering
                // observerInstance.unobserve(target);

            } else {
                // Optional: Reset animation if you want it to trigger every time it scrolls into view
                 if (!target.matches('.stat-number')) { // Don't reset counters easily
                    target.classList.remove('is-visible');
                    target.style.removeProperty('--animation-delay');
                 }
                 // Optional: Reset counter state if it should re-animate
                 // if (target.matches('.stat-number[data-target]')) {
                 //    target.textContent = (target.textContent.includes('+') ? '+' : '') + '0' + (target.textContent.includes('%') ? '%' : '');
                 //    delete target.dataset.animated;
                 // }
            }
        });
    };

    const observerOptions = {
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    animatedElements.forEach(el => observer.observe(el));


    // --- === Initializations === --- Keep
    initializeTheme();
    handleScroll(); // Initial check for sticky nav/scroll-top
    const yearSpan = document.getElementById('current-year'); // Update footer year
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- === Placeholder for Advanced JS === ---
    console.log("Basic JS Initialized. Check for conflicts if using Bootstrap JS components.");

    // Example: Basic Ripple Effect (Needs CSS .rippling and ::before styles) - Keep if using custom buttons
    document.querySelectorAll('.btn-ripple').forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple-effect'); // Use a dedicated class for the ripple span itself

            // Check if button already has a ripple and remove it
            const existingRipple = button.querySelector('.ripple-effect');
            if (existingRipple) {
                existingRipple.remove();
            }

            this.appendChild(ripple);

             // Remove ripple after animation (match CSS duration if any)
            setTimeout(() => ripple.remove(), 600); // Adjust timing as needed
        });
    });

     // Tilt Effect Placeholder (Requires a library like Vanilla-Tilt.js)
     // const tiltElements = document.querySelectorAll('.tilt-card');
     // if (typeof VanillaTilt !== 'undefined') {
     //     VanillaTilt.init(tiltElements, {
     //         max: 15,
     //         speed: 400,
     //         glare: true,
     //         "max-glare": 0.3
     //     });
     // } else {
     //     console.log("VanillaTilt library not found for tilt effect.");
     // }


}); // End DOMContentLoaded

// Add a CSS rule for the ripple effect span if you keep the ripple JS:
/*
.btn-ripple {
    position: relative;
    overflow: hidden;
}
.ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}
@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
*/