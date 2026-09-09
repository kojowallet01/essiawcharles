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

// 0. Privacy-First Visitor Telemetry & Event Tracking (GoatCounter & Custom Events)
function trackAnalyticsEvent(name, params = {}) {
    try {
        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
            window.goatcounter.count({
                path: name,
                title: params.title || name,
                event: true,
            });
        }
        window.dispatchEvent(new CustomEvent('portfolio:telemetry', { detail: { name, ...params } }));
    } catch (err) {
        // Fail-safe to avoid disrupting user experience
    }
}

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
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
    trackAnalyticsEvent('theme_toggle', { title: 'Theme: ' + newTheme });
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

// 6. Project Discipline Filtering
const filterButtons = document.querySelectorAll('.project-filter-bar .filter-pill, .filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const featuredGroupHeader = document.querySelector('[data-group-header="featured"]');
const secondaryGroupHeader = document.querySelector('[data-group-header="secondary"]');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        const filter = button.dataset.filter;
        let featuredCount = 0;
        let secondaryCount = 0;

        projectCards.forEach(card => {
            const categories = (card.dataset.category || '').split(' ');
            const isMatch = filter === 'all' || categories.includes(filter);

            if (isMatch) {
                card.classList.remove('is-hidden');
                card.style.animation = 'none';
                void card.offsetHeight; // trigger reflow
                card.style.animation = 'fadeInMedia 0.35s ease forwards';
                if (card.closest('.featured-projects-grid')) featuredCount++;
                if (card.closest('.secondary-projects-grid')) secondaryCount++;
            } else {
                card.classList.add('is-hidden');
            }
        });

        if (featuredGroupHeader) {
            featuredGroupHeader.classList.toggle('is-hidden', featuredCount === 0);
        }
        if (secondaryGroupHeader) {
            secondaryGroupHeader.classList.toggle('is-hidden', secondaryCount === 0);
        }

        if (typeof trackAnalyticsEvent === 'function') {
            trackAnalyticsEvent('filter_projects', { filter: filter });
        }
    });
});

