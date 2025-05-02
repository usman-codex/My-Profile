document.addEventListener('DOMContentLoaded', () => {

    // --- === Configuration === ---
    const STICKY_NAV_OFFSET = 50;
    const SCROLL_TOP_VISIBILITY_OFFSET = 300;
    const COUNTER_ANIMATION_DURATION = 1500; 
    const FORM_CONFIRMATION_TIMEOUT = 3000; 
    // Add Formspree/EmailJS endpoint here
    const CONTACT_FORM_ENDPOINT = "YOUR_FORM_ENDPOINT_HERE"; 

    // --- === Element Selections === ---
    const navbar = document.querySelector('.navbar'); 
    const hamburger = document.querySelector('.hamburger'); 
    const navMenuWrapper = document.querySelector('.nav-menu-wrapper'); 
    const navLinks = document.querySelectorAll('.nav-link'); 
    const themeToggle = document.getElementById('themeToggle'); 
    const contactForm = document.getElementById('contact-form'); 
    const formStatus = document.getElementById('form-status'); 
    const formSuccessOverlay = document.getElementById('form-success-overlay'); 
    const scrollToTopBtn = document.querySelector('.scroll-to-top'); 
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    const animatedElements = document.querySelectorAll('[data-animation]'); 
    const filterBtns = document.querySelectorAll('.filter-btn'); 
    const gridItemsContainer = document.querySelector('.skills-grid, .projects-grid'); 
    // Custom Modal elements 
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modalCloseBtns = document.querySelectorAll('.modal-close-button');


    // --- === State Variables === ---
    let isMobileMenuOpen = false; 


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

    // Toggle Mobile Menu 
    const toggleMobileMenu = () => {
        
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
                 element.textContent = (element.textContent.includes('+') ? '+' : '') + target + (element.textContent.includes('%') ? '%' : ''); 
                 element.dataset.animated = 'true';
            }
        };
        requestAnimationFrame(step);
    };


    // Handle Form Submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm) return; 

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
              
            } else {
                
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
            if (e.target === overlay) { 
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

             

            } else {
               
                 if (!target.matches('.stat-number')) { // Don't reset counters easily
                    target.classList.remove('is-visible');
                    target.style.removeProperty('--animation-delay');
                 }
              
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
    const yearSpan = document.getElementById('current-year'); 
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
            ripple.classList.add('ripple-effect'); 

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



}); // End DOMContentLoaded

          // ------ stats running------
            document.addEventListener("DOMContentLoaded", function () {
                const counters = document.querySelectorAll('.stat-number');
                const duration = 2000; // Total duration in ms for the animation
            
                const animateCounters = () => {
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const isPercent = counter.innerText.includes('%');
                        const isPlus = counter.innerText.includes('+');
                        let start = 0;
                        const startTime = performance.now();
            
                        const update = (currentTime) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1); // max 1
                            const value = Math.floor(progress * target);
            
                            counter.innerText = value + (isPercent ? '%' : isPlus ? '+' : '');
            
                            if (progress < 1) {
                                requestAnimationFrame(update);
                            } else {
                                counter.innerText = target + (isPercent ? '%' : isPlus ? '+' : '');
                            }
                        };
            
                        requestAnimationFrame(update);
                    });
                };
            
                // Trigger when section is in view
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animateCounters();
                            observer.disconnect(); // Run once
                        }
                    });
                }, { threshold: 0.4 });
            
                const statsSection = document.querySelector('#stats');
                if (statsSection) observer.observe(statsSection);
            });
