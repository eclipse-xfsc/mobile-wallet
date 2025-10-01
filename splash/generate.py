#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageFont
import cairosvg

# -----------------------------------
# Einstellungen
# -----------------------------------
OUTPUT_DIR = "ios/PersonalCredentialManager/Images.xcassets/Launch Screen Icon.imageset"
SIZE_3X = (1242, 2688)  # iOS @3x Referenz (Portrait)

# Abstände
PADDING_RATIO = 0.05     # 5 % zusätzlicher Abstand für den mittleren Bereich + Header-Logo
FOOTER_PAD_RATIO = 0.15  # 15 % Padding relativ zur Footer-Höhe für Text/Logo im Footer

# Farben (XFSC-Style)
VIOLETT = (106, 17, 203)
BLAU = (37, 117, 252)
FOOTER_BLAU = (0, 43, 128)
WEISS = (255, 255, 255)

# Layout-Proportionen (relativ zur Gesamthöhe)
HEADER_RATIO = 0.12
FOOTER_RATIO = 0.12

TITLE_TEXT = "Personal Credential Manager"
POWERED_TEXT = "Powered by"

# Logos (SVG-Quellen)
XFSC_SVG_URL = "https://eclipse-xfsc.github.io/landingpage/img/xfsc_logo.svg"
ECLIPSE_SVG_URL = "https://eclipse-xfsc.github.io/landingpage/img/footer_logo.svg"

# Dateinamen in der .imageset
NAME_1X = "splash@1x.png"
NAME_2X = "splash@2x.png"
NAME_3X = "splash@3x.png"


# -----------------------------------
# Utilities
# -----------------------------------
def ensure_dir(p: str):
    os.makedirs(p, exist_ok=True)


def svg_url_to_png_bytes(svg_url: str, scale: float = 3.0) -> BytesIO:
    resp = requests.get(svg_url, timeout=20)
    resp.raise_for_status()
    return BytesIO(cairosvg.svg2png(bytestring=resp.content, scale=scale))


def load_font(preferred_points: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",  # macOS
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
        "C:/Windows/Fonts/arialbd.ttf",  # Windows
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, preferred_points)
            except Exception:
                continue
    return ImageFont.load_default()


def measure_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont):
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    return w, h


def draw_centered_text(draw: ImageDraw.ImageDraw, box, text, font, fill):
    x0, y0, x1, y1 = box
    tw, th = measure_text(draw, text, font)
    tx = x0 + (x1 - x0 - tw) // 2
    ty = y0 + (y1 - y0 - th) // 2
    draw.text((tx, ty), text, font=font, fill=fill)


