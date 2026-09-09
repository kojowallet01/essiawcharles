import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class ATSResume(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=False)
        self.set_margins(14, 11, 14)
        
        # Color Palette - Professional Deep Teal & Slate Charcoal
        self.color_primary = (0, 43, 54)      # #002b36 Deep Ocean Teal
        self.color_accent = (42, 161, 152)    # #2aa198 Cyan / Teal Accent
        self.color_dark = (30, 41, 59)        # Slate 800
        self.color_muted = (71, 85, 105)      # Slate 600
        self.color_link = (14, 116, 144)      # Cyan 700

    def section_header(self, title):
        self.ln(3.2)
        self.set_font("Helvetica", "B", 10.2)
        self.set_text_color(*self.color_primary)
        self.cell(0, 4.8, title.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        y = self.get_y()
        self.set_draw_color(*self.color_accent)
        self.set_line_width(0.5)
        self.line(14, y, 196, y)
        self.ln(2.2)

    def item_header(self, title, context="", period=""):
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(*self.color_dark)
        
        avail_w = 182  # 210 - 28
        period_w = self.get_string_width(period) + 2 if period else 0
        left_w = avail_w - period_w
        
        self.cell(left_w, 4.4, title, new_x=XPos.RIGHT, new_y=YPos.TOP)
        if period:
            self.set_font("Helvetica", "", 8.6)
            self.set_text_color(*self.color_muted)
            self.cell(period_w, 4.4, period, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
        else:
            self.ln()

        if context:
            self.set_font("Helvetica", "I", 8.6)
            self.set_text_color(*self.color_muted)
            self.cell(0, 3.8, context, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def bullet(self, text, bold_prefix=""):
        self.set_font("Helvetica", "", 8.8)
        self.set_text_color(*self.color_dark)
        bullet_char = "-"
        indent = 3
        bullet_w = 4
        content_w = 182 - indent - bullet_w

        self.set_x(14 + indent)
        self.cell(bullet_w, 4.1, bullet_char, new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        if bold_prefix:
            self.set_font("Helvetica", "B", 8.8)
            self.write(4.1, bold_prefix + " ")
            self.set_font("Helvetica", "", 8.8)
        
        self.multi_cell(content_w, 4.1, text)

def build_pdf():
    pdf = ATSResume()

    # ==================== PAGE 1 ====================
    pdf.add_page()

    # --- Header ---
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(*pdf.color_primary)
    pdf.cell(0, 8, "ESSIAW CHARLES JNR", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(*pdf.color_accent)
    pdf.cell(0, 5, "Software Developer & Full-Stack Systems Engineer", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.ln(1)
    # Contact Bar
    pdf.set_font("Helvetica", "", 8.8)
    pdf.set_text_color(*pdf.color_muted)
    contact_line = "Accra, Ghana (Remote & Relocation Ready)  |  +233 53 798 4448  |  charlesessiawjnr@gmail.com"
    pdf.cell(0, 4.2, contact_line, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    # Links Bar
    links = [
        ("Portfolio: kojowallet01.github.io/essiawcharles", "https://kojowallet01.github.io/essiawcharles/"),
        ("GitHub: github.com/kojowallet01", "https://github.com/kojowallet01"),
        ("LinkedIn: charles-essiaw", "https://www.linkedin.com/in/charles-essiaw-92794b253/")
    ]
    pdf.set_font("Helvetica", "", 8.8)
    pdf.set_text_color(*pdf.color_link)
    link_line_w = sum(pdf.get_string_width(label) for label, _ in links) + 16
    start_x = (210 - link_line_w) / 2
    pdf.set_x(start_x)
    for i, (label, url) in enumerate(links):
        pdf.write(4.2, label, link=url)
        if i < len(links) - 1:
            pdf.set_text_color(*pdf.color_muted)
            pdf.write(4.2, "   |   ")
            pdf.set_text_color(*pdf.color_link)
    pdf.ln(4)

    # --- Professional Summary ---
    pdf.section_header("Professional Summary")
    summary_text = (
        "High-velocity Full-Stack Software Developer specializing in resilient web applications, real-time "
        "event-driven systems, and clean UI engineering. Proven track record architecting mission-critical production "
        "platforms including cloud restaurant POS/KDS systems, national emergency dispatch command software, and "
        "cryptographic QR access control. Extensive proficiency in TypeScript, Next.js (App Router), Supabase, "
        "PostgreSQL, Python, and Docker with an unwavering engineering commitment to sub-second latency, 100% Core Web "
        "Vitals, and modular, testable codebases."
    )
    pdf.set_font("Helvetica", "", 9.0)
    pdf.set_text_color(*pdf.color_dark)
    pdf.multi_cell(182, 4.2, summary_text)

    # --- Technical Skills Matrix ---
    pdf.section_header("Technical Skills & Architecture Matrix")
    skills = [
        ("Languages:", "TypeScript, JavaScript (ES6+), Python, SQL (PostgreSQL), HTML5, CSS3, Bash"),
        ("Frontend Architecture:", "Next.js 14/15 (App Router), React, Tailwind CSS, Component Architecture, State Machines, Core Web Vitals"),
        ("Backend & Realtime:", "Node.js, Supabase (Realtime & Auth), RESTful APIs, WebSockets, Python (FastAPI/Flask), Server Actions"),
        ("Databases & Cloud:", "PostgreSQL, Relational Data Modeling, Docker, Vercel, Render, Git/GitHub, Linux Infrastructure"),
        ("Engineering Disciplines:", "Real-Time Event Pipelines, Point of Sale Systems, QR Cryptographic Security, GPS Geolocation, Web Performance")
    ]
    for category, items in skills:
        pdf.set_font("Helvetica", "B", 8.8)
        pdf.set_text_color(*pdf.color_primary)
        pdf.cell(39, 4.2, category, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("Helvetica", "", 8.8)
        pdf.set_text_color(*pdf.color_dark)
        pdf.cell(0, 4.2, items, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # --- Key Architectural Software Projects ---
    pdf.section_header("Key Architectural Software Projects")

    # Project 1: Sweetbite POS & KDS
    pdf.item_header("Sweetbite Food POS & Kitchen Display System (KDS)", "Next.js 14, TypeScript, Supabase Realtime, PostgreSQL, Tailwind CSS", "Active Production System")
    pdf.bullet(
        "Architected an end-to-end synchronized cloud Point of Sale (POS) and Kitchen Display System (KDS) for busy food service operations, replacing physical paper tickets and eliminating kitchen communication bottlenecks.",
        "Real-Time Telemetry:"
    )
    pdf.bullet(
        "Leveraged Supabase Realtime WebSocket channels with bi-directional state sync to broadcast order placement, modifications, and ticket status changes across kitchen stations with sub-500ms latency.",
        "Sub-Second Synchronization:"
    )
    pdf.bullet(
        "Designed auditory kitchen alert chime systems, high-contrast touch ticket layouts, automated table-routing, and optimistic UI updates for seamless offline and reconnection recovery.",
        "Kitchen Operations UX:"
    )
    pdf.bullet(
        "Modeled relational PostgreSQL schemas with normalized order ticket states, line items, and station-routing tables to guarantee zero order collision during concurrent dining rushes.",
        "Data Integrity:"
    )
    pdf.ln(2.0)

    # Project 2: Ghana Emergency Response System
    pdf.item_header("Ghana Emergency Response & Dispatch Telemetry System", "TypeScript, JavaScript, Python, PostgreSQL, Geolocation API, WebRTC", "Live Deployment")
    pdf.bullet(
        "Engineered a mission-critical emergency web application enabling instant geolocation-tagged SOS distress calls for rapid dispatch coordination of emergency response units across Ghana.",
        "Rapid Citizen SOS:"
    )
    pdf.bullet(
        "Developed live coordinate telemetry with interactive mapping, geofencing, and instantaneous voice-note transmission, slashing incident verification and response coordination times.",
        "Live Dispatch Telemetry:"
    )
    pdf.bullet(
        "Architected high-reliability client-side offline queues and service worker persistence to safely cache emergency distress requests under intermittent or severed cellular connectivity.",
        "Offline Fault Tolerance:"
    )
    pdf.bullet(
        "Implemented administrative dispatch console allowing operators to triage incidents by severity, visualize proximity-based emergency units, and update live call statuses.",
        "Command Console:"
    )
    pdf.ln(2.0)

    # Project 3: Patron Housing Access Control
    pdf.item_header("Patron Housing Access Control & Visitor Management", "Python, PostgreSQL, Docker, QR Cryptographic Passports, Modern CSS", "Production Solution")
    pdf.bullet(
        "Engineered automated residential access control platform handling digital visitor pass generation, security gate check-ins, and cryptographic QR code validation.",
        "Cryptographic Access:"
    )
    pdf.bullet(
        "Built centralized administrative dashboards with real-time entry/exit logs, resident authorization workflows, and Dockerized deployment on Render cloud infrastructure.",
        "Infrastructure & Ops:"
    )
    pdf.bullet(
        "Implemented automated security revocation protocols and single-use digital visitor passes, preventing credential sharing and unauthorized residential access.",
        "Tamper-Proof Audit:"
    )
    pdf.ln(2.0)

    # --- Architectural Metrics & Quality Highlights ---
    pdf.section_header("Architectural Metrics & Performance Benchmarks")
    metrics = [
        ("Sub-500ms Broadcast:", "Supabase Realtime WebSockets broadcasting concurrent kitchen order updates."),
        ("100% Core Web Vitals:", "Zero render-blocking scripts, sub-second LCP, and lightweight vanilla architecture."),
        ("Zero Data Collision:", "PostgreSQL strict transactional safety, parameterized queries, and RLS policies."),
        ("Offline Resilience:", "Graceful degradation, client-side event queues, and instant reconnection re-sync.")
    ]
    for metric_title, metric_desc in metrics:
        pdf.set_font("Helvetica", "B", 8.6)
        pdf.set_text_color(*pdf.color_primary)
        pdf.cell(42, 4.0, metric_title, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("Helvetica", "", 8.6)
        pdf.set_text_color(*pdf.color_dark)
        pdf.cell(0, 4.0, metric_desc, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ==================== PAGE 2 ====================
    pdf.add_page()

    # --- Page 2 Running Header ---
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_text_color(*pdf.color_primary)
    pdf.cell(100, 4.0, "ESSIAW CHARLES JNR  |  TECHNICAL CV & ENGINEERING PROFILE", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(*pdf.color_muted)
    pdf.cell(82, 4.0, "PAGE 2 OF 2  |  charlesessiawjnr@gmail.com", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
    pdf.set_draw_color(*pdf.color_accent)
    pdf.set_line_width(0.3)
    y = pdf.get_y()
    pdf.line(14, y, 196, y)
    pdf.ln(1.5)

    # --- Enterprise Commercial Platforms ---
    pdf.section_header("Enterprise Commercial Platforms & Deployments")

    pdf.item_header("BizConnect Technologies Enterprise Portal", "Modern JavaScript, Accessible UI/UX, Performance Optimization, REST APIs", "Client Production")
    pdf.bullet(
        "Engineered enterprise corporate web platform for BizConnect Technologies featuring zero external bundle bloat, responsive layouts, and a perfect 100% Core Web Vitals audit.",
        "Zero-Bloat Engineering:"
    )
    pdf.bullet(
        "Implemented WCAG 2.1 AA accessible typography, keyboard navigation, and semantic HTML structure to guarantee universal accessibility across enterprise clients.",
        "Enterprise Accessibility:"
    )
    pdf.bullet(
        "Built modular component system and client-side contact inquiries API integration, driving a 35% increase in verified inbound enterprise leads.",
        "Lead Generation:"
    )
    pdf.ln(2.0)

    pdf.item_header("Kelrose Tours Travel & Itinerary Booking Platform", "Dynamic JavaScript, Modern Responsive CSS, Tour Catalog, SEO Architecture", "Client Production")
    pdf.bullet(
        "Designed and deployed full-featured travel platform for Kelrose Tours featuring interactive tour itinerary catalogs, curated destination guides, and conversion funnels.",
        "Tour Architecture:"
    )
    pdf.bullet(
        "Optimized responsive layout, image delivery pipelines, and metadata indexing, enhancing organic search visibility and mobile user retention.",
        "Mobile Optimization:"
    )
    pdf.bullet(
        "Configured automated inquiry workflows routing customer booking requests directly to operations staff via encrypted communication channels.",
        "Booking Operations:"
    )
    pdf.ln(2.0)

    # --- Engineering Experience ---
    pdf.section_header("Professional Engineering Experience & Milestones")

    pdf.item_header("Full-Stack Systems Engineer & Independent Developer", "Autonomous Software Engineering & Client Solutions - Accra, Ghana", "2024 - Present")
    pdf.bullet(
        "Lead the complete software engineering lifecycle for high-stakes web systems across hospitality, municipal emergency, and commercial enterprise sectors.",
        "Full-Lifecycle Engineering:"
    )
    pdf.bullet(
        "Architect robust database models in PostgreSQL, implement secure role-based access control, write asynchronous event-driven services, and manage continuous deployment on cloud infrastructure.",
        "Database & Cloud Delivery:"
    )
    pdf.bullet(
        "Maintain a 5.0 Google client satisfaction rating across commercial engagements through meticulous requirement scoping, disciplined delivery timelines, and proactive communication.",
        "Client Excellence:"
    )
    pdf.ln(2.0)

    pdf.item_header("Commercial Web Engineer & Client Consultant", "Freelance & Contract Engagements", "2023 - 2024")
    pdf.bullet(
        "Consulted with SME business owners to modernize legacy web applications, migrate outdated static pages to interactive modern stacks, and optimize conversion funnels.",
        "Frontend Modernization:"
    )
    pdf.bullet(
        "Implemented performance audits and asset optimization techniques, reducing page load times by over 40% and achieving sub-second Largest Contentful Paint (LCP).",
        "Performance Engineering:"
    )
    pdf.bullet(
        "Delivered responsive UI components adhering strictly to mobile-first standards, testing across multi-device viewports and legacy browser runtimes.",
        "Cross-Device Resilience:"
    )
    pdf.ln(2.0)

    pdf.item_header("Autonomous Software Apprenticeship & Foundations", "Intensive Systems Engineering & Deliberate Practice (1,500+ Hours)", "2022 - 2023")
    pdf.bullet(
        "Completed rigorous self-directed engineering curriculum covering algorithmic complexity, asynchronous concurrency, network protocols (HTTP/REST/WebSockets), and relational database modeling.",
        "Theoretical Foundations:"
    )
    pdf.bullet(
        "Pioneered AI-augmented development workflows, pairing with cutting-edge agentic tools to prototype, refactor, and rigorously stress-test codebases at accelerated speed.",
        "AI-Augmented Engineering:"
    )
    pdf.bullet(
        "Authored reproducible open-source web components and modular architectural blueprints shared with local developer communities in Accra.",
        "Community & Practice:"
    )
    pdf.ln(2.0)

    # --- Education, Certifications & Continuous Learning ---
    pdf.section_header("Education, Certifications & Continuous Mastery")
    pdf.item_header("Software Engineering & Systems Development", "Autonomous Curricula, Open-Source Contributions & Professional Practice", "Accra, Ghana")
    pdf.bullet("Continuous professional mastery in Next.js App Router, Advanced TypeScript Typing, PostgreSQL Query Optimization, and Cloud Native Deployments.")
    pdf.bullet("Committed to perpetual engineering refinement through daily deliberate practice, code review, architectural post-mortems, and modern web specifications.")
    pdf.ln(2.0)

    # --- Quality Standards & Methodologies ---
    pdf.section_header("Core Engineering Methodologies & Architectural Standards")
    principles = [
        ("Resilient System Design:", "Offline-first thinking, fallback event queues, optimistic UI state updates, and graceful network degradation."),
        ("Performance Discipline:", "Zero unnecessary dependencies, sub-second LCP, minimal DOM reflows, and rigorous Core Web Vitals adherence."),
        ("Code Quality & Delivery:", "Modular domain separation, type safety with TypeScript, clean git branching workflows, and rapid automated deployments.")
    ]
    for title, desc in principles:
        pdf.set_font("Helvetica", "B", 8.5)
        pdf.set_text_color(*pdf.color_primary)
        pdf.cell(48, 4.0, title, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("Helvetica", "", 8.5)
        pdf.set_text_color(*pdf.color_dark)
        pdf.cell(0, 4.0, desc, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    output_path = "resume.pdf"
    pdf.output(output_path)
    print(f"Successfully generated {output_path} ({os.path.getsize(output_path)} bytes, {pdf.pages_count} pages)")

if __name__ == "__main__":
    build_pdf()
