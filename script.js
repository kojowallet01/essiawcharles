// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const fadeElements = document.querySelectorAll('.fade-in');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');
const scrollProgressBar = document.getElementById('scrollProgressBar');
const heroCanvas = document.getElementById('heroCanvas');
const heroAvatarCard = document.getElementById('heroAvatarCard');
const heroTypedRole = document.getElementById('heroTypedRole');
const copyEmailBtn = document.getElementById('copyEmailBtn');

// 1. Scroll Progress Bar & Navbar Scroll State
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (scrollProgressBar && docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        scrollProgressBar.style.width = `${progress}%`;
    }

    navbar.classList.toggle('scrolled', scrollY > 50);
    backToTop.classList.toggle('visible', scrollY > 400);
}, { passive: true });

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 2. Mobile Menu Toggle with Body Scroll Lock & Accessibility
function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    const spans = navToggle.querySelectorAll('span');
    if (spans.length >= 3) {
        spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
        spans[1].style.opacity = isOpen ? '0' : '1';
        spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
    }
}

navToggle.addEventListener('click', () => toggleMenu());

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
            toggleMenu(false);
        }
    });
});

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggleMenu(false);
    }
});

// Close mobile menu on clicking outside
document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && 
        !navMenu.contains(e.target) && 
        !navToggle.contains(e.target)) {
        toggleMenu(false);
    }
});

// 3. Theme Toggle & Sync
function setTheme(theme) {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', theme);
    
    // Update theme meta color for mobile browser tab headers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#002b36');
    }
}

themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
});