// 6.1 Project Case Study Data & Interactive Modal
const PROJECT_CASE_STUDIES = {
    sweetbite: {
        title: 'Sweetbite Food POS & KDS',
        tagline: 'Real-time cloud restaurant Point of Sale and Kitchen Display System with live Supabase order synchronization.',
        category: 'Full-Stack System · Hospitality',
        status: 'Active System',
        image: 'assets/projects/sweetbite.jpg',
        problem: 'Quick-service and dine-in food establishments face severe operational bottlenecks during rush periods: handwritten or delayed paper tickets get lost, counter-to-kitchen communications lag, and split-item adjustments cause errors that directly erode restaurant revenue and table turnover rates.',
        approach: 'Designed a decoupled, two-sided architecture connecting cashier terminals directly with kitchen display units via live websocket subscriptions. Focused heavily on high-contrast kitchen ergonomics, sub-second latency, zero page refreshes, and state resilience against intermittent connectivity.',
        solution: 'Engineered an end-to-end cloud Point of Sale (POS) and Kitchen Display System (KDS) powered by Next.js and Supabase Realtime. When a cashier tenders an order, it appears on the kitchen station screen in under 400ms with clear visual status flags (Pending, Cooking, Ready, Collected) and audible chime notifications.',
        features: [
            'Sub-second real-time order dispatch via Supabase websocket streams (<400ms latency)',
            'Dedicated Kitchen Display System (KDS) with visual flags and audio chime alerts',
            'Dynamic menu and inventory manager with variant pricing and instant stock status',
            'Fast multi-payment handling (Cash, Mobile Money, Card) with daily sales reconciliation',
            'Responsive touch-optimized UI designed for countertop tablets, touch POS monitors, and phones'
        ],
        arch: {
            frontend: { tech: 'Next.js 14 / React', detail: 'App Router, responsive touch interfaces, optimistic UI updates' },
            backend: { tech: 'Node.js & Server Actions', detail: 'Type-safe server actions, input validation, transactional order logic' },
            database: { tech: 'PostgreSQL (Supabase)', detail: 'Relational order schemas, menu tables, transactional integrity' },
            infra: { tech: 'Supabase Realtime & Vercel', detail: 'Websocket CDC pub/sub streams, edge deployment, CDN caching' }
        },
        challenges: 'Maintaining absolute synchronization between simultaneous order mutations during peak rushes without duplicate tickets. Solved by implementing optimistic UI states with idempotent backend status updates and monotonic timestamp ordering.',
        outcome: 'Replaces slow paper ticketing with instantaneous digital display, eliminating lost tickets and accelerating meal turnaround time.',
        roles: ['System Architecture', 'Product Design', 'Next.js Frontend', 'PostgreSQL Schema', 'Supabase Realtime Sync', 'Vercel Deployment'],
        roleDetail: 'Led the entire system development from initial restaurant workflow observation through interface wireframes, database normalization, real-time subscription pipelines, and tablet testing.',
        demo: null,
        github: 'https://github.com/kojowallet01/Sweetbite'
    },
    emergency: {
        title: 'Ghana Emergency Response & Dispatch Telemetry',
        tagline: 'Real-time emergency dispatch and response system for Ghana with instant voice messaging and GPS route tracking.',
        category: 'Civic Tech · Telemetry & Dispatch',
        status: 'Live Demo',
        image: 'assets/projects/emergency.jpg',
        problem: 'During critical emergencies in Ghana, callers in acute distress frequently struggle to convey exact street addresses, landmarks, or caller details over voice calls. Dispatchers waste vital minutes gathering basic coordinates before first responders can be mobilized.',
        approach: 'Pioneered a one-touch emergency dispatch Progressive Web Application prioritizing rapid location acquisition, low-bandwidth data transmission, and multimodal reporting (voice + coordinates + text) to ensure dispatchers receive actionable telemetry within seconds.',
        solution: 'Developed a streamlined web application allowing callers to transmit pinpoint GPS coordinates and recorded voice messages in one tap directly to emergency dispatch terminals, accompanied by automatic severity classification and map visualization.',
        features: [
            'One-touch GPS coordinate detection with live Ghana map routing and accuracy confidence',
            'In-browser voice recording and streaming audio memo dispatch for high-stress callers unable to type',
            'Dispatcher triage console with automatic severity classification (High, Medium, Low)',
            'Interactive Leaflet/OpenStreetMap mapping interface with live coordinate markers and route lines',
            'Fault-tolerant retry queue optimized for volatile 3G and 2G mobile cellular networks'
        ],
        arch: {
            frontend: { tech: 'JavaScript ES6+ & Leaflet.js', detail: 'Client-side geolocation, MediaRecorder audio capture, interactive maps' },
            backend: { tech: 'Python / RESTful Services', detail: 'Incident triage endpoints, coordinate validation, audio ingestion' },
            database: { tech: 'PostgreSQL / Spatial Indices', detail: 'Spatial coordinate storage, incident audit logs, telemetry records' },
            infra: { tech: 'Vercel & Cloud Telemetry', detail: 'Serverless execution, SSL encryption, low-latency API routes' }
        },
        challenges: 'Handling wide variance in GPS precision across budget mobile hardware and patchy cellular reception. Implemented geolocation retry mechanisms with accuracy circles and audio compression to minimize payload size.',
        outcome: 'Cut reporting overhead from several minutes of frantic phone description down to a single 3-second button tap and 10-second voice brief.',
        roles: ['UX Strategy', 'Frontend Geolocation & Audio APIs', 'Python Services', 'Database Design', 'Vercel Deployment'],
        roleDetail: 'Researched emergency reporting bottlenecks in Ghana, designed the high-contrast emergency UI, engineered client-side audio and GPS streaming, and configured the live dispatch dashboard.',
        demo: 'https://emergency-response-system-flax.vercel.app',
        github: 'https://github.com/kojowallet01/emergency-response-system'
    },
    patron: {
        title: 'Patron Housing Access Control',
        tagline: 'QR-based access management portal for gated residential communities, streamlining visitor authentication and resident logging.',
        category: 'Security · Residential Access',
        status: 'Live Deployment',
        image: 'assets/projects/patron.jpg',
        problem: 'Gated residential communities and housing complexes in urban areas rely on vulnerable paper visitor logbooks at security gates. These cause long vehicle queues, expose resident privacy, enable fraudulent entries, and provide zero searchable records during security investigations.',
        approach: 'Created a cryptographic, self-service visitor authorization system. Residents generate single-use, time-delimited QR access passes via mobile that gate security guards can scan and authenticate instantly on any web camera or phone.',
        solution: 'Architected a digital access platform where residents generate time-expiring cryptographic QR passes that security officers scan and verify at gated entry points, creating a tamper-proof digital visitor registry.',
        features: [
            'Time-restricted cryptographic QR visitor pass generator with expiration and single-use rules',
            'Instant in-browser camera scanner for security gate officers with resident verification feedback',
            'Real-time resident arrival notification and automated vehicle entry/exit logging',
            'Administrative security dashboard with searchable entry logs, vehicle license records, and daily visitor metrics',
            'Containerized Docker architecture for frictionless cloud hosting and local-network failover'
        ],
        arch: {
            frontend: { tech: 'HTML5, CSS3, JavaScript', detail: 'Client-side camera QR scanning, responsive resident portal, pass generation' },
            backend: { tech: 'Node.js & Express REST API', detail: 'JWT validation, cryptographic token hashing, gate verification logic' },
            database: { tech: 'PostgreSQL / Data Store', detail: 'Visitor logs, resident directory, access timestamp records' },
            infra: { tech: 'Docker & Render Cloud', detail: 'Containerized deployment, automated environment builds' }
        },
        challenges: 'Preventing pass sharing / replay attacks and ensuring QR scanning operates smoothly under poor lighting at entrance gates. Implemented short-duration time locks, single-scan invalidation, and high-contrast QR display.',
        outcome: 'Eliminates paper visitor books entirely, reduces gate check-in time from 90 seconds to under 8 seconds per vehicle, and delivers a permanent digital audit trail for residential estates.',
        roles: ['Full-Stack Architecture', 'QR Verification Flow', 'RESTful API Engineering', 'Docker Packaging', 'Cloud Deployment'],
        roleDetail: 'Designed the end-to-end security protocol, engineered the client-side QR generation and camera scanner, built the REST API, containerized the application via Dockerfile, and deployed to production.',
        demo: 'https://patron-housing-access.onrender.com/',
        github: 'https://github.com/kojowallet01/patron-housing-access'
    },
    bizconnect: {
        title: 'BizConnect Technologies Portal',
        tagline: 'Modern enterprise corporate business platform built with TypeScript, featuring high-speed load times and crisp aesthetics.',
        category: 'Corporate Web · Enterprise Platform',
        status: 'Client Project',
        image: 'assets/projects/bizconnect.svg',
        problem: 'An established corporate IT services firm suffered from an outdated, sluggish web presence that failed to project technical credibility, load quickly on mobile devices, or capture enterprise leads.',
        approach: 'Engineered a bespoke, zero-bloat platform built with modern TypeScript and responsive CSS. Centered the redesign around clarity of enterprise service offerings, instant sub-second page performance, and high-conversion consultation requests.',
        solution: 'Delivered a high-performance corporate platform with structured service tiers, dynamic quote request modules, interactive solution showcases, and strict semantic SEO architecture.',
        features: [
            'Blazing fast sub-second initial page load with zero bloat or heavyweight dependencies',
            'Full mobile-to-desktop responsive adaptation across all device form factors',
            'Interactive quotation and IT consultation request workflows',
            'Comprehensive SEO implementation with schema.org structured metadata and Open Graph tags',
            'Production deployment with SSL security and automated lead routing'
        ],
        arch: {
            frontend: { tech: 'TypeScript & Semantic HTML5', detail: 'Type-safe interactive modules, accessible DOM structure, modern CSS' },
            backend: { tech: 'Python / Serverless Services', detail: 'Lead capture endpoints, automated notification mailers' },
            database: { tech: 'Structured Inquiry Store', detail: 'Lead logging, client quotation records, analytics' },
            infra: { tech: 'Cloud Hosting & CDN', detail: 'Global edge distribution, asset compression, HTTP/2 delivery' }
        },
        challenges: 'Achieving a high-end corporate aesthetic while maintaining strict performance budgets on mobile networks. Avoided bloated utility bundles in favor of tailored CSS and modular TypeScript.',
        outcome: 'Elevated the firm’s brand credibility, drove faster inquiries from corporate clients, and contributed to a 5.0 Google client rating.',
        roles: ['Brand & UI/UX Design', 'TypeScript Frontend Development', 'Form & API Integration', 'SEO Strategy', 'Production Deployment'],
        roleDetail: 'Conducted stakeholder requirement interviews, designed the corporate layout, developed all frontend modules in TypeScript, implemented SEO structured data, and deployed the production site.',
        demo: 'https://bizconnecttechnologies.com',
        github: 'https://github.com/kojowallet01/bizconnect-website'
    },
    kelrose: {
        title: 'Kelrose Tours & Travel Website',
        tagline: 'Curated tour and travel website for exploring Ghana — featuring destinations, dynamic packages, booking forms, and reviews.',
        category: 'Tourism & Travel · Booking Platform',
        status: 'Client Platform',
        image: 'assets/projects/kelrose.svg',
        problem: 'Tourists and business travelers exploring destinations across Ghana often encounter fragmented travel information, vague pricing, and clumsy booking mechanisms across local tour operators.',
        approach: 'Designed an immersive, destination-first travel web application that showcases Ghana’s heritage and natural attractions with transparent tour itineraries, responsive gallery viewports, and clear booking forms.',
        solution: 'Created a comprehensive travel portal featuring interactive regional destination showcases (Cape Coast Castle, Kakum Canopy Walkway, Mole National Park), customizable tour package builders, and inquiry management.',
        features: [
            'Regional destination explorer highlighting cultural landmarks, historical context, and trip durations',
            'Dynamic package showcase detailing inclusions, day-by-day itineraries, and transparent cost estimates',
            'Responsive travel inquiry and custom tour reservation forms',
            'Authentic traveler reviews and testimonial proof integration',
            'Optimized imagery with responsive lazy-loading for fast mobile browsing'
        ],
        arch: {
            frontend: { tech: 'HTML5, CSS3, JavaScript', detail: 'Interactive destination filters, itinerary accordion components, responsive galleries' },
            backend: { tech: 'RESTful Booking Handlers', detail: 'Form data validation, reservation processing, email triggers' },
            database: { tech: 'Package & Destination Store', detail: 'Travel catalog data, tour details, booking logs' },
            infra: { tech: 'Web Hosting & CDN Caching', detail: 'Fast asset delivery, responsive image serving' }
        },
        challenges: 'Balancing rich photographic media showcasing scenic Ghanaian landscapes with fast load times on mobile cellular connections. Utilized modern image compression and progressive asset hydration.',
        outcome: 'Provides a clean, engaging digital experience for domestic and international travelers, generating clear qualified inquiries for custom tour itineraries.',
        roles: ['Full-Stack Development', 'UI/UX Design', 'Content Strategy', 'Responsive Engineering'],
        roleDetail: 'Curated Ghanaian tourism data, designed the visual aesthetic, implemented the interactive package components, and published the platform codebase.',
        demo: null,
        github: 'https://github.com/kojowallet01/kelrose'
    }
};

