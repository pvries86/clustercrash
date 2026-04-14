import os
import io
import sys
import textwrap
import argparse
from collections import Counter, deque
from google import genai
from PIL import Image

ASSET_TYPES = {
    "1": {
        "label": "Platform",
        "prompt": (
            "Designed as a 2D side-scrolling platformer platform sprite. "
            "No product render look. The standable edge must be straight, clean, and clearly usable as a platform. "
            "Make the object wider than it is tall and keep the shape simple and readable."
        ),
    },
    "2": {
        "label": "Player",
        "prompt": (
            "Designed as a playable 2D side-scrolling platformer character sprite. "
            "Full body visible. Clear readable silhouette. Keep proportions game-friendly and readable."
        ),
    },
    "3": {
        "label": "Enemy",
        "prompt": (
            "Designed as a 2D side-scrolling platformer enemy sprite. "
            "Full body visible. Clear hostile silhouette, readable at small size."
        ),
    },
    "4": {
        "label": "Boss",
        "prompt": (
            "Designed as a 2D side-scrolling platformer boss sprite. "
            "Full body visible. Larger and more imposing than normal enemies. Strong readable silhouette."
        ),
    },
    "5": {
        "label": "Pickup",
        "prompt": (
            "Designed as a 2D side-scrolling platformer pickup sprite. "
            "Compact, very readable at small size, with a clear silhouette."
        ),
    },
    "6": {
        "label": "Hazard",
        "prompt": (
            "Designed as a 2D side-scrolling platformer hazard sprite. "
            "Readable dangerous silhouette. If it sits on a platform, keep it low and wide."
        ),
    },
    "7": {
        "label": "Prop",
        "prompt": (
            "Designed as a 2D side-scrolling platformer environmental prop sprite. "
            "Readable silhouette, not too detailed, suitable for a platformer."
        ),
    },
    "8": {
        "label": "Background",
        "prompt": (
            "Designed as a 2D side-scrolling platformer background scene. "
            "This is a backdrop, not a sprite sheet object. Build a wide layered environment with clear depth, "
            "clean pixel-art silhouettes, readable parallax-friendly shapes, and no foreground gameplay collision object focus."
        ),
    },
}

STYLE_GUIDE = (
    "2D platformer pixel art sprite, clean readable silhouette, centered subject, "
    "full object or full body visible when appropriate, consistent pixel art style, crisp edges, limited color palette, readable at small size, "
    "no text, no watermark, no frame, no perspective distortion beyond the chosen viewpoint. "
    "Use a plain solid white background only, with the character or object isolated clearly from the background. "
    "Do not use checkerboard transparency, fake transparency, gray boxes, matte patterns, scenery, gradients, or shadows blended into the background. "
    "Avoid realistic rendering, avoid painterly style, avoid soft blurry edges, "
    "avoid background scene, avoid cropped subject, avoid multiple characters, avoid text, avoid logos."
)

BACKGROUND_STYLE_GUIDE = (
    "2D side-scrolling platformer pixel art background, wide scenic composition, layered depth, "
    "consistent pixel art style, crisp edges, readable midground and far-background silhouettes, "
    "no text, no watermark, no UI, no characters as the main subject, no frame. "
    "Keep the lower part of the scene readable behind gameplay elements. "
    "Avoid blurry painterly rendering, avoid photorealism, avoid dramatic perspective, avoid isometric."
)

VIEW_MODES = {
    "1": {
        "label": "Side",
        "prompt": "Strict side profile. Orthographic side view. No front view, no top-down view, no 3/4 view, no isometric.",
        "supports_facing": True,
    },
    "2": {
        "label": "Front",
        "prompt": "Strict front view. Orthographic front-facing sprite. No side view, no top-down view, no 3/4 view, no isometric.",
        "supports_facing": False,
    },
    "3": {
        "label": "Top-Down",
        "prompt": "Strict top-down view. Orthographic overhead sprite. No side view, no front view, no angled perspective, no isometric.",
        "supports_facing": False,
    },
}

ASSET_TYPE_ALIASES = {
    "platform": "1",
    "player": "2",
    "enemy": "3",
    "boss": "4",
    "pickup": "5",
    "hazard": "6",
    "prop": "7",
    "background": "8",
}