// 4. Interactive Ambient Canvas (Constellation Mesh) in Hero
if (heroCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = heroCanvas.getContext('2d');
    let width, height;
    let particles = [];
    const maxDistance = 115;
    const particleCount = window.innerWidth < 768 ? 26 : 50;

    let mouse = { x: null, y: null, radius: 130 };

    function resizeCanvas() {
        width = heroCanvas.width = heroCanvas.parentElement.offsetWidth;
        height = heroCanvas.height = heroCanvas.parentElement.offsetHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 1.8 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Soft repulsion from cursor
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }
        }

        draw(color) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    function initParticles() {
        resizeCanvas();
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isLight = document.documentElement.classList.contains('light');
        const particleColor = isLight ? 'rgba(14, 165, 233, 0.55)' : 'rgba(103, 232, 249, 0.7)';
        const lineColorPrefix = isLight ? 'rgba(14, 165, 233,' : 'rgba(6, 182, 212,';

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(particleColor);

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    const opacity = (1 - dist / maxDistance) * (isLight ? 0.2 : 0.28);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `${lineColorPrefix} ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        heroSection.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    initParticles();
    animate();
}

// 4.1 Dynamic Typewriter Effect for Hero Roles
if (heroTypedRole) {
    const roles = [
        'high-impact web applications',
        'full-stack business platforms',
        'slick, modern user interfaces',
        'real-time cloud architectures',
        'scalable, production-ready systems'
    ];

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        heroTypedRole.textContent = roles[0];
    } else {
        let roleIdx = 0;
        let charIdx = roles[0].length;
        let isDeleting = true;
        let typingSpeed = 65;

        function typeLoop() {
            const current = roles[roleIdx];

            if (isDeleting) {
                heroTypedRole.textContent = current.substring(0, charIdx - 1);
                charIdx--;
                typingSpeed = 32;
            } else {
                heroTypedRole.textContent = current.substring(0, charIdx + 1);
                charIdx++;
                typingSpeed = 60;
            }

            if (!isDeleting && charIdx === current.length) {
                isDeleting = true;
                setTimeout(typeLoop, 2200);
                return;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                setTimeout(typeLoop, 450);
                return;
            }

            setTimeout(typeLoop, typingSpeed);
        }

        setTimeout(typeLoop, 1800);
    }
}

// 4.2 Quick 1-Click Email Copy Hub
if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
        const email = copyEmailBtn.getAttribute('data-email') || 'charlesessiawjnr@gmail.com';
        const tooltip = document.getElementById('copyTooltip');

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(email);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = email;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            copyEmailBtn.classList.add('copied');
            if (tooltip) tooltip.textContent = 'Copied to clipboard! ✓';

            setTimeout(() => {
                copyEmailBtn.classList.remove('copied');
            }, 2400);
        } catch (err) {
            console.error('Failed to copy email:', err);
            window.location.href = `mailto:${email}`;
        }
    });
}

// 5. 3D Tilt Micro-Animations for Cards
const tiltCards = document.querySelectorAll('.project-card, #heroAvatarCard');
const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (isHoverDevice && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const maxTilt = 6;
            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// 6. Project Category Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        const filter = button.dataset.filter;

        projectCards.forEach(card => {
            const categories = (card.dataset.category || '').split(' ');
            const isMatch = filter === 'all' || categories.includes(filter);

            if (isMatch) {
                card.classList.remove('is-hidden');
                card.style.animation = 'none';
                card.offsetHeight; // trigger reflow
                card.style.animation = 'fadeInCard 0.35s ease forwards';
            } else {
                card.classList.add('is-hidden');
            }
        });
    });
});

// 6.1 Project Case Study Data & Interactive Modal
const PROJECT_CASE_STUDIES = {
    sweetbite: {
        title: 'Sweetbite Food POS & KDS',
        tagline: 'Real-time cloud restaurant Point of Sale and Kitchen Display System with live Supabase order synchronization.',
        category: 'Full-Stack',
        status: 'Active',
        image: 'assets/projects/sweetbite.jpg',
        challenge: 'Restaurant kitchens and cashiers frequently suffer from delayed ticket printouts, missed table orders, and chaotic rush hour coordination.',
        solution: 'Built an ultra-fast Next.js & Supabase application that delivers live order tickets to kitchen screens in under 400ms, equipped with audible chime alerts and real-time inventory adjustments.',
        features: [
            'Sub-second real-time order dispatch via Supabase websocket streams',
            'Dedicated Kitchen Display System (KDS) with visual and audio bell alerts',
            'Dynamic menu and ingredient manager with price variation controls',
            'Responsive design suited for tablets, touch POS terminals, and mobile devices'
        ],
        stack: ['Next.js 14', 'TypeScript', 'Supabase Realtime', 'Tailwind CSS', 'PostgreSQL'],
        demo: null,
        github: 'https://github.com/kojowallet01/Sweetbite'
    },
    emergency: {
        title: 'Emergency Response System',
        tagline: 'Real-time emergency dispatch and response system for Ghana with instant voice messaging and GPS route tracking.',
        category: 'Web App & GPS',
        status: 'Live Demo',
        image: 'assets/projects/emergency.jpg',
        challenge: 'Citizens and dispatchers in emergency scenarios often struggle to convey exact geolocation and critical caller details in high-stress moments.',
        solution: 'Developed a streamlined web application allowing callers to transmit pinpoint GPS coordinates and recorded voice messages in one tap directly to emergency dispatch terminals.',
        features: [
            'One-touch GPS coordinate detection with live Ghana map routing',
            'In-browser voice recording and instant dispatch transmission',
            'Emergency triage prioritization (High, Medium, Low severity flags)',
            'Field unit availability status and ETA calculation'
        ],
        stack: ['JavaScript', 'TypeScript', 'PostgreSQL', 'Python', 'Leaflet / Maps API'],
        demo: 'https://emergency-response-system-flax.vercel.app',
        github: 'https://github.com/kojowallet01/emergency-response-system'
    },
    patron: {
        title: 'Patron Housing Access',
        tagline: 'QR-based access management portal for gated residential communities, streamlining visitor authentication and resident logging.',
        category: 'Access System',
        status: 'Live Demo',
        image: 'assets/projects/patron.jpg',
        challenge: 'Traditional paper visitor registers create security loopholes, slow entry gates, and lack auditable entry/exit timestamps.',
        solution: 'Architected a digital access platform where residents generate time-expiring cryptographic QR passes that security officers scan and verify at gated entry points.',
        features: [
            'Time-restricted QR visitor pass generator with expiration rules',
            'Instant security gate scanner and resident unit verification',
            'Comprehensive visitor history log with audit trails',
            'Containerized Docker architecture for frictionless cloud hosting'
        ],
        stack: ['JavaScript', 'HTML5', 'CSS3', 'Docker', 'RESTful API'],
        demo: 'https://patron-housing-access.onrender.com/',
        github: 'https://github.com/kojowallet01/patron-housing-access'
    },
    bizconnect: {
        title: 'BizConnect Website',
        tagline: 'Modern enterprise corporate business platform built with TypeScript, featuring high-speed load times and crisp aesthetics.',
        category: 'Corporate Web',
        status: 'Client Project',
        image: 'assets/projects/bizconnect.svg',
        challenge: 'The client required a world-class digital brand presence capable of conveying enterprise IT capability with instant responsiveness.',
        solution: 'Engineered a high-performance corporate platform using modern TypeScript and modular CSS, earning high performance metrics and clean aesthetic appeal.',
        features: [
            'Blazing fast sub-second initial page load with zero bloat',
            'Full mobile-to-desktop responsive adaptation',
            'Interactive solution showcases and quotation request modules',
            'Production deployment with SEO-optimized structured metadata'
        ],
        stack: ['TypeScript', 'HTML5', 'CSS3', 'Python Services', 'Modern UI'],
        demo: 'https://bizconnecttechnologies.com',
        github: 'https://github.com/kojowallet01/bizconnect-website'
    },
    kelrose: {
        title: 'Kelrose Tours & Travel',
        tagline: 'Curated tour and travel website for exploring Ghana — featuring destinations, dynamic packages, booking forms, and reviews.',
        category: 'Travel & Tourism',
        status: 'Open Source',
        image: 'assets/projects/kelrose.svg',
        challenge: 'Travelers searching for excursions across Ghana require clear destination insights, transparent package costs, and straightforward booking.',
        solution: 'Created an engaging tourism portal highlighting top destinations (Cape Coast Castle, Kakum Canopy Walk, Mole Safari) with package breakdowns and booking inquiries.',
        features: [
            'Interactive regional destination guides across Ghana',
            'Customizable tour packages with clear pricing transparency',
            'Integrated tour reservation and itinerary request forms',
            'Authentic traveler reviews and social proof integration'
        ],
        stack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
        demo: null,
        github: 'https://github.com/kojowallet01/kelrose'
    }
};

const projectModal = document.getElementById('projectModal');
const projectModalClose = document.getElementById('projectModalClose');
const projectModalContent = document.getElementById('projectModalContent');

function openProjectModal(projectId) {
    const data = PROJECT_CASE_STUDIES[projectId];
    if (!data || !projectModal || !projectModalContent) return;

    const demoBtnHTML = data.demo 
        ? `<a href="${data.demo}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>` 
        : '';
    const codeBtnHTML = data.github 
        ? `<a href="${data.github}" target="_blank" rel="noopener" class="btn btn-outline"><i class="fab fa-github"></i> Source Code</a>` 
        : '';

    const featuresHTML = data.features.map(f => `<li><i class="fas fa-check-circle"></i> <span>${f}</span></li>`).join('');
    const techPillsHTML = data.stack.map(s => `<span>${s}</span>`).join('');

    projectModalContent.innerHTML = `
        <div class="modal-header-badge-row">
            <span class="project-category-tag">${data.category}</span>
            <span class="project-status-pill">${data.status}</span>
        </div>
        <h2 class="modal-title">${data.title}</h2>
        <p class="modal-tagline">${data.tagline}</p>
        
        <div class="modal-img-wrap">
            <img src="${data.image}" alt="${data.title} UI Preview">
        </div>

        <div class="modal-grid-details">
            <div class="modal-detail-box">
                <div class="modal-detail-title"><i class="fas fa-bullseye"></i> The Challenge</div>
                <p class="modal-detail-text">${data.challenge}</p>
            </div>
            <div class="modal-detail-box">
                <div class="modal-detail-title"><i class="fas fa-lightbulb"></i> The Solution</div>
                <p class="modal-detail-text">${data.solution}</p>
            </div>
        </div>

        <div class="modal-section-title">Key Features & Architecture</div>
        <ul class="modal-features-list">
            ${featuresHTML}
        </ul>

        <div class="modal-section-title">Technology Stack</div>
        <div class="modal-tech-pills">
            ${techPillsHTML}
        </div>

        <div class="modal-actions">
            ${demoBtnHTML}
            ${codeBtnHTML}
            <button type="button" class="btn btn-outline" id="modalDismissBtn">Close</button>
        </div>
    `;

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const dismissBtn = document.getElementById('modalDismissBtn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', closeProjectModal);
    }
}