const projectModal = document.getElementById('projectModal');
const projectModalClose = document.getElementById('projectModalClose');
const projectModalContent = document.getElementById('projectModalContent');

function getArchitectureSvg(projectId, data) {
    const archConfigs = {
        sweetbite: {
            node1: { title: 'POS Terminal', sub: 'Next.js 14 · Cashier UI', color: '#2aa198' },
            node2: { title: 'State Engine', sub: 'Zustand · Offline Queue', color: '#0ea5e9' },
            node3: { title: 'Supabase Realtime', sub: 'WebSocket Cluster', color: '#67e8f9' },
            node4: { title: 'PostgreSQL DB', sub: 'RLS · Order Ledger', color: '#38bdf8' },
            node5: { title: 'Kitchen KDS', sub: 'Audio Alert · Station UI', color: '#2aa198' },
            labelA: 'Order Event',
            labelB: 'Bi-Dir Sync',
            labelC: 'Persist ACID',
            labelD: '<500ms Push'
        },
        emergency: {
            node1: { title: 'Citizen Client', sub: 'Mobile Web PWA', color: '#ef4444' },
            node2: { title: 'Telemetry Buffer', sub: 'GPS · WebRTC Audio', color: '#f59e0b' },
            node3: { title: 'Dispatch API', sub: 'Python / FastAPI Bridge', color: '#0ea5e9' },
            node4: { title: 'PostgreSQL DB', sub: 'PostGIS Incident Data', color: '#38bdf8' },
            node5: { title: 'Command Console', sub: 'First Responder Triage', color: '#2aa198' },
            labelA: 'One-Tap SOS',
            labelB: 'Telemetry Stream',
            labelC: 'Spatial Query',
            labelD: 'Unit Dispatch'
        },
        patron: {
            node1: { title: 'Resident Portal', sub: 'Visitor Management Web', color: '#10b981' },
            node2: { title: 'Crypto Issuer', sub: 'HMAC-SHA256 Token', color: '#2aa198' },
            node3: { title: 'Docker Platform', sub: 'Python Core / Render', color: '#0ea5e9' },
            node4: { title: 'Access Ledger', sub: 'PostgreSQL Audit DB', color: '#38bdf8' },
            node5: { title: 'Security Gate', sub: 'Camera Terminal Scanner', color: '#10b981' },
            labelA: 'Pass Request',
            labelB: 'Signed QR',
            labelC: 'Audit Write',
            labelD: 'Realtime Verify'
        },
        bizconnect: {
            node1: { title: 'Enterprise Client', sub: 'Cross-Device Browser', color: '#0ea5e9' },
            node2: { title: 'Edge UI Layer', sub: '0 KB Bloat · Pure CSS', color: '#2aa198' },
            node3: { title: 'Inquiry Gateway', sub: 'TypeScript REST API', color: '#38bdf8' },
            node4: { title: 'Corporate Routing', sub: 'Encrypted Lead Ingest', color: '#67e8f9' },
            node5: { title: 'Sales Ops CRM', sub: 'Instant Webhook Delivery', color: '#0ea5e9' },
            labelA: 'Page Request',
            labelB: '100% CWV Score',
            labelC: 'Lead Payload',
            labelD: 'Direct Dispatch'
        },
        kelrose: {
            node1: { title: 'Travel Explorer', sub: 'Tourist Mobile Client', color: '#f59e0b' },
            node2: { title: 'Dynamic Catalog', sub: 'Itinerary Experience', color: '#2aa198' },
            node3: { title: 'Booking Engine', sub: 'Reservation Logic', color: '#0ea5e9' },
            node4: { title: 'Lead Storage', sub: 'Session & Inquiry DB', color: '#38bdf8' },
            node5: { title: 'Tour Operations', sub: 'Direct Concierge Desk', color: '#10b981' },
            labelA: 'Browse Tours',
            labelB: 'Dynamic Route',
            labelC: 'Reserve Ticket',
            labelD: 'Operator Handshake'
        }
    };
    const c = archConfigs[projectId] || archConfigs.sweetbite;
    return `
    <svg class="diagram-svg" viewBox="0 0 760 210" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System Architecture Diagram for ${data.title}">
        <defs>
            <linearGradient id="boxGrad-${projectId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#073642" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#002b36" stop-opacity="0.98"/>
            </linearGradient>
            <marker id="arr-${projectId}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#2aa198"/>
            </marker>
        </defs>

        <path d="M 125 105 L 175 105" stroke="#2aa198" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arr-${projectId})"/>
        <path d="M 295 105 L 345 105" stroke="#2aa198" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arr-${projectId})"/>
        <path d="M 465 105 L 515 105" stroke="#2aa198" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arr-${projectId})"/>
        <path d="M 635 105 L 675 105" stroke="#2aa198" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arr-${projectId})"/>

        <text x="150" y="94" fill="#67e8f9" font-size="9.5" font-family="monospace" text-anchor="middle">${c.labelA}</text>
        <text x="320" y="94" fill="#67e8f9" font-size="9.5" font-family="monospace" text-anchor="middle">${c.labelB}</text>
        <text x="490" y="94" fill="#67e8f9" font-size="9.5" font-family="monospace" text-anchor="middle">${c.labelC}</text>
        <text x="655" y="94" fill="#67e8f9" font-size="9.5" font-family="monospace" text-anchor="middle">${c.labelD}</text>

        <g transform="translate(10, 55)">
            <rect width="115" height="95" rx="8" fill="url(#boxGrad-${projectId})" stroke="${c.node1.color}" stroke-width="1.5"/>
            <circle cx="18" cy="22" r="5" fill="${c.node1.color}"/>
            <text x="18" y="48" fill="#ffffff" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">${c.node1.title}</text>
            <text x="18" y="70" fill="#94a3b8" font-size="8.8" font-family="system-ui, sans-serif">${c.node1.sub}</text>
        </g>

        <g transform="translate(180, 55)">
            <rect width="115" height="95" rx="8" fill="url(#boxGrad-${projectId})" stroke="${c.node2.color}" stroke-width="1.5"/>
            <circle cx="18" cy="22" r="5" fill="${c.node2.color}"/>
            <text x="18" y="48" fill="#ffffff" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">${c.node2.title}</text>
            <text x="18" y="70" fill="#94a3b8" font-size="8.8" font-family="system-ui, sans-serif">${c.node2.sub}</text>
        </g>

        <g transform="translate(350, 55)">
            <rect width="115" height="95" rx="8" fill="url(#boxGrad-${projectId})" stroke="${c.node3.color}" stroke-width="2"/>
            <circle cx="18" cy="22" r="5" fill="${c.node3.color}"/>
            <text x="18" y="48" fill="#ffffff" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">${c.node3.title}</text>
            <text x="18" y="70" fill="#67e8f9" font-size="8.8" font-family="system-ui, sans-serif">${c.node3.sub}</text>
        </g>

        <g transform="translate(520, 55)">
            <rect width="115" height="95" rx="8" fill="url(#boxGrad-${projectId})" stroke="${c.node4.color}" stroke-width="1.5"/>
            <circle cx="18" cy="22" r="5" fill="${c.node4.color}"/>
            <text x="18" y="48" fill="#ffffff" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">${c.node4.title}</text>
            <text x="18" y="70" fill="#94a3b8" font-size="8.8" font-family="system-ui, sans-serif">${c.node4.sub}</text>
        </g>

        <g transform="translate(640, 55)">
            <rect width="110" height="95" rx="8" fill="url(#boxGrad-${projectId})" stroke="${c.node5.color}" stroke-width="1.5"/>
            <circle cx="18" cy="22" r="5" fill="${c.node5.color}"/>
            <text x="14" y="48" fill="#ffffff" font-size="10.5" font-weight="bold" font-family="system-ui, sans-serif">${c.node5.title}</text>
            <text x="14" y="70" fill="#94a3b8" font-size="8.5" font-family="system-ui, sans-serif">${c.node5.sub}</text>
        </g>
    </svg>
    `;
}