# -----------------------------------
# Render
# -----------------------------------
def create_splash(path3x: str, path2x: str, path1x: str):
    W, H = SIZE_3X

    header_h = int(H * HEADER_RATIO)
    footer_h = int(H * FOOTER_RATIO)
    padding = int(H * PADDING_RATIO)

    footer_top = H - footer_h
    footer_pad = max(2, int(footer_h * FOOTER_PAD_RATIO))  # Innen-Padding im Footer

    # Grundbild
    img = Image.new("RGB", (W, H), color=WEISS)
    draw = ImageDraw.Draw(img)

    # Mittelteil: Gradient (VIOLETT -> BLAU), mit extra Abstand zu Header/Footer
    mid_y0 = header_h + padding
    mid_y1 = (H - footer_h) - padding
    for y in range(mid_y0, mid_y1):
        ratio = (y - mid_y0) / max(1, (mid_y1 - mid_y0))
        r = int(VIOLETT[0] * (1 - ratio) + BLAU[0] * ratio)
        g = int(VIOLETT[1] * (1 - ratio) + BLAU[1] * ratio)
        b = int(VIOLETT[2] * (1 - ratio) + BLAU[2] * ratio)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Footer (dunkelblau) – zusammenhängend
    draw.rectangle([0, footer_top, W, H], fill=FOOTER_BLAU)

    # Logos laden
    xfsc_logo = Image.open(svg_url_to_png_bytes(XFSC_SVG_URL, scale=4)).convert("RGBA")
    eclipse_logo = Image.open(svg_url_to_png_bytes(ECLIPSE_SVG_URL, scale=4)).convert("RGBA")

    # XFSC Logo im Header: 5 % vom Top eingerückt
    xfsc_max_w = int(W * 0.6)
    xfsc_max_h = int(header_h * 0.65)
    xfsc_logo.thumbnail((xfsc_max_w, xfsc_max_h), Image.LANCZOS)
    xfsc_x = (W - xfsc_logo.width) // 2
    xfsc_y = padding
    img.paste(xfsc_logo, (xfsc_x, xfsc_y), xfsc_logo)

    # Titel mittig im Gradient-Bereich
    title_font = load_font(84)
    draw_centered_text(draw, (0, mid_y0, W, mid_y1), TITLE_TEXT, title_font, WEISS)

    # Footer-Inhalt: "Powered by" + Logo, alles innerhalb des blauen Blocks
    powered_font = load_font(48)
    pb_w, pb_h = measure_text(draw, POWERED_TEXT, powered_font)

    # Platz im Footer für Inhalte
    content_top = footer_top + footer_pad
    # Wir reservieren unten auch Footer-Padding
    content_bottom = H - footer_pad
    content_height = max(0, content_bottom - content_top)

    # Erst "Powered by" oben im Footer platzieren
    pb_x = (W - pb_w) // 2
    pb_y = content_top
    draw.text((pb_x, pb_y), POWERED_TEXT, font=powered_font, fill=WEISS)

    # Logo-Größe an verfügbaren Platz unter dem Text anpassen
    spacing = max(8, int(footer_h * 0.08))
    available_h_for_logo = max(0, content_bottom - (pb_y + pb_h + spacing))
    available_w_for_logo = int(W * 0.55)

    if available_h_for_logo <= 0:
        # Notfall: minimal schrumpfen
        available_h_for_logo = max(24, int(footer_h * 0.3))

    eclipse_logo.thumbnail((available_w_for_logo, available_h_for_logo), Image.LANCZOS)
    el_x = (W - eclipse_logo.width) // 2

    # Vertikal so platzieren, dass es sicher im Footer bleibt
    el_y = pb_y + pb_h + spacing
    # Clamping in Footer-Bereich
    el_y = max(el_y, footer_top + footer_pad)
    el_y = min(el_y, H - footer_pad - eclipse_logo.height)

    img.paste(eclipse_logo, (el_x, el_y), eclipse_logo)

    # Speichern @3x
    ensure_dir(OUTPUT_DIR)
    img.save(path3x, "PNG")

    # Downscale @2x / @1x
    from PIL import Image as PILImage
    PILImage.open(path3x).resize((828, 1792), PILImage.LANCZOS).save(path2x, "PNG")
    PILImage.open(path3x).resize((414, 896), PILImage.LANCZOS).save(path1x, "PNG")

    # Contents.json erzeugen/aktualisieren
    contents = {
        "images": [
            {"idiom": "universal", "filename": os.path.basename(path1x), "scale": "1x"},
            {"idiom": "universal", "filename": os.path.basename(path2x), "scale": "2x"},
            {"idiom": "universal", "filename": os.path.basename(path3x), "scale": "3x"},
        ],
        "info": {"version": 1, "author": "xcode"}
    }
    with open(os.path.join(OUTPUT_DIR, "Contents.json"), "w", encoding="utf-8") as f:
        json.dump(contents, f, indent=2)

    print("✅ Splashscreen erstellt:")
    print(" -", path1x)
    print(" -", path2x)
    print(" -", path3x)
    print("✅ Contents.json aktualisiert.")


if __name__ == "__main__":
    out3 = os.path.join(OUTPUT_DIR, NAME_3X)
    out2 = os.path.join(OUTPUT_DIR, NAME_2X)
    out1 = os.path.join(OUTPUT_DIR, NAME_1X)
    create_splash(out3, out2, out1)