VIEW_MODE_ALIASES = {
    "side": "1",
    "front": "2",
    "topdown": "3",
    "top-down": "3",
    "top_down": "3",
}

def preset(prompt, asset_type, view="side", face=None):
    return {
        "prompt": prompt,
        "asset_type": asset_type,
        "view": view,
        "face": face,
    }

PRESET_DEFINITIONS = {
    "server-rack": preset("pixel art datacenter server rack platform with a flat standable top edge, front rack details, sturdy enterprise silhouette, readable as a wide platform", "platform", "side"),
    "network-switch": preset("pixel art network switch platform with a flat standable top edge, ethernet ports and link lights, clean enterprise silhouette, readable as a wide platform", "platform", "side"),
    "database-node": preset("pixel art database server platform with a flat standable top edge, storage and server details, heavy enterprise silhouette, readable as a wide platform", "platform", "side"),
    "esxi-host": preset("pixel art VMware ESXi host platform with a flat standable top edge, low-profile enterprise server chassis, ports and status lights, readable as a wide platform", "platform", "side"),
    "player-paul": preset("pixel art playable character sprite of Paul, male IT engineer, VMware and Windows administrator vibe, office-casual clothes, calm confident expression, sturdy readable silhouette", "player", "side", "right"),
    "player-gertjan": preset("pixel art playable character sprite of Gert-Jan, male IT engineer, agile systems administrator vibe, office-casual clothes, energetic expression, lean readable silhouette", "player", "side", "right"),
    "difficult-user": preset("pixel art office user enemy, full body visible, frustrated expression, business-casual clothing, demanding posture, readable hostile silhouette", "enemy", "side", "right"),
    "asap-user": preset("agile ASAP office user enemy, full body visible, black skin, urgent expression, business-casual clothing, fast and jumpy silhouette", "enemy", "side", "right"),
    "armored-user": preset("armored office user enemy, full body visible, reinforced padding and protective office gear, stubborn demanding expression, heavier readable silhouette", "enemy", "side", "right"),
    "armored-user-heavy": preset("tough heavily armored office user enemy, full body visible, bulkier silhouette than the normal armored user, reinforced padding and protective office gear, stern demanding expression", "enemy", "side", "right"),
    "email-shooting-user": preset("office user enemy who attacks with emails, full body visible, annoyed expression, business-casual clothing, holding a laptop or phone, readable ranged-enemy silhouette", "enemy", "side", "right"),
    "vip-user": preset("high-priority VIP office user enemy, full body visible, executive business-casual clothing, impatient demanding expression, holding a phone or tablet, visually tougher than a normal office user", "enemy", "side", "right"),
    "auditor-user": preset("slow tanky auditor office enemy, full body visible, formal business clothing, clipboard and audit binder, stern compliance expression, bulky durable support-enemy silhouette", "enemy", "side", "right"),
    "spam-caller-user": preset("fast spam caller office enemy, full body visible, frantic expression, headset or phone in hand, lightweight business-casual clothing, lean rushing silhouette with urgent movement energy", "enemy", "side", "right"),
    "change-manager-user": preset("change manager office enemy, full body visible, composed planning expression, business attire, holding change request folder or tablet, backline support silhouette, authoritative but not bulky", "enemy", "side", "right"),
    "ransomware-popup-user": preset("ransomware popup enemy hazard hybrid, full body or pop-up kiosk visible, malicious red warning screen motif, glitchy office-user silhouette emerging from a platform, readable blocking hazard shape", "enemy", "side", "right"),
    "escalation-user": preset("escalation office user enemy, full body visible, frustrated expression becoming urgent, business-casual clothing, small but intense silhouette with visible escalation warning details", "enemy", "side", "right"),
    "ticket-spammer-user": preset("ticket spammer office user enemy, full body visible, annoyed expression, holding stacks of support tickets or tablet, ranged nuisance silhouette, lightweight and readable", "enemy", "side", "right"),
    "boss-peter": preset("pixel art boss sprite of Peter, IT manager, full body visible, business attire, calm authoritative presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-richard-r": preset("pixel art boss sprite of Richard R, IT manager, full body visible, business attire, intense fast-moving presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-richard-a": preset("pixel art boss sprite of Richard A, IT manager, full body visible, business attire, composed analytical presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-chris": preset("pixel art boss sprite of Chris, IT manager, full body visible, business attire, energetic animated presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-denise": preset("pixel art boss sprite of Denise, IT manager, full body visible, business attire, confident decisive presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-sander": preset("pixel art boss sprite of Sander, IT manager, full body visible, business attire, assertive high-energy presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-walter": preset("pixel art boss sprite of Walter, IT manager, full body visible, business attire, formal experienced presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-salah": preset("pixel art boss sprite of Salah, IT manager, full body visible, business attire, focused efficient presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "boss-patrick": preset("pixel art boss sprite of Patrick, IT manager, full body visible, business attire, planning-oriented commanding presence, larger and more imposing than normal enemies", "boss", "side", "right"),
    "snapshot-pickup": preset("VMware snapshot pickup icon, compact readable IT-themed pickup sprite, stylized snapshot disk or VM checkpoint token with cyan glow, datacenter UI feel", "pickup", "front"),
    "vmotion-pickup": preset("VMware vMotion pickup icon, compact readable IT-themed pickup sprite, migrating VM symbol or server-to-server transfer icon with blue motion trails, datacenter UI feel", "pickup", "front"),
    "patch-pickup": preset("patch bundle pickup icon, compact readable IT-themed pickup sprite, Windows or server patch package with update arrows, tool-kit or maintenance badge feel", "pickup", "front"),
    "ha-pickup": preset("high availability pickup icon, compact readable IT-themed pickup sprite, failover cluster or heartbeat symbol with resilient server styling, VMware datacenter UI feel", "pickup", "front"),
    "data-leak": preset("glowing green-blue data leak spill, wide horizontal floor hazard, glossy digital liquid puddle, designed to sit directly on a platform surface", "hazard", "side"),
    "static-electricity": preset("bright blue static electricity arcs, low wide floor hazard, electric sparks rising from a floor surface, designed to sit directly on a platform top", "hazard", "side"),
    "patch-reboot": preset("patch reboot tile hazard, low rectangular floor device with warning lights and tech panel details, designed to sit directly on a platform surface", "hazard", "side"),
    "cable-mess": preset("messy bundle of cables and patch cords, low wide floor hazard, tangled across a platform surface, designed to sit directly on a platform top", "hazard", "side"),
    "overheating-vent": preset("overheating vent hazard, low floor vent with hot air and heat shimmer rising upward, designed to sit directly on a platform surface", "hazard", "side"),
    "backup-window": preset("backup window hazard, compact moving barrier device for a platform surface, low base with a vertical scanning barrier panel, designed to sit directly on a platform top", "hazard", "side"),
    "terminal-console": preset("pixel art IT terminal console environmental prop with glowing screen and compact readable silhouette", "prop", "side"),
    "wifi-antenna": preset("pixel art wireless antenna or access point prop with subtle glowing signal arcs and readable silhouette", "prop", "side"),
    "patch-panel": preset("pixel art datacenter patch panel prop with ports and cables, compact readable silhouette", "prop", "side"),
    "windows-server": preset("pixel art Windows server prop with enterprise hardware styling and readable silhouette", "prop", "side"),
    "cloud-exit": preset("pixel art level exit prop representing cloud migration or VM recovery portal, glowing cloud with datacenter UI styling and readable silhouette", "prop", "front"),
    "keyboard": preset("pixel art computer keyboard sprite, compact readable shape, suitable as a thrown weapon icon", "prop", "topdown"),
    "boss-projectile-memo": preset("boss projectile sprite shaped like a flying urgent meeting memo or escalation document, compact readable IT office projectile, management paperwork attack with sharp readable silhouette", "prop", "side"),
    "boss-projectile-alert": preset("boss projectile sprite shaped like a flying red alert notification, outage warning icon, or incident badge, compact fast-looking IT-themed projectile silhouette", "prop", "side"),
    "boss-projectile-folder": preset("boss projectile sprite shaped like a flying RFC folder, change request file, or project dossier, compact readable IT operations projectile silhouette", "prop", "side"),
    "boss-projectile-bubble": preset("boss projectile sprite shaped like a management callout or complaint speech bubble, compact readable office-communication projectile silhouette", "prop", "front"),
    "boss-projectile-sync": preset("boss projectile sprite shaped like a sync pulse, replication wave, or clustered system signal icon, compact readable datacenter-themed projectile silhouette", "prop", "front"),
    "bg-datacenter": preset("pixel art datacenter background with long dark server aisles, dense rack rows, blinking status lights, cable trays overhead, subtle cool green and cyan glow, layered depth, moody but readable", "background", "side"),
    "bg-office": preset("pixel art office floor background with desks, monitors, glass meeting rooms, ceiling lights, windows, subtle IT office atmosphere, layered depth, readable silhouettes", "background", "side"),
    "bg-server": preset("pixel art server room background with dense rack corridors, cooling units, storage cabinets, status lights, industrial raised-floor feel, layered tech depth", "background", "side"),
    "bg-dr": preset("pixel art disaster recovery site background with backup racks, storage arrays, dim emergency lighting, isolated facility feeling, purple and blue failover glow, layered depth", "background", "side"),
}

PRESET_ALIASES = {
    "rack": "server-rack",
    "switch": "network-switch",
    "database": "database-node",
    "terminal": "terminal-console",
    "antenna": "wifi-antenna",
    "winserver": "windows-server",
    "cloud": "cloud-exit",
    "patchpanel": "patch-panel",
    "armored-heavy-user": "armored-user-heavy",
    "email-user": "email-shooting-user",
    "auditor": "auditor-user",
    "spam-caller": "spam-caller-user",
    "spamcaller": "spam-caller-user",
    "change-manager": "change-manager-user",
    "changemanager": "change-manager-user",
    "ransomware-popup": "ransomware-popup-user",
    "ransomware": "ransomware-popup-user",
    "escalation": "escalation-user",
    "ticket-spammer": "ticket-spammer-user",
    "ticketspammer": "ticket-spammer-user",
    "bg-datacenter-1": "bg-datacenter",
    "bg-datacenter-2": "bg-datacenter",
    "bg-datacenter-3": "bg-datacenter",
    "bg-datacenter-4": "bg-datacenter",
    "bg-office-1": "bg-office",
    "bg-office-2": "bg-office",
    "bg-office-3": "bg-office",
    "bg-server-1": "bg-server",
    "bg-server-2": "bg-server",
    "bg-server-3": "bg-server",
    "bg-dr-1": "bg-dr",
    "bg-dr-2": "bg-dr",
    "bg-dr-3": "bg-dr",
}

PRESET_GROUP_ORDER = [
    "platform",
    "player",
    "enemy",
    "boss",
    "pickup",
    "hazard",
    "prop",
    "background",
]

PRESET_GROUP_LABELS = {
    "platform": "Platforms",
    "player": "Players",
    "enemy": "Enemies",
    "boss": "Bosses",
    "pickup": "Pickups",
    "hazard": "Hazards",
    "prop": "Props",
    "background": "Backgrounds",
}

def parse_args():
    parser = argparse.ArgumentParser(description="Generate custom pixel-art assets for the platformer.")
    parser.add_argument("--file", dest="file_name", help="Output file name without .png")
    parser.add_argument("--type", dest="asset_type", help="Asset type: platform, player, enemy, boss, pickup, hazard, prop, background")
    parser.add_argument("--view", dest="view_mode", help="View mode: side, front, topdown")
    parser.add_argument("--desc", dest="description", help="Prompt description for the asset")
    parser.add_argument("--preset", dest="preset", help="Named prompt preset, e.g. data-leak, static-electricity, patch-reboot")
    parser.add_argument("--face", dest="face", choices=["left", "right"], help="Facing direction for side-view non-background assets")
    parser.add_argument("--count", dest="count", type=int, default=1, help="Number of images to generate (default: 1)")
    parser.add_argument("--open", dest="auto_open", action="store_true", help="Open preview automatically")
    parser.add_argument("--no-open", dest="auto_open", action="store_false", help="Do not open preview automatically")
    parser.set_defaults(auto_open=None)
    return parser.parse_args()

def resolve_asset_type(value):
    if not value:
        return None
    key = ASSET_TYPE_ALIASES.get(value.strip().lower(), value.strip())
    return ASSET_TYPES.get(key)

def resolve_view_mode(value):
    if not value:
        return None
    key = VIEW_MODE_ALIASES.get(value.strip().lower(), value.strip())
    return VIEW_MODES.get(key)

def choose_asset_type():
    print("Choose asset type:")
    for key, value in ASSET_TYPES.items():
        print(f"  {key}. {value['label']}")
    choice = input("Type number (default 7): ").strip() or "7"
    return ASSET_TYPES.get(choice, ASSET_TYPES["7"])

def choose_view_mode(default_choice="1"):
    print("Choose viewpoint:")
    for key, value in VIEW_MODES.items():
        print(f"  {key}. {value['label']}")
    choice = input(f"Type number (default {default_choice}): ").strip() or default_choice
    return VIEW_MODES.get(choice, VIEW_MODES[default_choice])

def choose_prompt_mode():
    print("Choose generation mode:")
    print("  1. Preset")
    print("  2. Custom prompt")
    choice = input("Type number (default 1): ").strip() or "1"
    return "preset" if choice != "2" else "custom"

def choose_preset():
    grouped_names = {
        group: sorted(
            [name for name, data in PRESET_DEFINITIONS.items() if data["asset_type"] == group]
        )
        for group in PRESET_GROUP_ORDER
    }

    print("Choose preset group:")
    available_groups = [group for group in PRESET_GROUP_ORDER if grouped_names[group]]
    for index, group in enumerate(available_groups, start=1):
        print(f"  {index}. {PRESET_GROUP_LABELS.get(group, group.title())}")

    group_value = input("Enter group number: ").strip().lower()
    if not group_value or not group_value.isdigit():
        return None, None

    group_index = int(group_value) - 1
    if group_index < 0 or group_index >= len(available_groups):
        print(f"Unknown group number '{group_value}'.")
        return None, None

    selected_group = available_groups[group_index]
    names = grouped_names[selected_group]
    allow_group_batch = selected_group in {"platform", "prop", "background"}
    batch_names = [
        name for name in names
        if supports_multi_version_generation(resolve_asset_type(PRESET_DEFINITIONS[name]["asset_type"]), name)
    ]

    if allow_group_batch and batch_names:
        mode = input("Type 'b' for batch or press Enter for a single preset: ").strip().lower()
        if mode in {"b", "batch"}:
            return [(name, PRESET_DEFINITIONS[name]) for name in batch_names]

    print(f"\n{PRESET_GROUP_LABELS.get(selected_group, selected_group.title())}:")
    for index, name in enumerate(names, start=1):
        preset_info = PRESET_DEFINITIONS[name]
        print(f"  {index}. {name} [{preset_info['view']}]")

    value = input("Enter preset number: ").strip().lower()
    if not value or not value.isdigit():
        return []

    index = int(value) - 1
    if index < 0 or index >= len(names):
        print(f"Unknown preset number '{value}'.")
        return []

    resolved_name = names[index]
    return [(resolved_name, PRESET_DEFINITIONS[resolved_name])]

def ask_yes_no(prompt, default=True):
    suffix = " [Y/n]: " if default else " [y/N]: "
    value = input(prompt + suffix).strip().lower()
    if not value:
        return default
    return value in {"y", "yes"}

def choose_count(default=1):
    value = input(f"How many versions to generate? (default {default}): ").strip()
    if not value:
        return default
    try:
        count = int(value)
    except ValueError:
        print(f"Invalid count '{value}', using {default}.")
        return default
    if count < 1:
        print(f"Count must be at least 1, using {default}.")
        return default
    return count

def get_output_path(assets_dir, file_name, target_count, variant_index):
    if target_count > 1:
        return os.path.join(assets_dir, f"{file_name}-{variant_index + 1}.png")

    out_path = os.path.join(assets_dir, f"{file_name}.png")
    if not os.path.exists(out_path):
        return out_path

    counter = 1
    while True:
        out_path = os.path.join(assets_dir, f"{file_name}-{counter}.png")
        if not os.path.exists(out_path):
            return out_path
        counter += 1

def supports_multi_version_generation(asset_type, preset_name=None):
    if not asset_type:
        return False

    if preset_name and preset_name.startswith("boss-projectile-"):
        return False

    return asset_type["label"] in {"Platform", "Prop", "Background"}

def build_setup_from_preset(args, preset_name, preset_data, batch_mode=False):
    asset_type = resolve_asset_type(preset_data["asset_type"])
    view_mode = resolve_view_mode(preset_data["view"])
    file_name = (args.file_name or preset_name).strip()
    custom_prompt = maybe_add_canvas_hint(preset_data["prompt"], asset_type)

    face_value = args.face or preset_data["face"] or "right"
    facing_right = face_value.lower() != "left"
    if face_value not in {"left", "right"}:
        print("Invalid face value. Use 'left' or 'right'.")
        sys.exit(1)
    if (
        not batch_mode
        and args.face is None
        and preset_data["face"] is None
        and view_mode["supports_facing"]
        and asset_type["label"] != "Background"
    ):
        facing_right = ask_yes_no("Should the sprite face right?", default=True)

    return {
        "file_name": file_name,
        "preset_name": preset_name,
        "asset_type": asset_type,
        "view_mode": view_mode,
        "custom_prompt": custom_prompt,
        "facing_right": facing_right,
    }

def build_prompt(custom_prompt, asset_type, view_mode, facing_right=True):
    parts = [custom_prompt, asset_type["prompt"], view_mode["prompt"]]
    if view_mode["supports_facing"] and asset_type["label"] != "Background":
        parts.append("Face right." if facing_right else "Face left.")
    parts.append(BACKGROUND_STYLE_GUIDE if asset_type["label"] == "Background" else STYLE_GUIDE)
    return " ".join(parts)

def color_distance(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])

def get_border_pixels(img, border=12):
    width, height = img.size
    pixels = img.load()
    border_pixels = []

    for y in range(height):
        for x in range(width):
            if x < border or y < border or x >= width - border or y >= height - border:
                border_pixels.append(pixels[x, y])

    return border_pixels

def find_background_palette(img, border=12, limit=3):
    border_pixels = [
        pixel for pixel in get_border_pixels(img, border)
        if len(pixel) >= 4 and pixel[3] > 0
    ]

    if not border_pixels:
        return []

    common = Counter((r, g, b) for r, g, b, _ in border_pixels).most_common(limit)
    return [color for color, _count in common]

def is_background_pixel(pixel, palette, tolerance=40):
    if len(pixel) < 4 or pixel[3] == 0:
        return True

    rgb = pixel[:3]
    return any(color_distance(rgb, bg) <= tolerance for bg in palette)

def remove_edge_connected_background(img, tolerance=40):
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    palette = find_background_palette(img)

    if not palette:
        return img

    queue = deque()
    visited = set()
    mask = set()

    def enqueue_if_background(x, y):
        if (x, y) in visited:
            return
        visited.add((x, y))
        if is_background_pixel(pixels[x, y], palette, tolerance):
            queue.append((x, y))

    for x in range(width):
        enqueue_if_background(x, 0)
        enqueue_if_background(x, height - 1)
    for y in range(height):
        enqueue_if_background(0, y)
        enqueue_if_background(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if (x, y) in mask:
            continue
        mask.add((x, y))

        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                visited.add((nx, ny))
                if is_background_pixel(pixels[nx, ny], palette, tolerance):
                    queue.append((nx, ny))

    for x, y in mask:
        r, g, b, _a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)

    return img

def remove_near_white_background(img, threshold=235):
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0 and r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)

    return img

def crop_to_content(img, alpha_threshold=8, padding=8):
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if not bbox:
        return img

    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    return img.crop((left, top, right, bottom))

def maybe_add_canvas_hint(custom_prompt, asset_type):
    prompt = custom_prompt.strip()
    label = asset_type["label"]

    if label == "Background":
        return (
            f"{prompt}. Wide panoramic scene for a side-scrolling platformer background. "
            "Use layered depth with clear far background, midground, and lower background zones"
        )
    if label == "Platform":
        return f"{prompt}. Wide horizontal sprite, like a side-scrolling platform tile"
    if label in {"Player", "Enemy", "Boss"}:
        return f"{prompt}. Full-body sprite with feet clearly visible"
    if label in {"Pickup", "Hazard"}:
        if label == "Hazard":
            return (
                f"{prompt}. Low-profile floor-surface hazard sprite for a side-scrolling platformer. "
                "Keep it wider than it is tall, with a flat bottom edge so it can sit cleanly on top of a platform. "
                "Avoid floating object composition or tall vertical shapes."
            )
        return f"{prompt}. Compact game icon sprite"
    return prompt

def resolve_preset_name(value):
    if not value:
        return None
    key = value.strip().lower()
    key = PRESET_ALIASES.get(key, key)
    return key if key in PRESET_DEFINITIONS else None

def resolve_preset(value):
    preset_name = resolve_preset_name(value)
    if not preset_name:
        return None, None
    return preset_name, PRESET_DEFINITIONS[preset_name]

def get_default_view_choice(asset_type, file_name):
    name = file_name.lower()
    if asset_type["label"] == "Background":
        return "1"
    if asset_type["label"] == "Platform":
        return "1"
    if "keyboard" in name:
        return "3"
    if asset_type["label"] in {"Player", "Enemy", "Boss", "Prop", "Hazard"}:
        return "1"
    return "1"

def open_file(path):
    try:
        os.startfile(path)
    except OSError:
        pass

def generate_image(client, full_prompt, asset_type_label):
    response = client.models.generate_content(
        model='nano-banana-pro-preview',
        contents=full_prompt,
    )

    part = response.candidates[0].content.parts[0]
    if hasattr(part, 'inline_data') and part.inline_data is not None:
        image_bytes = part.inline_data.data
        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        if asset_type_label != "Background":
            img = remove_near_white_background(img, threshold=235)
            img = remove_edge_connected_background(img, tolerance=42)
            img = crop_to_content(img, padding=8)
        return img
    return None

def collect_asset_setups(args):
    preset_entries = []

    if args.preset:
        preset_name, preset_data = resolve_preset(args.preset)
        if not preset_data:
            print(f"Unknown preset '{args.preset}'.")
            sys.exit(1)
        preset_entries = [(preset_name, preset_data)]
    elif not args.description and choose_prompt_mode() == "preset":
        preset_entries = choose_preset()
        if not preset_entries:
            print("No preset selected. Exiting.")
            sys.exit(1)

    if preset_entries:
        batch_mode = len(preset_entries) > 1
        return [build_setup_from_preset(args, preset_name, preset_data, batch_mode=batch_mode) for preset_name, preset_data in preset_entries]

    asset_type = resolve_asset_type(args.asset_type)
    view_mode = resolve_view_mode(args.view_mode)

    if not preset_entries:
        file_name = (args.file_name or input("Enter the desired file name (without .png extension, e.g., 'new-enemy'): ")).strip()
        if not file_name:
            print("File name cannot be empty. Exiting.")
            sys.exit(1)
        asset_type = asset_type or choose_asset_type()
        default_view_choice = get_default_view_choice(asset_type, file_name)
        view_mode = view_mode or choose_view_mode(default_view_choice)
        custom_prompt = args.description.strip() if args.description else input("Enter a description of what you want to generate:\n> ").strip()

    if not file_name:
        print("File name could not be resolved. Exiting.")
        sys.exit(1)

    if not asset_type:
        print("Asset type could not be resolved. Exiting.")
        sys.exit(1)
    if not view_mode:
        print("View mode could not be resolved. Exiting.")
        sys.exit(1)
    if not custom_prompt:
        print("Description cannot be empty. Exiting.")
        sys.exit(1)

    custom_prompt = maybe_add_canvas_hint(custom_prompt, asset_type)
    face_value = args.face or (preset_data["face"] if preset_data else None) or "right"
    facing_right = face_value.lower() != "left"
    if face_value not in {"left", "right"}:
        print("Invalid face value. Use 'left' or 'right'.")
        sys.exit(1)
    if (
        args.face is None
        and (not preset_data or preset_data["face"] is None)
        and view_mode["supports_facing"]
        and asset_type["label"] != "Background"
    ):
        facing_right = ask_yes_no("Should the sprite face right?", default=True)

    return [{
        "file_name": file_name,
        "preset_name": None,
        "asset_type": asset_type,
        "view_mode": view_mode,
        "custom_prompt": custom_prompt,
        "facing_right": facing_right,
    }]

def generate_custom_sprite():
    print("=== Custom Game Sprite Generator ===")
    print("This script uses Nano Banana Pro Preview to generate 2D game sprites.")
    print("It can also apply perspective/platform rules based on the kind of asset you want.\n")
    args = parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not found.")
        print("Please set it before running the script (e.g., $env:GEMINI_API_KEY='your_key')")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")

    # Ensure the directory exists
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)

    interactive_mode = not any([
        args.file_name,
        args.asset_type,
        args.view_mode,
        args.description,
        args.preset,
        args.face,
    ])

    while True:
        setups = collect_asset_setups(args)
        auto_open = args.auto_open
        if auto_open is None:
            auto_open = ask_yes_no("Open the PNG automatically after saving?", default=True)

        allow_multi_version = all(
            supports_multi_version_generation(setup["asset_type"], setup["preset_name"])
            for setup in setups
        )
        target_count = getattr(args, 'count', 1)
        if not allow_multi_version and target_count > 1:
            print("Multiple versions are only supported for platforms, props, and backgrounds. Using 1.")
            target_count = 1
        if interactive_mode and allow_multi_version and target_count == 1:
            target_count = choose_count(default=1)
        batch_mode = len(setups) > 1
        restart_outer = False

        for setup_index, setup in enumerate(setups, start=1):
            file_name = setup["file_name"]
            preset_name = setup["preset_name"]
            asset_type = setup["asset_type"]
            view_mode = setup["view_mode"]
            custom_prompt = setup["custom_prompt"]
            facing_right = setup["facing_right"]
            default_view_choice = get_default_view_choice(asset_type, file_name)
            generated_count = 0

            while generated_count < target_count:
                full_prompt = build_prompt(custom_prompt, asset_type, view_mode, facing_right=facing_right)
                if batch_mode:
                    print(f"\n[{setup_index}/{len(setups)}] {file_name}")
                if target_count > 1:
                    print(f"Generating '{file_name}-{generated_count + 1}.png' (Image {generated_count + 1} of {target_count})...")
                else:
                    print(f"Generating '{file_name}.png'...")
                print(f"Asset type: {asset_type['label']}")
                print(f"Viewpoint: {view_mode['label']}")
                print("Prompt:")
                print(textwrap.fill(full_prompt, width=100))
                print("")

                try:
                    img = generate_image(client, full_prompt, asset_type["label"])
                    if img is None:
                        print("\nFailed: No image data returned from the model.")
                    else:
                        out_path = get_output_path(assets_dir, file_name, target_count, generated_count)
                        img.save(out_path, "PNG")
                        print(f"\nSuccess! Saved to: {out_path}")

                        if auto_open:
                            open_file(out_path)

                    print("")
                    generated_count += 1
                    if generated_count < target_count:
                        continue

                    if batch_mode:
                        break

                    try:
                        action = input("Press Enter to finish, 'r' to retry, 'e' to edit description, 'f' to flip facing, 'v' to change viewpoint, or 'n' for a new asset: ").strip().lower()
                    except EOFError:
                        action = ""
                    if action == "r":
                        generated_count -= 1
                        continue
                    if action == "e":
                        new_prompt = input("Update description:\n> ").strip()
                        if new_prompt:
                            custom_prompt = maybe_add_canvas_hint(new_prompt, asset_type)
                        generated_count -= 1
                        continue
                    if action == "f" and view_mode["supports_facing"] and asset_type["label"] != "Background":
                        facing_right = not facing_right
                        generated_count -= 1
                        continue
                    if action == "v":
                        view_mode = choose_view_mode(default_view_choice)
                        if view_mode["supports_facing"] and asset_type["label"] != "Background":
                            facing_right = ask_yes_no("Should the sprite face right?", default=facing_right)
                        generated_count -= 1
                        continue
                    if action == "n":
                        restart_outer = True
                        break
                    return
                except Exception as e:
                    print(f"\nError generating image: {e}")
                    try:
                        retry = input("Press Enter to stop, 'r' to retry, or 'n' for a new asset: ").strip().lower()
                    except EOFError:
                        retry = ""
                    if retry == "r":
                        continue
                    if retry == "n":
                        restart_outer = True
                        break
                    return

            if restart_outer:
                break

        if batch_mode and not restart_outer:
            print("\nBatch complete.")
            try:
                action = input("Press Enter to finish or 'n' for a new asset: ").strip().lower()
            except EOFError:
                action = ""
            if action != "n":
                return

        if not interactive_mode:
            return
        args = parse_args()

if __name__ == "__main__":
    generate_custom_sprite()
