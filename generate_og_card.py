import os
import math
from PIL import Image, ImageDraw, ImageFont

def draw_star(draw, center_x, center_y, size, color):
    """Draw a 5-pointed gold star."""
    points = []
    r_outer = size
    r_inner = size * 0.42
    for i in range(10):
        angle = i * math.pi / 5 - math.pi / 2
        r = r_outer if i % 2 == 0 else r_inner
        points.append((center_x + r * math.cos(angle), center_y + r * math.sin(angle)))
    draw.polygon(points, fill=color)

def create_og_card():
    width = 1200
    height = 630
    
    # 1. Base Image with Dark Ocean Teal Background
    # Deep, rich ocean teal: #00232c to #002b36
    card = Image.new("RGBA", (width, height), (0, 35, 44, 255))
    draw = ImageDraw.Draw(card)
    
    # Radial glows
    glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Top-right cyan glow
    gr_x, gr_y = 960, 200
    for r in range(450, 0, -10):
        alpha = int(50 * (1 - r / 450))
        glow_draw.ellipse([gr_x - r, gr_y - r, gr_x + r, gr_y + r], fill=(42, 161, 152, alpha))
        
    # Bottom-left blue glow
    gl_x, gl_y = 100, 550
    for r in range(400, 0, -10):
        alpha = int(40 * (1 - r / 400))
        glow_draw.ellipse([gl_x - r, gl_y - r, gl_x + r, gl_y + r], fill=(38, 139, 210, alpha))
        
    card = Image.alpha_composite(card, glow_layer)
    draw = ImageDraw.Draw(card)
    
    # Grid pattern
    grid_color = (7, 54, 66, 120)
    for x in range(0, width, 50):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 50):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)
        
    # Elegant double border
    draw.rectangle([18, 18, width - 19, height - 19], outline=(42, 161, 152, 160), width=2)
    draw.rectangle([22, 22, width - 23, height - 23], outline=(7, 54, 66, 180), width=1)
    
    # Corner accent ticks
    corner_len = 35
    accent_color = (42, 161, 152, 255)
    # Top-left
    draw.line([(18, 18), (18 + corner_len, 18)], fill=accent_color, width=3)
    draw.line([(18, 18), (18, 18 + corner_len)], fill=accent_color, width=3)
    # Top-right
    draw.line([(width - 19, 18), (width - 19 - corner_len, 18)], fill=accent_color, width=3)
    draw.line([(width - 19, 18), (width - 19, 18 + corner_len)], fill=accent_color, width=3)
    # Bottom-left
    draw.line([(18, height - 19), (18 + corner_len, height - 19)], fill=accent_color, width=3)
    draw.line([(18, height - 19), (18, height - 19 - corner_len)], fill=accent_color, width=3)
    # Bottom-right
    draw.line([(width - 19, height - 19), (width - 19 - corner_len, height - 19)], fill=accent_color, width=3)
    draw.line([(width - 19, height - 19), (width - 19, height - 19 - corner_len)], fill=accent_color, width=3)

    # Fonts
    fonts_dir = r"C:\Windows\Fonts"
    font_name = ImageFont.truetype(os.path.join(fonts_dir, "segoeuib.ttf"), 54)
    font_role = ImageFont.truetype(os.path.join(fonts_dir, "segoeuib.ttf"), 24)
    font_desc = ImageFont.truetype(os.path.join(fonts_dir, "segoeui.ttf"), 20)
    font_badge = ImageFont.truetype(os.path.join(fonts_dir, "segoeuib.ttf"), 14)
    font_pill = ImageFont.truetype(os.path.join(fonts_dir, "segoeuib.ttf"), 16)
    font_url = ImageFont.truetype(os.path.join(fonts_dir, "segoeuib.ttf"), 22)
    font_stats_num = ImageFont.truetype(os.path.join(fonts_dir, "segoeuib.ttf"), 26)
    font_stats_lbl = ImageFont.truetype(os.path.join(fonts_dir, "segoeui.ttf"), 14)
    font_chip_title = ImageFont.truetype(os.path.join(fonts_dir, "segoeuib.ttf"), 17)
    font_chip_sub = ImageFont.truetype(os.path.join(fonts_dir, "segoeui.ttf"), 13)

    # Left Column Layout
    left_x = 65
    
    # Status Badge
    badge_w = 340
    badge_h = 32
    draw.rounded_rectangle([left_x, 52, left_x + badge_w, 52 + badge_h], radius=16, fill=(7, 54, 66, 230), outline=(42, 161, 152, 160), width=1)
    draw.ellipse([left_x + 14, 52 + 11, left_x + 24, 52 + 21], fill=(46, 204, 113, 255))
    draw.text((left_x + 32, 52 + 7), "AVAILABLE FOR ROLES & PROJECTS", fill=(180, 210, 215, 255), font=font_badge)

    # Main Name
    draw.text((left_x, 100), "Essiaw Charles Jnr", fill=(255, 255, 255, 255), font=font_name)

    # Role
    draw.text((left_x, 172), "Software Developer & Full-Stack Systems Engineer", fill=(42, 161, 152, 255), font=font_role)

    # Description
    draw.text((left_x, 212), "Architecting high-performance web apps, real-time POS systems,", fill=(160, 185, 192, 255), font=font_desc)
    draw.text((left_x, 240), "emergency dispatch telemetry, and resilient cloud architectures.", fill=(160, 185, 192, 255), font=font_desc)

    # Tech Stack Pills (5 key items that fit comfortably)
    pills = ["TypeScript", "Next.js", "Supabase", "Python", "PostgreSQL", "Docker"]
    pill_x = left_x
    pill_y = 285
    for pill in pills:
        bbox = font_pill.getbbox(pill)
        p_w = (bbox[2] - bbox[0]) + 24
        p_h = 34
        draw.rounded_rectangle([pill_x, pill_y, pill_x + p_w, pill_y + p_h], radius=6, fill=(10, 61, 74, 220), outline=(38, 139, 210, 180), width=1)
        draw.text((pill_x + 12, pill_y + 7), pill, fill=(235, 245, 248, 255), font=font_pill)
        pill_x += p_w + 10

    # Metrics Row with clean dividers
    metrics_y = 350
    draw.line([(left_x, metrics_y), (left_x + 640, metrics_y)], fill=(15, 75, 90, 200), width=1)
    
    metrics = [
        ("5+ Systems", "Shipped to Prod"),
        ("5.0 Rating", "Client Satisfaction"),
        ("< 1s Sync", "Real-Time Latency"),
        ("Accra, GH", "Remote Ready")
    ]
    
    m_x = left_x
    col_width = 158
    for i, (num, lbl) in enumerate(metrics):
        draw.text((m_x, metrics_y + 16), num, fill=(255, 255, 255, 255), font=font_stats_num)
        draw.text((m_x, metrics_y + 50), lbl, fill=(130, 160, 170, 255), font=font_stats_lbl)
        if i < len(metrics) - 1:
            draw.line([(m_x + col_width - 8, metrics_y + 18), (m_x + col_width - 8, metrics_y + 68)], fill=(15, 75, 90, 180), width=1)
        m_x += col_width

    draw.line([(left_x, metrics_y + 82), (left_x + 640, metrics_y + 82)], fill=(15, 75, 90, 200), width=1)

    # Footer Branding Bar
    foot_y = 475
    draw.text((left_x, foot_y), "https://kojowallet01.github.io/essiawcharles", fill=(42, 161, 152, 255), font=font_url)
    draw.text((left_x, foot_y + 36), "GitHub: github.com/kojowallet01   |   Email: charlesessiawjnr@gmail.com", fill=(140, 170, 180, 255), font=font_stats_lbl)

    # Right Column: Avatar centered on face & upper body
    avatar_cx = 945
    avatar_cy = 285
    avatar_r = 180

    # Glow rings behind avatar
    for dr in range(35, 0, -2):
        alpha = int(75 * ((35 - dr) / 35))
        draw.ellipse([avatar_cx - avatar_r - dr, avatar_cy - avatar_r - dr, avatar_cx + avatar_r + dr, avatar_cy + avatar_r + dr], outline=(42, 161, 152, alpha), width=2)

    # Load and crop profile.jpg focused on face/upper torso
    if os.path.exists("profile.jpg"):
        raw_img = Image.open("profile.jpg").convert("RGBA")
        # 683 x 1024 - Charles's face and upper chest is in y = 20 to 600
        crop_size = 560
        crop_left = (raw_img.width - crop_size) // 2  # centered horizontally
        crop_top = 30  # starting near top of head
        cropped = raw_img.crop((crop_left, crop_top, crop_left + crop_size, crop_top + crop_size))
        
        resized = cropped.resize((avatar_r * 2, avatar_r * 2), Image.Resampling.LANCZOS)
        
        # Smooth circular mask
        mask = Image.new("L", (avatar_r * 2, avatar_r * 2), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, avatar_r * 2, avatar_r * 2], fill=255)
        
        card.paste(resized, (avatar_cx - avatar_r, avatar_cy - avatar_r), mask)
        
        # Sharp border ring
        draw.ellipse([avatar_cx - avatar_r, avatar_cy - avatar_r, avatar_cx + avatar_r, avatar_cy + avatar_r], outline=(42, 161, 152, 255), width=4)
        draw.ellipse([avatar_cx - avatar_r + 4, avatar_cy - avatar_r + 4, avatar_cx + avatar_r - 4, avatar_cy + avatar_r - 4], outline=(7, 54, 66, 200), width=2)

    # Floating Chip 1 (Top Left of Avatar): 5.0 Star Rating
    c1_x = 765
    c1_y = 110
    c1_w = 200
    c1_h = 64
    draw.rounded_rectangle([c1_x, c1_y, c1_x + c1_w, c1_y + c1_h], radius=12, fill=(0, 35, 44, 240), outline=(42, 161, 152, 220), width=2)
    # Draw 5 gold stars
    for s in range(5):
        draw_star(draw, c1_x + 25 + s * 22, c1_y + 24, 7, (245, 158, 11, 255))
    draw.text((c1_x + 28, c1_y + 38), "5.0 Verified Rating", fill=(230, 245, 250, 255), font=font_chip_sub)

    # Floating Chip 2 (Bottom Right of Avatar): Sweetbite POS & Systems
    c2_x = 830
    c2_y = 425
    c2_w = 240
    c2_h = 66
    draw.rounded_rectangle([c2_x, c2_y, c2_x + c2_w, c2_y + c2_h], radius=12, fill=(0, 35, 44, 240), outline=(38, 139, 210, 220), width=2)
    draw.text((c2_x + 18, c2_y + 14), "Sweetbite Food POS", fill=(42, 161, 152, 255), font=font_chip_title)
    draw.text((c2_x + 18, c2_y + 38), "Realtime Kitchen KDS Sync", fill=(170, 195, 205, 255), font=font_chip_sub)

    # Save final PNG
    final_card = card.convert("RGB")
    final_card.save("og-card.png", format="PNG", quality=95)
    print(f"Successfully generated og-card.png ({os.path.getsize('og-card.png')} bytes)")

if __name__ == "__main__":
    create_og_card()