function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

if (projectModalClose) {
    projectModalClose.addEventListener('click', closeProjectModal);
}

if (projectModal) {
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('open')) {
        closeProjectModal();
    }
});

// Clickable project cards & Case Study buttons
projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // If clicking on external links, let browser handle them
        if (e.target.closest('a.project-link')) return;

        const projectId = card.dataset.projectId;
        if (projectId && PROJECT_CASE_STUDIES[projectId]) {
            e.preventDefault();
            openProjectModal(projectId);
        }
    });
});

document.querySelectorAll('.btn-case-study').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const projectId = btn.dataset.projectId;
        if (projectId) openProjectModal(projectId);
    });
});

// 7. Active Nav Link on Scroll
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, { passive: true });

// 8. FAQ Accordion Toggle
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const answer = item.querySelector('.faq-answer');
        const isActive = item.classList.contains('active');

        document.querySelectorAll('.faq-item.active').forEach(activeItem => {
            activeItem.classList.remove('active');
            activeItem.querySelector('.faq-answer').style.maxHeight = null;
        });

        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

// 9. Fade-In on Scroll Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

fadeElements.forEach(el => observer.observe(el));

// 10. Web3Forms Contact Form Integration with Live Status
const contactForm = document.getElementById('contactForm');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');
const formStatusMsg = document.getElementById('formStatusMsg');
const web3FormsAccessKey = document.getElementById('web3FormsAccessKey');

