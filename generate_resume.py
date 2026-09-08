import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class ATSResume(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=14)
        self.set_margins(14, 12, 14)
        
        # Color Palette - Professional Deep Teal & Charcoal
        self.color_primary = (0, 43, 54)      # #002b36 Deep Ocean Teal
        self.color_accent = (42, 161, 152)    # #2aa198 Cyan / Teal Accent
        self.color_dark = (30, 41, 59)        # Slate 800
        self.color_muted = (71, 85, 105)      # Slate 600
        self.color_link = (14, 116, 144)      # Cyan 700

    def section_header(self, title):
        self.ln(3.5)
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(*self.color_primary)
        self.cell(0, 5, title.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        # Accent rule line
        y = self.get_y()
        self.set_draw_color(*self.color_accent)
        self.set_line_width(0.5)
        self.line(14, y, 196, y)
        self.ln(2.5)

    def item_header(self, title, context="", period=""):
        self.set_font("Helvetica", "B", 9.8)
        self.set_text_color(*self.color_dark)
        
        avail_w = 182  # 210 - 28
        period_w = self.get_string_width(period) + 2 if period else 0
        left_w = avail_w - period_w
        
        self.cell(left_w, 4.5, title, new_x=XPos.RIGHT, new_y=YPos.TOP)
        if period:
            self.set_font("Helvetica", "", 8.8)
            self.set_text_color(*self.color_muted)
            self.cell(period_w, 4.5, period, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
        else:
            self.ln()

        if context:
            self.set_font("Helvetica", "I", 8.8)
            self.set_text_color(*self.color_muted)
            self.cell(0, 4.0, context, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def bullet(self, text, bold_prefix=""):
        self.set_font("Helvetica", "", 9.0)
        self.set_text_color(*self.color_dark)
        bullet_char = "-"
        indent = 3
        bullet_w = 4
        content_w = 182 - indent - bullet_w

        self.set_x(14 + indent)
        self.cell(bullet_w, 4.2, bullet_char, new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        if bold_prefix:
            self.set_font("Helvetica", "B", 9.0)
            self.write(4.2, bold_prefix + " ")
            self.set_font("Helvetica", "", 9.0)
        
        self.multi_cell(content_w, 4.2, text)

def build_pdf():
    pdf = ATSResume()
    pdf.add_page()

    # ==================== HEADER ====================
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(*pdf.color_primary)
    pdf.cell(0, 8, "ESSIAW CHARLES JNR", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(*pdf.color_accent)
    pdf.cell(0, 5, "Software Developer & Full-Stack Engineer", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

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

    # ==================== PROFESSIONAL SUMMARY ====================
    pdf.section_header("Professional Summary")
    summary_text = (
        "High-velocity Full-Stack Software Developer specializing in resilient web applications, real-time "
        "event systems, and clean UI engineering. Proven track record architecting mission-critical production platforms "
        "including cloud restaurant POS/KDS systems, emergency dispatch command software, and secure QR access control. "
        "Proficient in TypeScript, Next.js, Supabase, PostgreSQL, Python, and Docker with a disciplined focus on sub-second "
        "latency, 100% Core Web Vitals, and modular, testable codebases."
    )
    pdf.set_font("Helvetica", "", 9.0)
    pdf.set_text_color(*pdf.color_dark)
    pdf.multi_cell(182, 4.2, summary_text)

    # ==================== TECHNICAL SKILLS ====================
    pdf.section_header("Technical Skills")
    skills = [
        ("Languages:", "TypeScript, JavaScript (ES6+), Python, SQL (PostgreSQL), HTML5, CSS3"),
        ("Frontend:", "Next.js (App Router), React, Tailwind CSS, Responsive UI/UX, State Management, Core Web Vitals"),
        ("Backend & APIs:", "Node.js, Supabase (Realtime & Auth), RESTful APIs, WebSockets, Python (FastAPI/Flask)"),
        ("Databases & Cloud:", "PostgreSQL, Supabase DB, Relational Data Modeling, Docker, Vercel, Render, Git/GitHub"),
        ("Specializations:", "Real-Time Event Pipelines, Point of Sale Systems, QR Cryptographic Security, GPS Geolocation, UI/UX")
    ]
    for category, items in skills:
        pdf.set_font("Helvetica", "B", 8.8)
        pdf.set_text_color(*pdf.color_primary)
        pdf.cell(32, 4.1, category, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("Helvetica", "", 8.8)
        pdf.set_text_color(*pdf.color_dark)
        pdf.cell(0, 4.1, items, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ==================== FEATURED PRODUCTION PROJECTS ====================
    pdf.section_header("Key Software Projects & Production Architecture")

    # Project 1: Sweetbite POS
    pdf.item_header("Sweetbite Food POS & Kitchen Display System (KDS)", "Next.js 14, TypeScript, Supabase Realtime, PostgreSQL, Tailwind CSS", "Active Project")
    pdf.bullet(
        "Architected a synchronized cloud Point of Sale (POS) and Kitchen Display System (KDS) for food service operations, eliminating manual order slips and kitchen communication delays.",
        "Real-Time Pipeline:"
    )
    pdf.bullet(
        "Leveraged Supabase Realtime WebSocket channels to broadcast order creation, updates, and ticket closures across multiple kitchen stations with sub-second latency.",
        "Sub-Second Latency:"
    )
    pdf.bullet(
        "Implemented auditory order alerts, responsive touch-friendly ticket layouts, automated table-routing, and optimistic UI updates for reliable offline/reconnection handling.",
        "Kitchen UX:"
    )
    pdf.ln(1.5)

    # Project 2: Emergency Response System
    pdf.item_header("Ghana Emergency Response & Dispatch Telemetry System", "TypeScript, JavaScript, Python, PostgreSQL, Geolocation API, WebRTC", "Live Deployment")
    pdf.bullet(
        "Developed emergency response web platform enabling instant geolocation-tagged SOS distress calls for rapid dispatch of emergency services across Ghana.",
        "Rapid Dispatch:"
    )
    pdf.bullet(
        "Engineered live coordinate tracking with interactive mapping and instantaneous voice-note transmission, decreasing dispatch response coordination times significantly.",
        "Live Telemetry:"
    )
    pdf.bullet(
        "Integrated high-reliability fallback queues to persist emergency alerts under intermittent cellular connectivity.",
        "Fault Tolerance:"
    )
    pdf.ln(1.5)

    # Project 3: Patron Housing Access Control
    pdf.item_header("Patron Housing Access Control & Visitor Management", "Python, PostgreSQL, Docker, QR Cryptographic Passports, Modern CSS", "Production Solution")
    pdf.bullet(
        "Engineered automated residential access control platform handling digital visitor issuance, security gate check-ins, and cryptographic QR code validation.",
        "Access Security:"
    )
    pdf.bullet(
        "Built administrative dashboards with real-time entry/exit logs, resident authorization workflows, and Dockerized deployment on Render cloud infrastructure.",
        "Infrastructure:"
    )
    pdf.ln(1.5)

    # Project 4: Commercial Portals (BizConnect & Kelrose Tours)
    pdf.item_header("Enterprise Client Platforms (BizConnect & Kelrose Tours)", "Modern JavaScript, Accessible UI/UX, SEO Optimization, REST APIs", "Client Commercial")
    pdf.bullet(
        "Delivered enterprise corporate web portal for BizConnect Technologies with zero bundle bloat and 100% Core Web Vitals performance score.",
        "BizConnect:"
    )
    pdf.bullet(
        "Designed and shipped Kelrose Tours booking platform with curated dynamic tour itineraries, interactive location guides, and client lead conversion funnels.",
        "Kelrose Tours:"
    )
    pdf.ln(2)

    # ==================== EXPERIENCE / CAREER MILESTONES ====================
    pdf.section_header("Engineering Experience & Milestones")

    pdf.item_header("Full-Stack Systems Engineer & Independent Developer", "Autonomous Software Development & Client Solutions - Accra, Ghana", "2024 - Present")
    pdf.bullet(
        "Architect and maintain end-to-end full-stack software products for hospitality, civic security, and commercial clients.",
        "Systems Delivery:"
    )
    pdf.bullet(
        "Design relational database schemas, write optimized SQL queries, implement secure authentication, and configure cloud CI/CD deployment pipelines.",
        "Full Lifecycle:"
    )
    pdf.bullet(
        "Achieved a 5.0 Google client rating across commercial engagements through disciplined deadlines, transparent communication, and zero-defect deployments.",
        "Client Excellence:"
    )
    pdf.ln(1.5)

    pdf.item_header("Commercial Web Engineer & Client Consultant", "Freelance & Contract Engagements", "2023 - 2024")
    pdf.bullet(
        "Collaborated with SME business leaders to revamp digital presence, modernize legacy frontends, and implement high-converting customer booking flows.",
        "Client Modernization:"
    )
    pdf.bullet(
        "Engineered responsive, accessible layouts following WCAG 2.1 AA standards and optimized mobile rendering speeds by over 40%.",
        "Performance Optimization:"
    )
    pdf.ln(1.5)

    pdf.item_header("Autonomous Software Apprenticeship & Foundations", "Intensive Systems Engineering & Deliberate Practice (1,500+ Hours)", "2022 - 2023")
    pdf.bullet(
        "Completed rigorous curriculum in data structures, algorithms, asynchronous programming, modern web standards, and cloud containerization.",
        "Core Foundations:"
    )
    pdf.bullet(
        "Pioneered AI-augmented development workflows, pairing with modern developer tools and agents to prototype, refactor, and stress-test code at accelerated speeds.",
        "AI-Augmented Engineering:"
    )

    # ==================== EDUCATION & CREDENTIALS ====================
    pdf.section_header("Education, Certifications & Continuous Learning")
    pdf.item_header("Software Engineering & Full-Stack Web Development", "Comprehensive Autonomous Curricula, Open-Source Contributions & Professional Practice", "Accra, Ghana")
    pdf.bullet("Continuous mastery in Next.js, Modern TypeScript, PostgreSQL Schema Architecture, and Cloud Systems.")

    output_path = "resume.pdf"
    pdf.output(output_path)
    print(f"Successfully generated {output_path} ({os.path.getsize(output_path)} bytes, {pdf.pages_count} pages)")

if __name__ == "__main__":
    build_pdf()