function getPipelineSvg(projectId, data) {
    const pipelines = {
        sweetbite: [
            { step: '01', title: 'Order Ingest', desc: 'Front-desk POS tap triggers client state' },
            { step: '02', title: 'Optimistic UI', desc: 'Instant local UI response before network' },
            { step: '03', title: 'WS Broadcast', desc: 'Supabase Realtime channels (<500ms)' },
            { step: '04', title: 'PostgreSQL Write', desc: 'ACID transaction with line items ledger' },
            { step: '05', title: 'Kitchen Dispatch', desc: 'KDS station audio alert & order display' }
        ],
        emergency: [
            { step: '01', title: 'SOS Trigger', desc: 'Citizen one-tap distress button clicked' },
            { step: '02', title: 'Telemetry Grab', desc: 'High-accuracy GPS + audio voice note buffer' },
            { step: '03', title: 'Offline Guard', desc: 'Client IndexedDB queue preserves data on drop' },
            { step: '04', title: 'FastAPI Dispatch', desc: 'Secure payload routing to emergency ops' },
            { step: '05', title: 'Operator Alert', desc: 'Dispatcher live map pinpoint & voice playback' }
        ],
        patron: [
            { step: '01', title: 'Pass Request', desc: 'Resident generates guest access in portal' },
            { step: '02', title: 'HMAC Signing', desc: 'Cryptographic single-use token embedded in QR' },
            { step: '03', title: 'Gate Scan', desc: 'Physical gatekeeper scanner decodes QR code' },
            { step: '04', title: 'DB Verification', desc: 'Server validates expiration & entry privileges' },
            { step: '05', title: 'Gate Unlock', desc: 'Barrier arm opened & audit entry logged' }
        ],
        bizconnect: [
            { step: '01', title: 'User Request', desc: 'Enterprise client accesses domain URL' },
            { step: '02', title: 'Edge Delivery', desc: 'Sub-second lightweight payload, 0 bloat' },
            { step: '03', title: 'Service Explorer', desc: 'Client navigates enterprise capabilities' },
            { step: '04', title: 'Quote Ingest', desc: 'Structured quotation payload submitted' },
            { step: '05', title: 'Lead Routing', desc: 'Direct corporate email & CRM transmission' }
        ],
        kelrose: [
            { step: '01', title: 'Tour Browse', desc: 'Traveler explores curated Ghana regions' },
            { step: '02', title: 'Itinerary Select', desc: 'Dynamic schedule and package selected' },
            { step: '03', title: 'Reservation', desc: 'Booking form captures dates and guest count' },
            { step: '04', title: 'Lead Capture', desc: 'Secure session validated and queued' },
            { step: '05', title: 'Ops Handshake', desc: 'Direct WhatsApp and email lead dispatch' }
        ]
    };

    const pipe = pipelines[projectId] || pipelines.sweetbite;
    
    return `
    <svg class="diagram-svg" viewBox="0 0 760 170" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Event and Data Pipeline for ${data.title}">
        <defs>
            <linearGradient id="pipeStepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#073642" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#002b36" stop-opacity="0.98"/>
            </linearGradient>
        </defs>

        <line x1="50" y1="85" x2="710" y2="85" stroke="#0e7490" stroke-width="2" stroke-dasharray="6 4"/>

        ${pipe.map((item, idx) => {
            const x = 15 + idx * 148;
            return `
            <g transform="translate(${x}, 35)">
                <rect width="138" height="98" rx="8" fill="url(#pipeStepGrad)" stroke="#2aa198" stroke-width="1.2"/>
                <rect x="10" y="10" width="26" height="20" rx="4" fill="rgba(42, 161, 152, 0.25)"/>
                <text x="23" y="24" fill="#2aa198" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">${item.step}</text>
                <text x="12" y="50" fill="#ffffff" font-size="10.8" font-weight="bold" font-family="system-ui, sans-serif">${item.title}</text>
                <text x="12" y="70" fill="#94a3b8" font-size="8.4" font-family="system-ui, sans-serif">${item.desc}</text>
            </g>
            `;
        }).join('')}
    </svg>
    `;
}

