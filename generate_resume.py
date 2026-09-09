import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class DeveloperResume(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=False)
        self.margin_left = 16
        self.margin_right = 16
        self.margin_top = 14
        self.margin_bottom = 14
        self.content_w = 210 - self.margin_left - self.margin_right  # 178 mm
        self.set_margins(self.margin_left, self.margin_top, self.margin_right)
        
        # Exact Professional Color Palette
        self.c_primary = (15, 23, 42)       # Slate 900 / Deep Navy (#0f172a)
        self.c_accent = (14, 116, 144)      # Cyan 700 (#0e7490)
        self.c_dark = (30, 41, 59)          # Slate 800 (#1e293b)
        self.c_muted = (71, 85, 105)        # Slate 600 (#475569)
        self.c_rule = (148, 163, 184)       # Slate 400 (#94a3b8)

    def section_header(self, title):
        self.ln(3.0)
        self.set_font("Helvetica", "B", 9.8)
        self.set_text_color(*self.c_primary)
        self.cell(self.content_w, 4.4, title.upper(), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        y = self.get_y() + 0.5
        self.set_draw_color(*self.c_primary)
        self.set_line_width(0.4)
        self.line(self.margin_left, y, self.margin_left + self.content_w, y)
        self.set_y(y + 2.0)

    def item_header(self, title, subtitle="", status=""):
        self.ln(1.8)
        self.set_font("Helvetica", "B", 9.2)
        self.set_text_color(*self.c_primary)
        
        status_w = self.get_string_width(status) + 4 if status else 0
        left_w = self.content_w - status_w
        
        self.cell(left_w, 4.0, title, new_x=XPos.RIGHT, new_y=YPos.TOP)
        if status:
            self.set_font("Helvetica", "", 8.5)
            self.set_text_color(*self.c_muted)
            self.cell(status_w, 4.0, status, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
        else:
            self.ln()

        if subtitle:
            self.set_font("Helvetica", "I", 8.2)
            self.set_text_color(*self.c_muted)
            self.multi_cell(self.content_w, 3.6, subtitle)
            self.ln(0.6)

    def bullet(self, text):
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*self.c_dark)
        
        bullet_indent = 4.5
        self.set_left_margin(self.margin_left + bullet_indent)
        self.set_x(self.margin_left)
        
        bullet_char = chr(149)  # standard round bullet in Windows-1252 / Latin-1
        bullet_str = f"{bullet_char}  {text}"
        self.multi_cell(self.content_w - bullet_indent, 3.7, bullet_str)
        
        self.set_left_margin(self.margin_left)
        self.set_x(self.margin_left)

    def skill_line(self, category, items):
        self.set_font("Helvetica", "B", 8.6)
        self.set_text_color(*self.c_primary)
        cat_str = f"{category}: "
        cat_w = self.get_string_width(cat_str)
        
        self.cell(cat_w, 4.0, cat_str, new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*self.c_dark)
        self.multi_cell(self.content_w - cat_w, 4.0, items)


def generate():
    pdf = DeveloperResume()

    # =========================================================================
    # PAGE 1
    # =========================================================================
    pdf.add_page()

    # --- Header ---
    pdf.set_font("Helvetica", "B", 18.0)
    pdf.set_text_color(*pdf.c_primary)
    pdf.cell(pdf.content_w, 7.0, "ESSIAW CHARLES JNR", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("Helvetica", "B", 9.8)
    pdf.set_text_color(*pdf.c_accent)
    pdf.cell(pdf.content_w, 4.6, "Software Developer & Full-Stack Systems Engineer", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    # Contact line
    pdf.set_font("Helvetica", "", 8.4)
    pdf.set_text_color(*pdf.c_muted)
    contact_text = f"Accra, Ghana (Remote & Relocation Ready)  |  +233 53 798 4448  |  charlesessiawjnr@gmail.com"
    pdf.cell(pdf.content_w, 4.0, contact_text, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    # Underlined Links line
    links = [
        ("Portfolio", "https://kojowallet01.github.io/essiawcharles/"),
        ("GitHub", "https://github.com/kojowallet01"),
        ("LinkedIn", "https://www.linkedin.com/in/charles-essiaw-92794b253/")
    ]
    sep = "  |  "
    pdf.set_font("Helvetica", "U", 8.4)
    sep_w = pdf.get_string_width(sep)
    links_w = sum(pdf.get_string_width(label) for label, _ in links) + (len(links) - 1) * sep_w
    start_x = pdf.margin_left + (pdf.content_w - links_w) / 2
    pdf.set_x(start_x)
    for i, (label, url) in enumerate(links):
        pdf.set_font("Helvetica", "U", 8.4)
        pdf.set_text_color(*pdf.c_accent)
        pdf.write(4.0, label, link=url)
        if i < len(links) - 1:
            pdf.set_font("Helvetica", "", 8.4)
            pdf.set_text_color(*pdf.c_muted)
            pdf.write(4.0, sep)
    pdf.ln(5.0)

    # Header horizontal rule
    y = pdf.get_y()
    pdf.set_draw_color(*pdf.c_primary)
    pdf.set_line_width(0.5)
    pdf.line(pdf.margin_left, y, pdf.margin_left + pdf.content_w, y)
    pdf.set_y(y + 2.0)

    # --- PROFESSIONAL SUMMARY ---
    pdf.section_header("Professional Summary")
    summary = (
        "Full-stack software developer specializing in resilient web applications, real-time event-driven systems, "
        "and clean UI engineering. Experience architecting production platforms including a cloud restaurant POS/KDS "
        "system, an emergency dispatch coordination platform, and a cryptographic QR access-control system. "
        "Proficient in TypeScript, Next.js (App Router), Supabase, PostgreSQL, Python, and Docker, with a consistent "
        "focus on sub-second latency, strong Core Web Vitals scores, and modular, testable code."
    )
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(*pdf.c_dark)
    pdf.multi_cell(pdf.content_w, 3.8, summary)

    # --- TECHNICAL SKILLS ---
    pdf.section_header("Technical Skills")
    pdf.skill_line("Languages", "TypeScript, JavaScript (ES6+), Python, SQL (PostgreSQL), HTML5, CSS3, Bash")
    pdf.skill_line("Frontend", "Next.js (App Router), React, Tailwind CSS, Responsive & Accessible UI (WCAG 2.1 AA)")
    pdf.skill_line("Backend & Data", "Node.js, Python, REST APIs, Supabase, PostgreSQL")
    pdf.skill_line("Real-Time & Systems", "WebSockets, WebRTC, Geolocation API, Service Workers, Offline-First Architecture")
    pdf.skill_line("DevOps & Tools", "Docker, Render, Git, CI/CD")

    # --- KEY PROJECTS ---
    dot = chr(183)  # middle dot
    dash = chr(151) # em-dash
    en = chr(150)   # en-dash

    pdf.section_header("Key Projects")

    # Sweetbite
    pdf.item_header(
        "Sweetbite Food POS & Kitchen Display System (KDS)",
        f"Next.js 14 {dot} TypeScript {dot} Supabase Realtime {dot} PostgreSQL {dot} Tailwind CSS",
        "Active Production System"
    )
    pdf.bullet("Built an end-to-end cloud POS and Kitchen Display System for food service operations, replacing paper tickets and reducing kitchen communication delays.")
    pdf.bullet("Used Supabase Realtime WebSocket channels with bi-directional state sync to broadcast order and ticket status updates across kitchen stations in under 500ms.")
    pdf.bullet("Designed kitchen alert chimes, high-contrast touch ticket layouts, automated table routing, and optimistic UI updates with offline/reconnection recovery.")
    pdf.bullet("Modeled normalized PostgreSQL schemas for order states, line items, and station routing to prevent order collisions during peak hours.")

    # Ghana Emergency
    pdf.item_header(
        "Ghana Emergency Response & Dispatch Telemetry System",
        f"TypeScript {dot} JavaScript {dot} Python {dot} PostgreSQL {dot} Geolocation API {dot} WebRTC",
        "Live Deployment"
    )
    pdf.bullet("Built an emergency web application for geolocation-tagged SOS requests to support rapid dispatch coordination across Ghana.")
    pdf.bullet("Implemented live coordinate telemetry with interactive mapping, geofencing, and voice-note transmission to speed up incident verification.")
    pdf.bullet("Added client-side offline queues and service-worker persistence to preserve distress requests during intermittent connectivity.")
    pdf.bullet("Built an administrative dispatch console for triaging incidents by severity, viewing nearby units, and updating live call status.")

    # Patron Housing
    pdf.item_header(
        "Patron Housing Access Control & Visitor Management",
        f"Python {dot} PostgreSQL {dot} Docker {dot} Cryptographic QR Codes {dot} Modern CSS",
        "Production Solution"
    )
    pdf.bullet("Built a residential access-control platform for digital visitor passes, gate check-ins, and cryptographic QR code validation.")
    pdf.bullet("Created an administrative dashboard with real-time entry/exit logs and resident authorization workflows; deployed with Docker on Render.")
    pdf.bullet("Implemented automated pass revocation and single-use visitor passes to prevent credential sharing.")

    # --- CLIENT & COMMERCIAL PLATFORMS (First entry on Page 1) ---
    pdf.section_header("Client & Commercial Platforms")
    pdf.item_header(
        f"BizConnect Technologies {dash} Enterprise Portal",
        f"Modern JavaScript {dot} Accessible UI/UX {dot} REST APIs",
        "Client Production"
    )
    pdf.bullet("Built a corporate web platform with a lean codebase, responsive layouts, and a 100% Core Web Vitals score.")
    pdf.bullet("Implemented WCAG 2.1 AA accessible typography, keyboard navigation, and semantic HTML structure.")
    pdf.bullet("Built a modular component system and contact-inquiry API integration that drove a 35% increase in verified inbound leads.")

    # =========================================================================
    # PAGE 2
    # =========================================================================
    pdf.add_page()

    # Kelrose Tours
    pdf.item_header(
        f"Kelrose Tours {dash} Travel & Itinerary Booking Platform",
        f"JavaScript {dot} Responsive CSS {dot} SEO",
        "Client Production"
    )
    pdf.bullet("Designed and deployed a travel platform with interactive tour itinerary catalogs and destination guides.")
    pdf.bullet("Optimized responsive layout, image delivery, and metadata indexing to improve search visibility and mobile retention.")
    pdf.bullet("Configured automated inquiry workflows routing customer booking requests to operations staff.")

    # --- PROFESSIONAL EXPERIENCE ---
    pdf.section_header("Professional Experience")

    pdf.item_header(
        "Full-Stack Systems Engineer & Independent Developer",
        f"Independent / Client Engagements {dash} Accra, Ghana",
        f"2024 {en} Present"
    )
    pdf.bullet("Lead full-lifecycle engineering for web systems across hospitality, municipal emergency, and commercial sectors.")
    pdf.bullet("Design PostgreSQL database models, implement role-based access control, and build asynchronous, event-driven services deployed on cloud infrastructure.")
    pdf.bullet("Maintain a 5.0 client satisfaction rating (Google Reviews) through careful requirement scoping and disciplined delivery.")

    pdf.item_header(
        "Commercial Web Engineer & Client Consultant",
        "Freelance & Contract Engagements",
        f"2023 {en} 2024"
    )
    pdf.bullet("Modernized legacy web applications for SME clients, migrating static pages to interactive stacks and improving conversion funnels.")
    pdf.bullet("Ran performance audits and asset optimization that cut page load times by over 40%, achieving sub-second Largest Contentful Paint.")
    pdf.bullet("Delivered responsive, mobile-first UI components tested across devices and legacy browsers.")

    pdf.item_header(
        "Software Engineering Apprenticeship & Foundations",
        f"Self-Directed Study {dash} 1,500+ hours",
        f"2022 {en} 2023"
    )
    pdf.bullet("Completed a self-directed curriculum covering algorithms, asynchronous concurrency, network protocols (HTTP/REST/WebSockets), and relational database design.")
    pdf.bullet("Adopted AI-assisted development workflows to prototype, refactor, and test code more efficiently.")
    pdf.bullet("Built and shared open-source web components with local developer communities in Accra.")

    # --- EDUCATION & CONTINUOUS LEARNING ---
    pdf.section_header("Education & Continuous Learning")

    pdf.item_header(
        f"Software Engineering & Systems Development {dash} Accra, Ghana",
        "Self-directed curricula, open-source contributions, and professional practice"
    )
    pdf.bullet("Ongoing study in Next.js App Router, advanced TypeScript, PostgreSQL query optimization, and cloud-native deployment.")

    # Save output
    output_path = os.path.join(os.path.dirname(__file__), "resume.pdf")
    pdf.output(output_path)
    page_count = len(pdf.pages)
    print(f"Resume generated: {output_path} ({page_count} pages)")

if __name__ == "__main__":
    generate()