if (contactForm && contactSubmitBtn) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message) {
            showFormStatus('error', 'Please fill in all fields before sending.');
            return;
        }

        const originalBtnHTML = contactSubmitBtn.innerHTML;
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerHTML = '<span class="btn-text">Sending Message...</span> <i class="fas fa-spinner spin-icon"></i>';

        const accessKey = web3FormsAccessKey ? web3FormsAccessKey.value.trim() : '';

        // If default placeholder key is still in place, fall back smoothly to prefilled mailto client
        if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(`Hello Charles,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`);
            
            showFormStatus('info', 'Opening your email client to send message to charlesessiawjnr@gmail.com...');
            
            setTimeout(() => {
                window.location.href = `mailto:charlesessiawjnr@gmail.com?subject=${subject}&body=${body}`;
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = originalBtnHTML;
                contactForm.reset();
            }, 1000);
            return;
        }

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showFormStatus('success', 'Thank you! Your message has been delivered to Charles. I will get back to you shortly.');
                contactForm.reset();
            } else {
                throw new Error(data.message || 'Submission error');
            }
        } catch (error) {
            console.warn('Web3Forms fetch issue, falling back to mailto:', error);
            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(`Hello Charles,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`);
            showFormStatus('error', 'Connecting to your email application to ensure message delivery...');
            setTimeout(() => {
                window.location.href = `mailto:charlesessiawjnr@gmail.com?subject=${subject}&body=${body}`;
            }, 1200);
        } finally {
            contactSubmitBtn.disabled = false;
            contactSubmitBtn.innerHTML = originalBtnHTML;
        }
    });

    function showFormStatus(type, msg) {
        if (!formStatusMsg) return;
        formStatusMsg.className = `form-status-msg ${type}`;
        formStatusMsg.textContent = msg;
        formStatusMsg.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                formStatusMsg.style.display = 'none';
            }, 6500);
        }
    }
}