function openProjectModal(projectId) {
    const data = PROJECT_CASE_STUDIES[projectId];
    if (!data || !projectModal || !projectModalContent) return;

    trackAnalyticsEvent('view_case_study', { title: `Case Study: ${data.title}` });

    const demoBtnHTML = data.demo 
        ? `<a href="${data.demo}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> <span>Live Demo</span></a>` 
        : '';
    const codeBtnHTML = data.github 
        ? `<a href="${data.github}" target="_blank" rel="noopener" class="btn btn-outline"><i class="fab fa-github" aria-hidden="true"></i> <span>Source Code</span></a>` 
        : '';

    const featuresHTML = data.features.map(f => `
        <div class="feature-item">
            <i class="fas fa-check-circle" aria-hidden="true" style="color: var(--accent); margin-top: 3px;"></i>
            <span>${f}</span>
        </div>
    `).join('');

    const rolePillsHTML = data.roles.map(r => `<span class="role-pill">${r}</span>`).join('');

    projectModalContent.innerHTML = `
        <div class="case-study-badge-row">
            <span class="project-type-pill">${data.category}</span>
            <span class="project-status ${data.status.toLowerCase().includes('active') ? 'active' : 'live'}">${data.status}</span>
        </div>
        <h2 class="case-study-title" id="modalTitle">${data.title}</h2>
        <p class="case-study-tagline">${data.tagline}</p>
        
        <!-- Multi-Tab Case Study Media Gallery -->
        <div class="case-study-media-container" id="modalMediaGallery">
            <div class="case-study-media-tabs" role="tablist" aria-label="Media preview tabs">
                <button type="button" class="media-tab active" data-tab="ui" role="tab" aria-selected="true">
                    <i class="fas fa-desktop" aria-hidden="true"></i> System Interface
                </button>
                <button type="button" class="media-tab" data-tab="arch" role="tab" aria-selected="false">
                    <i class="fas fa-network-wired" aria-hidden="true"></i> Architecture Topology
                </button>
                <button type="button" class="media-tab" data-tab="pipeline" role="tab" aria-selected="false">
                    <i class="fas fa-stream" aria-hidden="true"></i> Event &amp; Data Pipeline
                </button>
            </div>
            <div class="media-stage">
                <!-- View 1: UI Preview -->
                <div class="media-view" data-view="ui">
                    <img src="${data.image}" alt="${data.title} System Interface Preview" loading="eager">
                </div>
                <!-- View 2: Architecture Topology Diagram -->
                <div class="media-view is-hidden" data-view="arch">
                    <div class="media-diagram-stage">
                        ${getArchitectureSvg(projectId, data)}
                    </div>
                </div>
                <!-- View 3: Data Pipeline Diagram -->
                <div class="media-view is-hidden" data-view="pipeline">
                    <div class="media-diagram-stage">
                        ${getPipelineSvg(projectId, data)}
                    </div>
                </div>
            </div>
        </div>

        <!-- 01 The Problem -->
        <div class="case-study-section">
            <div class="case-study-heading">
                <span class="section-num">01</span>
                <span>The Problem</span>
            </div>
            <p class="case-study-body">${data.problem}</p>
        </div>

        <!-- 02 The Approach -->
        <div class="case-study-section">
            <div class="case-study-heading">
                <span class="section-num">02</span>
                <span>The Approach</span>
            </div>
            <p class="case-study-body">${data.approach}</p>
        </div>

        <!-- 03 The Solution -->
        <div class="case-study-section">
            <div class="case-study-heading">
                <span class="section-num">03</span>
                <span>The Solution &amp; Key Features</span>
            </div>
            <p class="case-study-body">${data.solution}</p>
            <div class="project-feature-list" style="margin-top: 16px;">
                ${featuresHTML}
            </div>
        </div>

        <!-- 04 System Architecture -->
        <div class="case-study-section">
            <div class="case-study-heading">
                <span class="section-num">04</span>
                <span>System Architecture</span>
            </div>
            <div class="architecture-grid">
                <div class="arch-box">
                    <span class="arch-layer">Frontend</span>
                    <span class="arch-tech">${data.arch.frontend.tech}</span>
                    <span class="arch-detail">${data.arch.frontend.detail}</span>
                </div>
                <div class="arch-box">
                    <span class="arch-layer">Backend &amp; API</span>
                    <span class="arch-tech">${data.arch.backend.tech}</span>
                    <span class="arch-detail">${data.arch.backend.detail}</span>
                </div>
                <div class="arch-box">
                    <span class="arch-layer">Database &amp; Data Layer</span>
                    <span class="arch-tech">${data.arch.database.tech}</span>
                    <span class="arch-detail">${data.arch.database.detail}</span>
                </div>
                <div class="arch-box">
                    <span class="arch-layer">Infrastructure &amp; Real-time</span>
                    <span class="arch-tech">${data.arch.infra.tech}</span>
                    <span class="arch-detail">${data.arch.infra.detail}</span>
                </div>
            </div>
        </div>

        <!-- 05 Key Challenges -->
        <div class="case-study-section">
            <div class="case-study-heading">
                <span class="section-num">05</span>
                <span>Key Technical Challenges</span>
            </div>
            <p class="case-study-body">${data.challenges}</p>
        </div>

        <!-- 06 Business Outcome -->
        <div class="case-study-section">
            <div class="case-study-heading">
                <span class="section-num">06</span>
                <span>Business &amp; Operational Outcome</span>
            </div>
            <p class="case-study-body">${data.outcome}</p>
        </div>

        <!-- 07 My Role -->
        <div class="case-study-section">
            <div class="case-study-heading">
                <span class="section-num">07</span>
                <span>My Role &amp; Contributions</span>
            </div>
            <div class="role-pills">
                ${rolePillsHTML}
            </div>
            <p class="case-study-body" style="margin-top: 14px;">${data.roleDetail}</p>
        </div>

        <!-- Actions -->
        <div class="case-study-actions">
            ${demoBtnHTML}
            ${codeBtnHTML}
            <button type="button" class="btn btn-outline" id="modalDismissBtn">Close Case Study</button>
        </div>
    `;

    // Multi-tab media switching
    const mediaTabs = projectModalContent.querySelectorAll('.media-tab');
    const mediaViews = projectModalContent.querySelectorAll('.media-view');

    mediaTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetView = tab.getAttribute('data-tab');
            mediaTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            mediaViews.forEach(v => {
                if (v.getAttribute('data-view') === targetView) {
                    v.classList.remove('is-hidden');
                } else {
                    v.classList.add('is-hidden');
                }
            });

            if (typeof trackAnalyticsEvent === 'function') {
                trackAnalyticsEvent('modal_tab_click', { project: projectId, tab: targetView });
            }
        });
    });

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
document.querySelectorAll('.faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const panel = item.querySelector('.faq-panel');
        const isActive = item.classList.contains('active');

        document.querySelectorAll('.faq-item.active').forEach(activeItem => {
            activeItem.classList.remove('active');
            const activeBtn = activeItem.querySelector('.faq-trigger');
            if (activeBtn) activeBtn.setAttribute('aria-expanded', 'false');
            const activePanel = activeItem.querySelector('.faq-panel');
            if (activePanel) activePanel.style.maxHeight = null;
        });

        if (!isActive) {
            item.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            if (panel) panel.style.maxHeight = `${panel.scrollHeight + 30}px`;
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
                trackAnalyticsEvent('contact_form_submit', { title: 'Web3Forms Inquiry' });
                contactForm.reset();
            } else {
                throw new Error(data.message || 'Submission error');
            }
        } catch (error) {
            console.warn('Web3Forms fetch issue, falling back to mailto:', error);
            const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
            const body = encodeURIComponent(`Hello Charles,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`);
            showFormStatus('error', 'Connecting to your email application to ensure message delivery...');
            trackAnalyticsEvent('contact_form_mailto_fallback', { title: 'Mailto Fallback Inquiry' });
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

// ==========================================================================
// 10. High-Intent Telemetry Event Listeners (Recruiters & Clients)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Track Resume Clicks & Downloads
    document.querySelectorAll('a[href*="resume"], .btn-nav-resume').forEach(el => {
        el.addEventListener('click', () => {
            trackAnalyticsEvent('resume_interaction', { title: 'Resume PDF / View' });
        });
    });

    // Track WhatsApp Direct Inquiries
    document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
        el.addEventListener('click', () => {
            trackAnalyticsEvent('contact_whatsapp', { title: 'WhatsApp Direct Chat' });
        });
    });

    // Track Direct Email Inquiries
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
        el.addEventListener('click', () => {
            trackAnalyticsEvent('contact_email', { title: 'Direct Email Click' });
        });
    });

    // Track Copy Email Button
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            trackAnalyticsEvent('copy_email', { title: 'Email Address Copied' });
        });
    }

    // Track Outbound Live Demos & GitHub Links
    document.querySelectorAll('a[target="_blank"]').forEach(el => {
        const href = el.getAttribute('href') || '';
        if (href.includes('wa.me') || href.includes('resume')) return;
        
        el.addEventListener('click', () => {
            const label = el.getAttribute('aria-label') || el.textContent.trim() || href;
            if (href.includes('github.com')) {
                trackAnalyticsEvent('github_outbound', { title: `GitHub: ${label}` });
            } else {
                trackAnalyticsEvent('live_demo_outbound', { title: `Live Demo: ${label}` });
            }
        });
    });
});

// ==========================================================================
// 11. Progressive Web App (PWA) Offline Service Worker Registration
// ==========================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('PWA Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.warn('PWA Service Worker registration skipped/failed:', error);
            });
    });
}

