# Cluster Crash

Cluster Crash is a 2D side-scrolling platformer about surviving impossible IT tickets, restoring VMs, dodging datacenter hazards, and throwing keyboards at increasingly unreasonable users.

The game is a small static web project: HTML, CSS, JavaScript, and PNG assets. There is no build step.

## Run The Game

From the repo root:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

You can also open `index.html` directly in a browser, but a local web server is usually more reliable for asset loading and cache behavior.

## Controls

- Move: `A` / `D` or arrow keys
- Jump: `W`, arrow up, or space
- Throw keyboard: `F` or Enter
- Pause: `P` or Escape
- Restart run: `R`
- Jump to level: `L`

Debug/test controls:

- Toggle hitboxes: `H`
- Toggle platform tops: `J`
- Toggle bot: `B`
- Toggle god mode: `Ctrl+Shift+G`
- Toggle Smart Assist test: `Ctrl+Shift+A`

## Game Loop

Normal levels are procedurally generated with platforms, hazards, pickups, tickets, and enemies. Collect all VM tickets, then reach the cloud exit.

Every fourth level is a manager boss fight. Defeat the boss, then reach the exit. After clearing a level, choose one upgrade before the next level starts.

## Characters

Paul is tougher and more control-oriented, with more lives and heavier keyboards.

Gert-Jan is faster and more agile, with quicker keyboard throws but less durability.

## Enemies

Normal enemy archetypes are defined in `USER_VARIANTS` in [game.js](game.js).

Current enemy types include:

- Urgent User: basic walker
- ASAP User: jumping platform chaser
- Armored User: tougher melee enemy
- Elite Armored User: late-run damage sponge
- Email User: ranged email shooter
- VIP User: tough ranged executive enemy
- Auditor: slow support tank that buffs nearby users
- Spam Caller: fragile enemy that rushes in bursts
- Change Manager: backline support enemy with denial zones
- Ransomware Popup: modal-style hazard enemy that appears briefly
- Escalation User: weak at first, gains stacks if ignored
- Ticket Spammer: frequent low-threat projectile spammer

Support enemies are intended to spawn with escorts so their buffs are visible in normal rooms.

## Hazards

Hazard definitions live in `SPECIAL_HAZARD_TYPES` in [game.js](game.js).

Current hazards include:

- Data Leak: slippery floor
- Cable Mess: slows movement and weakens jumps
- Static Electricity: timed damage pulse
- Overheating Vent: always blows upward
- Patch Reboot Tile: warning, then burst
- Disk Failure: platform disappears briefly
- Backup Window: moving barrier that can shove players into gaps

## Pickups

Pickups appear during procedural levels:

- Snapshot Shield: absorbs one hit
- vMotion Burst: speed and brief invulnerability
- Patch Bundle: temporary damage boost
- HA Restart: restores a life

## Upgrades

Upgrades are defined in `UPGRADE_POOL` in [game.js](game.js). They modify movement, jump height, air jumps, keyboard damage, cooldowns, shields, pickups, hazards, boss pressure, and build traits.

The upgrade pool uses rarity weights and max stack counts. Each level clear rolls a small set of upgrade choices.

## Assets

Game assets live in [assets](assets).

Sprite loading supports both base files and numbered variants. For example:

```text
assets/auditor-user.png
assets/auditor-user-1.png
assets/auditor-user-2.png
```

The game will rotate through loaded variants when available.

Asset loading includes a cache version in [game.js](game.js):

```js
const ASSET_CACHE_VERSION = "enemy-archetypes-v2";
```

If sprite changes do not appear in the browser, bump this string or hard refresh.

## Generate Custom Sprites

Use [generate_custom.py](generate_custom.py) to generate new pixel-art assets. It saves into this repo's `assets` folder.

Requirements:

- Python
- `Pillow`
- `google-genai`
- `GEMINI_API_KEY` environment variable

Example:

```powershell
$env:GEMINI_API_KEY="your_key"
python generate_custom.py --preset auditor-user --file auditor-user
```

Useful enemy presets:

```powershell
python generate_custom.py --preset auditor-user --file auditor-user
python generate_custom.py --preset spam-caller-user --file spam-caller-user
python generate_custom.py --preset change-manager-user --file change-manager-user
python generate_custom.py --preset ransomware-popup-user --file ransomware-popup-user
python generate_custom.py --preset escalation-user --file escalation-user
python generate_custom.py --preset ticket-spammer-user --file ticket-spammer-user
```

Generate variants:

```powershell
python generate_custom.py --preset auditor-user --file auditor-user --count 3
```

That creates files such as:

```text
assets/auditor-user-1.png
assets/auditor-user-2.png
assets/auditor-user-3.png
```

## Project Files

- [index.html](index.html): page structure and canvas host
- [styles.css](styles.css): layout, overlays, HUD, menus
- [game.js](game.js): game logic, rendering, procedural generation, upgrades, enemies, hazards
- [generate_custom.py](generate_custom.py): interactive and CLI asset generator
- [generate_backgrounds.ps1](generate_backgrounds.ps1): helper script for background generation
- [assets](assets): sprites, backgrounds, pickups, hazards, projectiles

## Development Notes

There is currently no package manager setup and no automated JavaScript test runner in the repo.

For quick checks:

```powershell
python -B -c "import ast, pathlib; ast.parse(pathlib.Path('generate_custom.py').read_text())"
```

If Node is installed, this is also useful:

```powershell
node --check game.js
```

The game logs whether the new enemy archetype sprites loaded:

```text
Enemy archetype sprites { ... }
```

Check the browser console if new sprites do not appear.
