const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const stageWrap = document.querySelector(".stage-wrap");
const gameShell = document.querySelector(".game-shell");
const selectOverlay = document.getElementById("selectOverlay");
const messageOverlay = document.getElementById("messageOverlay");
const messageCard = messageOverlay.querySelector(".message-card");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const messageGuide = document.getElementById("messageGuide");
const messageHazards = document.getElementById("messageHazards");
const messageEnemies = document.getElementById("messageEnemies");
const messagePickups = document.getElementById("messagePickups");
const messageSummary = document.getElementById("messageSummary");
const resetBestRunButton = document.getElementById("resetBestRunButton");
const pauseResetBestRunButton = document.getElementById("pauseResetBestRunButton");
const upgradeOverlay = document.getElementById("upgradeOverlay");
const upgradeTitle = document.getElementById("upgradeTitle");
const upgradeSummary = document.getElementById("upgradeSummary");
const upgradeGrid = document.getElementById("upgradeGrid");
const hudLevel = document.getElementById("hudLevel");
const hudPlayer = document.getElementById("hudPlayer");
const hudGoalLabel = document.getElementById("hudGoalLabel");
const hudScore = document.getElementById("hudScore");
const hudLives = document.getElementById("hudLives");
const hudRunScore = document.getElementById("hudRunScore");
const hudBestRun = document.getElementById("hudBestRun");
const hudStats = document.getElementById("hudStats");
const hudBuffs = document.getElementById("hudBuffs");

let worldWidth = 3840;
const GROUND_Y = 640;
const GRAVITY = 2200;
const MAX_FALL_SPEED = 1800;
const BASE_TICKETS = 8;
const BASE_LEVEL_SEGMENTS = 10;
const BASE_GAP_WIDTH = 150;
const BASE_STEP_UP = 130;
const BASE_STEP_DOWN = 140;
const THEME_DEFAULT_TUNING = {
  hazardChanceMultiplier: 1,
  enemyChanceMultiplier: 1,
  gapMultiplier: 1,
  floorGapMultiplier: 1,
  platformWidthMultiplier: 1,
  enemyWeights: {},
  hazardWeights: {},
  platformWeights: {},
};
const JUMP_KEYS = new Set(["ArrowUp", "w", "W", " "]);
const BOSS_LEVEL_INTERVAL = 4;
const BOSS_SIDE_PASS_THROUGH = new Set(["rack", "switch", "database"]);
const BEST_SCORE_KEY = "vsphereSprintBestScore";
const BEST_LEVEL_KEY = "vsphereSprintBestLevel";
const ASSET_CACHE_VERSION = "platform-themes-v1";
const PICKUP_TYPES = [
  { kind: "snapshot", label: "SNAP", color: "#74f7c4", title: "Snapshot Shield" },
  { kind: "vmotion", label: "vMO", color: "#4aa3ff", title: "vMotion Burst" },
  { kind: "patch", label: "FIX", color: "#ffb84d", title: "Patch Bundle" },
  { kind: "ha", label: "HA", color: "#b98cff", title: "HA Restart" },
];
const SPECIAL_HAZARD_TYPES = {
  dataLeak: {
    spriteKey: "dataLeakHazard",
    label: "DATA LEAK",
    color: "#4ed9b5",
    unlockLevel: 2,
    spawnWeight: 3,
    allowedOnFloor: true,
    widthFactor: 0.34,
    height: 16,
    renderTopPad: 6,
    surfaceInset: 4,
  },
  cableMess: {
    spriteKey: "cableMessHazard",
    label: "CABLE",
    color: "#ff9f4d",
    unlockLevel: 2,
    spawnWeight: 3,
    allowedOnFloor: true,
    widthFactor: 0.28,
    height: 16,
    renderTopPad: 6,
    surfaceInset: 4,
  },
  static: {
    spriteKey: "staticHazard",
    label: "STATIC",
    color: "#7cf7ff",
    unlockLevel: 3,
    spawnWeight: 2,
    allowedOnFloor: true,
    widthFactor: 0.2,
    height: 28,
    renderTopPad: 10,
    surfaceInset: 4,
    period: 1.6,
    activeWindowStart: 0.52,
    activeWindowEnd: 0.82,
  },
  vent: {
    spriteKey: "ventHazard",
    label: "VENT",
    color: "#ff8b5b",
    unlockLevel: 4,
    spawnWeight: 2,
    allowedOnFloor: true,
    widthFactor: 0.18,
    height: 28,
    renderTopPad: 12,
    surfaceInset: 4,
    period: 1.8,
    activeWindowStart: 0,
    activeWindowEnd: 1,
  },
  backupWindow: {
    spriteKey: "backupWindowHazard",
    label: "BACKUP",
    color: "#8fd3ff",
    unlockLevel: 4,
    spawnWeight: 2,
    allowedOnFloor: true,
    widthFactor: 0.16,
    height: 44,
    renderTopPad: 0,
    surfaceInset: 4,
    period: 3.1,
    sweepPadding: 0,
    sweepOvershoot: 10,
  },
  reboot: {
    spriteKey: "rebootHazard",
    label: "REBOOT",
    color: "#ffd166",
    unlockLevel: 5,
    spawnWeight: 2,
    allowedOnFloor: true,
    widthFactor: 0.22,
    height: 24,
    renderTopPad: 8,
    surfaceInset: 4,
    period: 2.1,
    warningWindowStart: 0.42,
    burstWindowStart: 0.7,
    burstWindowEnd: 0.92,
  },
  diskFailure: {
    label: "DISK",
    color: "#ff6b81",
    unlockLevel: 6,
    spawnWeight: 2,
    allowedOnFloor: true,
    widthFactor: 0.26,
    height: 18,
    renderTopPad: 6,
    surfaceInset: 4,
    period: 4.2,
    warningWindowStart: 0.68,
    burstWindowStart: 0.84,
    burstWindowEnd: 0.98,
  },
};
const MANAGER_BOSSES = ["Peter", "Richard R", "Richard A", "Chris", "Denise", "Sander", "Walter", "Salah", "Patrick"];
const BOSS_PROFILES = {
  Peter: { suitColor: "#3f7cff", hairColor: "#1f2a44", speed: 210, moveStyle: "patrol", attackStyle: "triple", projectileStyle: "memo", cooldown: 1.45, projectileColor: "#ff5b6e", projectileLabel: "PRIO", specialMechanic: "priorityZones", specialCooldown: 5.3, motionPhase: 0.45, motionStyle: { bobScale: 0.6, idleBobScale: 0.5, tiltScale: 0.75, strideScale: 0.8, legTiltScale: 0.7, squashScale: 0.7, torsoLiftScale: 0.75 } },
  "Richard R": { suitColor: "#8a7dff", hairColor: "#3a2c63", speed: 245, moveStyle: "dash", attackStyle: "fast", projectileStyle: "alert", cooldown: 1.0, projectileColor: "#ff8b1f", projectileLabel: "NOW", specialMechanic: "burstDash", specialCooldown: 4.5, motionPhase: 0.45, motionStyle: { bobScale: 0.7, idleBobScale: 0.55, tiltScale: 1.25, strideScale: 1.25, legTiltScale: 1.2, squashScale: 0.85, torsoShiftScale: 1.2 } },
  "Richard A": { suitColor: "#35d49d", hairColor: "#1f2a44", speed: 175, moveStyle: "patrol", attackStyle: "rain", projectileStyle: "folder", cooldown: 1.7, projectileColor: "#74f7c4", projectileLabel: "RFC", specialMechanic: "rfcMarkers", specialCooldown: 5.6, motionPhase: 0.45, motionStyle: { bobScale: 0.6, idleBobScale: 0.5, tiltScale: 0.75, strideScale: 0.8, legTiltScale: 0.7, squashScale: 0.7, torsoLiftScale: 0.75 } },
  Chris: { suitColor: "#ffb84d", hairColor: "#7a4a21", speed: 225, moveStyle: "hop", attackStyle: "lob", projectileStyle: "bubble", cooldown: 1.18, projectileColor: "#ffb84d", projectileLabel: "CALL", specialMechanic: "bouncingBubble", specialCooldown: 4.8, motionPhase: 0.7, motionStyle: { bobScale: 1.15, idleBobScale: 0.75, tiltScale: 1.05, strideScale: 0.9, legTiltScale: 0.9, squashScale: 1.1, torsoLiftScale: 1.2 } },
  Denise: { suitColor: "#ff5b6e", hairColor: "#5e3654", speed: 195, moveStyle: "hop", attackStyle: "spread", projectileStyle: "sync", cooldown: 1.32, projectileColor: "#ff5b6e", projectileLabel: "SYNC", specialMechanic: "syncBeam", specialCooldown: 5.8, motionPhase: 0.6, motionStyle: { bobScale: 1.15, idleBobScale: 0.75, tiltScale: 1.05, strideScale: 0.9, legTiltScale: 0.9, squashScale: 1.1, torsoLiftScale: 1.2 } },
  Sander: { suitColor: "#2274ff", hairColor: "#1f2a44", speed: 280, moveStyle: "dash", attackStyle: "fast", projectileStyle: "alert", cooldown: 0.98, projectileColor: "#7cf7ff", projectileLabel: "ETA?", specialMechanic: "pursuitChain", specialCooldown: 4.9, motionPhase: 0.35, motionStyle: { bobScale: 0.7, idleBobScale: 0.55, tiltScale: 1.25, strideScale: 1.25, legTiltScale: 1.2, squashScale: 0.85, torsoShiftScale: 1.2 } },
  Walter: { suitColor: "#173656", hairColor: "#9b9b9b", speed: 160, moveStyle: "patrol", attackStyle: "triple", projectileStyle: "memo", cooldown: 1.55, projectileColor: "#b98cff", projectileLabel: "GOV", specialMechanic: "memoWall", specialCooldown: 6.0, motionPhase: 0.45, motionStyle: { bobScale: 0.6, idleBobScale: 0.5, tiltScale: 0.75, strideScale: 0.8, legTiltScale: 0.7, squashScale: 0.7, torsoLiftScale: 0.75 } },
  Salah: { suitColor: "#35d49d", hairColor: "#161616", speed: 215, moveStyle: "dash", attackStyle: "spread", projectileStyle: "sync", cooldown: 1.18, projectileColor: "#74f7c4", projectileLabel: "FIX", specialMechanic: "precisionVolley", specialCooldown: 4.8, motionPhase: 0.5, motionStyle: { bobScale: 0.7, idleBobScale: 0.55, tiltScale: 1.25, strideScale: 1.25, legTiltScale: 1.2, squashScale: 0.85, torsoShiftScale: 1.2 } },
  Patrick: { suitColor: "#b98cff", hairColor: "#7a4a21", speed: 230, moveStyle: "hop", attackStyle: "rain", projectileStyle: "folder", cooldown: 1.35, projectileColor: "#b98cff", projectileLabel: "PLAN", specialMechanic: "planningLanes", specialCooldown: 5.8, motionPhase: 0.8, motionStyle: { bobScale: 1.15, idleBobScale: 0.75, tiltScale: 1.05, strideScale: 0.9, legTiltScale: 0.9, squashScale: 1.1, torsoLiftScale: 1.2 } },
};
const BOSS_PROJECTILE_SPRITES = {
  memo: "bossMemoProjectile",
  alert: "bossAlertProjectile",
  folder: "bossFolderProjectile",
  bubble: "bossBubbleProjectile",
  sync: "bossSyncProjectile",
};
const BOSS_ARENAS = [
  {
    platforms: [
      { x: 0, y: GROUND_Y, w: 420, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } },
      { x: 540, y: GROUND_Y, w: 380, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } },
      { x: 1040, y: GROUND_Y, w: 700, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } },
      { x: 260, y: 500, w: 210, h: 32, kind: "switch", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 690, y: 430, w: 260, h: 42, kind: "database", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 1120, y: 510, w: 220, h: 32, kind: "rack", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
    ],
    firewalls: [
      { x: 430, y: 676, w: 100, h: 18, hitbox: { left: 8, right: 8, top: 8, bottom: 0 } },
      { x: 930, y: 676, w: 100, h: 18, hitbox: { left: 8, right: 8, top: 8, bottom: 0 } },
      { x: 780, y: 412, w: 80, h: 16, hitbox: { left: 10, right: 10, top: 6, bottom: 0 } },
    ],
    decorations: [
      { x: 90, y: GROUND_Y - 92, w: 78, h: 92, kind: "patchpanel" },
      { x: 1510, y: GROUND_Y - 92, w: 78, h: 92, kind: "antenna" },
    ],
    bossSpawn: { x: 1240, y: 514, minX: 1060, maxX: 1520 },
    finishX: 1560,
    worldWidth: 1740,
  },
  {
    platforms: [
      { x: 0, y: GROUND_Y, w: 360, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } },
      { x: 500, y: 560, w: 260, h: 32, kind: "rack", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 870, y: 470, w: 270, h: 32, kind: "switch", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 1260, y: 400, w: 280, h: 42, kind: "database", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 1380, y: GROUND_Y, w: 500, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } },
    ],
    firewalls: [
      { x: 370, y: 676, w: 120, h: 18, hitbox: { left: 8, right: 8, top: 8, bottom: 0 } },
      { x: 770, y: 676, w: 600, h: 18, hitbox: { left: 8, right: 8, top: 8, bottom: 0 } },
      { x: 1360, y: 382, w: 90, h: 16, hitbox: { left: 10, right: 10, top: 6, bottom: 0 } },
    ],
    decorations: [
      { x: 90, y: GROUND_Y - 92, w: 78, h: 92, kind: "terminal" },
      { x: 1700, y: GROUND_Y - 92, w: 78, h: 92, kind: "patchpanel" },
    ],
    bossSpawn: { x: 1440, y: 514, minX: 1270, maxX: 1710 },
    finishX: 1740,
    worldWidth: 1880,
  },
  {
    platforms: [
      { x: 0, y: GROUND_Y, w: 520, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } },
      { x: 660, y: 530, w: 220, h: 32, kind: "switch", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 980, y: 450, w: 220, h: 42, kind: "database", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 1300, y: 530, w: 220, h: 32, kind: "rack", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
      { x: 1650, y: GROUND_Y, w: 420, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } },
      { x: 1710, y: 470, w: 190, h: 32, kind: "switch", hitbox: { left: 8, right: 8, top: 0, bottom: 0 } },
    ],
    firewalls: [
      { x: 530, y: 676, w: 120, h: 18, hitbox: { left: 8, right: 8, top: 8, bottom: 0 } },
      { x: 890, y: 676, w: 750, h: 18, hitbox: { left: 8, right: 8, top: 8, bottom: 0 } },
      { x: 1050, y: 432, w: 80, h: 16, hitbox: { left: 10, right: 10, top: 6, bottom: 0 } },
      { x: 1360, y: 512, w: 90, h: 16, hitbox: { left: 10, right: 10, top: 6, bottom: 0 } },
    ],
    decorations: [
      { x: 120, y: GROUND_Y - 92, w: 78, h: 92, kind: "antenna" },
      { x: 1850, y: GROUND_Y - 92, w: 78, h: 92, kind: "terminal" },
    ],
    bossSpawn: { x: 1720, y: 344, minX: 1660, maxX: 1820 },
    finishX: 1890,
    worldWidth: 2070,
  },
];
const ROOM_THEMES = [
  {
    name: "Datacenter",
    skyTop: "#07111f",
    skyMid: "#09152a",
    skyBottom: "#04060d",
    glow: "#74f7c4",
    haze: "rgba(116, 247, 196, 0.16)",
    skylineA: "#0b1d33",
    skylineB: "#0d2642",
    backgroundStyle: "datacenter",
    backgroundImageBase: "bgDatacenter",
    platformPool: ["rack", "switch", "database", "esxi", "crashCart", "patchWall", "cloudAppliance"],
    decorationPool: ["terminal", "antenna", "patchpanel", "winserver"],
    themeTuning: {
      hazardChanceMultiplier: 1,
      enemyWeights: { walker: 1.2, jumper: 1.15, armored: 1, emailer: 0.95, spamCaller: 1.05, ticketSpammer: 0.95 },
      hazardWeights: { dataLeak: 1.1, static: 1, cableMess: 1, vent: 1, reboot: 1, backupWindow: 0.95, diskFailure: 0.9 },
      platformWeights: { rack: 1.1, switch: 1.05, database: 1, esxi: 1, crashCart: 0.85, patchWall: 0.75, cloudAppliance: 0.65 },
    },
  },
  {
    name: "Office Floor",
    skyTop: "#161325",
    skyMid: "#1f1936",
    skyBottom: "#0c0a15",
    glow: "#ffd166",
    haze: "rgba(255, 209, 102, 0.14)",
    skylineA: "#2b2945",
    skylineB: "#353252",
    backgroundStyle: "office",
    backgroundImageBase: "bgOffice",
    platformPool: ["switch", "database", "esxi", "officeDesk", "crashCart"],
    decorationPool: ["terminal", "winserver", "patchpanel"],
    themeTuning: {
      enemyChanceMultiplier: 1.08,
      hazardChanceMultiplier: 0.92,
      enemyWeights: { emailer: 2.4, vip: 1.85, walker: 1.3, escalationUser: 1.45, ticketSpammer: 1.25, armored: 0.45, armoredHeavy: 0.35, auditor: 0.8 },
      hazardWeights: { dataLeak: 1.35, static: 1.15, reboot: 1.1, cableMess: 0.75, vent: 0.55, diskFailure: 0.55, backupWindow: 0.7 },
      platformWeights: { officeDesk: 2.15, crashCart: 1.05, switch: 1.25, database: 1.05, esxi: 0.75 },
    },
  },
  {
    name: "Server Room",
    skyTop: "#081622",
    skyMid: "#102a33",
    skyBottom: "#040b11",
    glow: "#7cf7ff",
    haze: "rgba(124, 247, 255, 0.16)",
    skylineA: "#0d2733",
    skylineB: "#123645",
    backgroundStyle: "serverroom",
    backgroundImageBase: "bgServer",
    platformPool: ["rack", "database", "esxi", "upsRack", "cableTray", "patchWall", "crashCart"],
    decorationPool: ["patchpanel", "antenna", "terminal"],
    themeTuning: {
      hazardChanceMultiplier: 1.14,
      enemyWeights: { armored: 1.8, armoredHeavy: 1.65, auditor: 1.35, changeManager: 1.25, emailer: 0.75, vip: 0.8, spamCaller: 0.7 },
      hazardWeights: { cableMess: 2.1, vent: 1.85, static: 1.25, reboot: 1.15, dataLeak: 0.8, backupWindow: 0.75, diskFailure: 0.9 },
      platformWeights: { rack: 1.25, database: 1.05, esxi: 1.15, upsRack: 1.5, cableTray: 1.25, patchWall: 1.35, crashCart: 0.75 },
    },
  },
  {
    name: "DR Site",
    skyTop: "#120d24",
    skyMid: "#181136",
    skyBottom: "#070510",
    glow: "#b98cff",
    haze: "rgba(185, 140, 255, 0.18)",
    skylineA: "#1c1741",
    skylineB: "#271c55",
    backgroundStyle: "drsite",
    backgroundImageBase: "bgDr",
    platformPool: ["rack", "switch", "esxi", "upsRack", "cloudAppliance", "crashCart", "patchWall"],
    decorationPool: ["antenna", "winserver", "patchpanel"],
    themeTuning: {
      hazardChanceMultiplier: 1.22,
      enemyChanceMultiplier: 1.05,
      gapMultiplier: 1.22,
      floorGapMultiplier: 1.16,
      platformWidthMultiplier: 0.94,
      enemyWeights: { escalationUser: 1.9, spamCaller: 1.45, ticketSpammer: 1.35, vip: 1.25, auditor: 1.15, armoredHeavy: 1.1, walker: 0.85 },
      hazardWeights: { backupWindow: 2.15, diskFailure: 2.05, reboot: 1.35, static: 1.2, dataLeak: 0.85, cableMess: 0.9, vent: 0.85 },
      platformWeights: { rack: 1.05, switch: 0.9, esxi: 1.15, upsRack: 1.35, cloudAppliance: 1.65, crashCart: 0.95, patchWall: 0.9 },
    },
  },
];
const USER_VARIANTS = [
  {
    kind: "walker",
    spriteKey: "user",
    speedFactor: 1,
    w: 54,
    h: 72,
    hp: 1,
    jumpPower: 0,
    tint: "#ff5b6e",
    hitbox: { left: 12, right: 12, top: 10, bottom: 2 },
    motionPhase: 0,
    motionStyle: { bobScale: 0.95, idleBobScale: 0.75, tiltScale: 0.95, strideScale: 1, legTiltScale: 1, squashScale: 0.9, torsoLiftScale: 0.9 },
    behavior: {
      unlockLevel: 1,
      spawnWeight: 4,
      hpScaling: "light",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: false,
      },
    },
  },
  {
    kind: "jumper",
    spriteKey: "jumperUser",
    speedFactor: 0.9,
    w: 52,
    h: 70,
    hp: 1,
    jumpPower: 700,
    tint: "#ffb84d",
    hitbox: { left: 11, right: 11, top: 10, bottom: 2 },
    motionPhase: 0.9,
    motionStyle: { bobScale: 1.15, idleBobScale: 0.8, tiltScale: 1.05, strideScale: 1.1, legTiltScale: 1.15, squashScale: 1.1, torsoLiftScale: 1.15 },
    behavior: {
      unlockLevel: 2,
      spawnWeight: 3,
      hpScaling: "light",
      jump: {
        enabled: true,
        edgeJump: true,
        blockedJump: true,
        edgeWindow: 0,
        blockedWindow: 0.6,
        cooldownMin: 0.8,
        cooldownMax: 1.8,
      },
      ranged: {
        enabled: false,
      },
    },
  },
  {
    kind: "spamCaller",
    spriteKey: "spamCallerUser",
    speedFactor: 1.08,
    w: 50,
    h: 68,
    hp: 1,
    jumpPower: 620,
    tint: "#ff8b5b",
    hitbox: { left: 11, right: 11, top: 10, bottom: 2 },
    motionPhase: 0.7,
    motionStyle: { bobScale: 1.3, idleBobScale: 0.8, tiltScale: 1.35, strideScale: 1.35, legTiltScale: 1.35, squashScale: 1.18, torsoLiftScale: 1.22, torsoShiftScale: 1.3 },
    behavior: {
      unlockLevel: 3,
      spawnWeight: 4,
      hpScaling: "light",
      jump: {
        enabled: true,
        edgeJump: true,
        blockedJump: true,
        edgeWindow: 0.2,
        blockedWindow: 0.8,
        cooldownMin: 1.1,
        cooldownMax: 2.2,
      },
      ranged: {
        enabled: false,
      },
      burst: {
        enabled: true,
        cooldownMin: 1.0,
        cooldownMax: 1.8,
        windup: 0.28,
        windupSpeedMultiplier: 0.18,
        duration: 0.44,
        speedMultiplier: 3.15,
      },
    },
  },
  {
    kind: "armored",
    spriteKey: "armoredUser",
    speedFactor: 0.85,
    w: 62,
    h: 80,
    hp: 4,
    jumpPower: 0,
    armor: 1,
    maxDamagePerHit: 2,
    tint: "#8a7dff",
    hitbox: { left: 14, right: 14, top: 12, bottom: 3 },
    motionPhase: 0.35,
    motionStyle: { bobScale: 0.55, idleBobScale: 0.45, tiltScale: 0.65, strideScale: 0.75, legTiltScale: 0.6, squashScale: 0.5, torsoLiftScale: 0.55 },
    behavior: {
      unlockLevel: 3,
      spawnWeight: 3,
      hpScaling: "heavy",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: false,
      },
    },
  },
  {
    kind: "escalationUser",
    spriteKey: "escalationUserSprite",
    speedFactor: 0.88,
    w: 54,
    h: 72,
    hp: 1,
    jumpPower: 0,
    tint: "#ff5b6e",
    hitbox: { left: 12, right: 12, top: 10, bottom: 2 },
    motionPhase: 0.25,
    motionStyle: { bobScale: 0.95, idleBobScale: 0.75, tiltScale: 0.95, strideScale: 1, legTiltScale: 1, squashScale: 0.9, torsoLiftScale: 0.9 },
    behavior: {
      unlockLevel: 5,
      spawnWeight: 4,
      hpScaling: "light",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: false,
      },
      escalation: {
        enabled: true,
        interval: 4.0,
        maxStacks: 3,
        hpPerStack: 1,
        speedPerStack: 0.18,
      },
    },
  },
  {
    kind: "emailer",
    spriteKey: "emailUser",
    speedFactor: 0.8,
    w: 56,
    h: 72,
    hp: 1,
    jumpPower: 0,
    tint: "#7cf7ff",
    hitbox: { left: 12, right: 12, top: 10, bottom: 2 },
    motionPhase: 0.2,
    motionStyle: { bobScale: 0.9, idleBobScale: 0.95, tiltScale: 1.25, strideScale: 0.65, legTiltScale: 0.55, squashScale: 0.8, torsoLiftScale: 1.1, torsoShiftScale: 1.35 },
    behavior: {
      unlockLevel: 5,
      spawnWeight: 2,
      hpScaling: "light",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: true,
        engageDistanceX: 680,
        engageDistanceY: 180,
        pattern: "aimed",
        projectileW: 42,
        projectileH: 20,
        projectileSpeedMin: 520,
        projectileSpeedMax: 640,
        projectileVyMin: -80,
        projectileVyMax: 80,
        projectileGravity: 160,
        projectileColor: "#7cf7ff",
        projectileLabel: "EMAIL",
        projectileHitbox: { left: 7, right: 7, top: 4, bottom: 4 },
        originOffsetX: 12,
        originY: 24,
        attackPoseTime: 0.34,
        cooldownMin: 1.8,
        cooldownMax: 3.0,
      },
    },
  },
  {
    kind: "auditor",
    spriteKey: "auditorUser",
    speedFactor: 0.58,
    w: 68,
    h: 86,
    hp: 7,
    jumpPower: 0,
    armor: 2,
    maxDamagePerHit: 2,
    tint: "#9b9b9b",
    hitbox: { left: 16, right: 16, top: 12, bottom: 3 },
    motionPhase: 0.4,
    motionStyle: { bobScale: 0.36, idleBobScale: 0.34, tiltScale: 0.42, strideScale: 0.52, legTiltScale: 0.45, squashScale: 0.36, torsoLiftScale: 0.42 },
    behavior: {
      unlockLevel: 6,
      spawnWeight: 4,
      hpScaling: "heavy",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: false,
      },
      support: {
        enabled: true,
        range: 230,
        speedMultiplier: 1.14,
        shootCooldownMultiplier: 0.82,
        armorBonus: 1,
        color: "#d6dde6",
        label: "AUDIT",
      },
    },
  },
  {
    kind: "ticketSpammer",
    spriteKey: "ticketSpammerUser",
    speedFactor: 0.74,
    w: 56,
    h: 72,
    hp: 1,
    jumpPower: 0,
    tint: "#74f7c4",
    hitbox: { left: 12, right: 12, top: 10, bottom: 2 },
    motionPhase: 0.32,
    motionStyle: { bobScale: 0.88, idleBobScale: 1, tiltScale: 1.18, strideScale: 0.62, legTiltScale: 0.52, squashScale: 0.82, torsoLiftScale: 1.12, torsoShiftScale: 1.35 },
    behavior: {
      unlockLevel: 6,
      spawnWeight: 4,
      hpScaling: "light",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: true,
        engageDistanceX: 720,
        engageDistanceY: 220,
        pattern: "ticketBurst",
        projectileW: 26,
        projectileH: 16,
        projectileSpeedMin: 220,
        projectileSpeedMax: 310,
        projectileVyMin: -230,
        projectileVyMax: -80,
        projectileGravity: 920,
        projectileColor: "#74f7c4",
        projectileLabel: "TKT",
        projectileHitbox: { left: 5, right: 5, top: 4, bottom: 4 },
        originOffsetX: 10,
        originY: 25,
        attackPoseTime: 0.22,
        cooldownMin: 1.05,
        cooldownMax: 1.65,
        burstCount: 3,
        burstSpread: 0.18,
        hitEffect: "snare",
      },
    },
  },
  {
    kind: "ransomwarePopup",
    spriteKey: "ransomwarePopupUser",
    speedFactor: 0,
    w: 58,
    h: 52,
    hp: 1,
    jumpPower: 0,
    tint: "#ff4d8d",
    hitbox: { left: 12, right: 12, top: 10, bottom: 6 },
    motionPhase: 0.1,
    motionStyle: { bobScale: 0.2, idleBobScale: 1.1, tiltScale: 0.2, strideScale: 0.1, legTiltScale: 0.1, squashScale: 1.0, torsoLiftScale: 1.1 },
    behavior: {
      unlockLevel: 7,
      spawnWeight: 4,
      hpScaling: "light",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: false,
      },
      popup: {
        enabled: true,
        hiddenMin: 1.4,
        hiddenMax: 3.0,
        warningTime: 0.85,
        activeMin: 0.8,
        activeMax: 1.25,
        label: "LOCKED",
      },
    },
  },
  {
    kind: "armoredElite",
    spriteKey: "armoredHeavyUser",
    speedFactor: 0.92,
    w: 66,
    h: 84,
    hp: 6,
    jumpPower: 0,
    armor: 2,
    maxDamagePerHit: 1,
    tint: "#6f86ff",
    hitbox: { left: 15, right: 15, top: 12, bottom: 3 },
    motionPhase: 0.18,
    motionStyle: { bobScale: 0.45, idleBobScale: 0.38, tiltScale: 0.55, strideScale: 0.65, legTiltScale: 0.5, squashScale: 0.42, torsoLiftScale: 0.48 },
    behavior: {
      unlockLevel: 9,
      spawnWeight: 2,
      hpScaling: "heavy",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: false,
      },
    },
  },
  {
    kind: "changeManager",
    spriteKey: "changeManagerUser",
    speedFactor: 0.62,
    w: 60,
    h: 78,
    hp: 3,
    jumpPower: 0,
    armor: 1,
    maxDamagePerHit: 2,
    tint: "#b98cff",
    hitbox: { left: 13, right: 13, top: 11, bottom: 3 },
    motionPhase: 0.48,
    motionStyle: { bobScale: 0.62, idleBobScale: 0.72, tiltScale: 0.72, strideScale: 0.62, legTiltScale: 0.58, squashScale: 0.62, torsoLiftScale: 0.95, torsoShiftScale: 1.05 },
    behavior: {
      unlockLevel: 9,
      spawnWeight: 4,
      hpScaling: "heavy",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: false,
      },
      support: {
        enabled: true,
        range: 260,
        speedMultiplier: 1.1,
        shootCooldownMultiplier: 0.8,
        armorBonus: 0,
        color: "#b98cff",
        label: "CAB",
      },
      denial: {
        enabled: true,
        range: 760,
        cooldownMin: 3.2,
        cooldownMax: 5.0,
        warnTime: 0.75,
        duration: 1.55,
        w: 104,
        h: 44,
        color: "#b98cff",
        label: "CHANGE",
      },
    },
  },
  {
    kind: "vip",
    spriteKey: "vipUser",
    speedFactor: 1.02,
    w: 60,
    h: 78,
    hp: 3,
    jumpPower: 0,
    armor: 1,
    maxDamagePerHit: 1,
    tint: "#ffd166",
    hitbox: { left: 13, right: 13, top: 11, bottom: 3 },
    motionPhase: 0.6,
    motionStyle: { bobScale: 0.8, idleBobScale: 0.7, tiltScale: 1.1, strideScale: 0.9, legTiltScale: 0.8, squashScale: 0.75, torsoLiftScale: 1.05, torsoShiftScale: 1.2 },
    behavior: {
      unlockLevel: 11,
      spawnWeight: 5,
      hpScaling: "heavy",
      jump: {
        enabled: false,
      },
      ranged: {
        enabled: true,
        engageDistanceX: 760,
        engageDistanceY: 210,
        projectileW: 38,
        projectileH: 24,
        projectileSpeedMin: 420,
        projectileSpeedMax: 520,
        projectileVyMin: -150,
        projectileVyMax: -60,
        projectileGravity: 760,
        projectileColor: "#ffd166",
        projectileLabel: "VIP",
        projectileHitbox: { left: 5, right: 5, top: 4, bottom: 4 },
        originOffsetX: 12,
        originY: 22,
        attackPoseTime: 0.28,
        cooldownMin: 1.1,
        cooldownMax: 1.9,
      },
    },
  },
];
const ENEMY_GUIDE_TEXT = {
  walker: {
    title: "Urgent User",
    description: "Basic trouble ticket. Walks straight at you and is easy alone, but becomes noisy in groups.",
  },
  jumper: {
    title: "ASAP User",
    description: "Platform chaser that hops over gaps and blocked paths to keep pressure on you.",
  },
  armored: {
    title: "Armored User",
    description: "Harder to burst down. Soaks multiple keyboards and shrugs off big damage spikes better than other users.",
  },
  armoredElite: {
    title: "Elite Armored User",
    description: "Late-run bruiser. Extra armor, much better damage resistance, and built to survive upgraded keyboard builds.",
  },
  auditor: {
    title: "Auditor",
    description: "Slow support tank. Tough to remove, and nearby users move faster, shoot faster, and can gain extra armor.",
  },
  spamCaller: {
    title: "Spam Caller",
    description: "Fragile sprinter. Briefly winds up, then rushes in a sharp burst that punishes standing still.",
  },
  emailer: {
    title: "Email User",
    description: "Ranged nuisance. Pauses to send deliberate email shots that punish predictable movement.",
  },
  changeManager: {
    title: "Change Manager",
    description: "Backline support. Buffs nearby users and drops temporary change-freeze zones where you want to stand.",
  },
  ransomwarePopup: {
    title: "Ransomware Popup",
    description: "Modal hazard. Flashes a warning, pops into a small space above the platform, then closes again.",
  },
  escalationUser: {
    title: "Escalation User",
    description: "Weak at first, but gains health and speed if left alive. Deal with it before priority escalates.",
  },
  ticketSpammer: {
    title: "Ticket Spammer",
    description: "Low-threat pressure. Bursts arcing tickets that briefly snag movement instead of hitting like emails.",
  },
  vip: {
    title: "VIP User",
    description: "High-priority executive. Tougher, faster, and more dangerous at range than the normal ticket crowd.",
  },
};
const HAZARD_GUIDE_TEXT = {
  dataLeak: {
    title: "Data Leak",
    description: "Slippery spill that makes stopping harder and lets momentum carry longer than normal.",
  },
  cableMess: {
    title: "Cable Mess",
    description: "Snags your movement and weakens jump takeoff, making tight platforming less forgiving.",
  },
  static: {
    title: "Static Electricity",
    description: "Pulses on a timer. Safe when idle, painful when the electric arc is active.",
  },
  vent: {
    title: "Overheating Vent",
    description: "Always blowing. Standing over it launches you upward and can interrupt careful jumps.",
  },
  reboot: {
    title: "Patch Reboot Tile",
    description: "Flashes a warning, then bursts upward and clips you if you linger on it too long.",
  },
  diskFailure: {
    title: "Disk Failure",
    description: "The whole platform blinks, then disappears long enough to punish greedy timing.",
  },
  backupWindow: {
    title: "Backup Window",
    description: "A moving barrier that sweeps past platform edges and can shove you into the gap.",
  },
};
const PICKUP_GUIDE_TEXT = {
  snapshot: {
    title: "Snapshot Shield",
    description: "Absorbs one hit. Great for crossing a dangerous section or surviving a boss mistake.",
  },
  vmotion: {
    title: "vMotion Burst",
    description: "Temporary speed burst with brief invulnerability, useful for aggressive movement or recovery.",
  },
  patch: {
    title: "Patch Bundle",
    description: "Temporarily boosts keyboard damage so normal enemies and armored targets go down faster.",
  },
  ha: {
    title: "HA Restart",
    description: "Restores one life, giving the run a little breathing room after a rough level.",
  },
};

const keys = new Set();
const assets = {};
const assetOpaqueBounds = {};

const playerConfigs = {
  paul: {
    label: "Paul",
    sprite: "assets/player-paul.png",
    speed: 430,
    jump: 920,
    lives: 5,
    maxAirJumps: 1,
    keyboardDamage: 2,
    keyboardSpeed: 860,
    keyboardCooldown: 0.4,
    keyboardSize: { w: 46, h: 24 },
    keyboardLift: -90,
    invincibleDuration: 1.8,
    baseAirControlMultiplier: 1,
    basePierce: 1,
    armorPierce: 1,
    hitSnareDuration: 0.45,
    bossFreezeDuration: 0.18,
    width: 58,
    height: 78,
    hitbox: { left: 14, right: 14, top: 8, bottom: 2 },
  },
  gertjan: {
    label: "Gert-Jan",
    sprite: "assets/player-gertjan.png",
    speed: 500,
    jump: 880,
    lives: 3,
    maxAirJumps: 1,
    keyboardDamage: 1,
    keyboardSpeed: 1020,
    keyboardCooldown: 0.18,
    keyboardSize: { w: 32, h: 16 },
    keyboardLift: -150,
    invincibleDuration: 1.0,
    baseAirControlMultiplier: 1.08,
    basePierce: 0,
    armorPierce: 0,
    hitSnareDuration: 0,
    bossFreezeDuration: 0,
    width: 58,
    height: 78,
    hitbox: { left: 14, right: 14, top: 8, bottom: 2 },
  },
};

const staticSprites = {
  rack: "assets/server-rack.png",
  switch: "assets/network-switch.png",
  database: "assets/database-node.png",
  esxi: "assets/esxi-host.png",
  officeDesk: "assets/platform-office-desk.png",
  upsRack: "assets/platform-ups-battery-rack.png",
  cableTray: "assets/platform-cable-tray.png",
  crashCart: "assets/platform-crash-cart.png",
  patchWall: "assets/platform-patch-wall.png",
  cloudAppliance: "assets/platform-cloud-appliance.png",
  terminal: "assets/terminal-console.png",
  antenna: "assets/wifi-antenna.png",
  patchpanel: "assets/patch-panel.png",
  winserver: "assets/windows-server.png",
  firewall: "assets/firewall.png",
  user: "assets/difficult-user.png",
  jumperUser: "assets/asap-user.png",
  armoredUser: "assets/armored-user.png",
  armoredHeavyUser: "assets/armored-user-heavy.png",
  emailUser: "assets/email-shooting-user.png",
  vipUser: "assets/vip-user.png",
  auditorUser: "assets/auditor-user.png",
  spamCallerUser: "assets/spam-caller-user.png",
  changeManagerUser: "assets/change-manager-user.png",
  ransomwarePopupUser: "assets/ransomware-popup-user.png",
  escalationUserSprite: "assets/escalation-user.png",
  ticketSpammerUser: "assets/ticket-spammer-user.png",
  bossMemoProjectile: "assets/boss-projectile-memo.png",
  bossAlertProjectile: "assets/boss-projectile-alert.png",
  bossFolderProjectile: "assets/boss-projectile-folder.png",
  bossBubbleProjectile: "assets/boss-projectile-bubble.png",
  bossSyncProjectile: "assets/boss-projectile-sync.png",
  dataLeakHazard: "assets/data-leak.png",
  staticHazard: "assets/static-electricity.png",
  rebootHazard: "assets/patch-reboot.png",
  cableMessHazard: "assets/cable-mess.png",
  ventHazard: "assets/overheating-vent.png",
  backupWindowHazard: "assets/backup-window.png",
  ticket: "assets/ticket-server.png",
  keyboard: "assets/keyboard.png",
  cloud: "assets/cloud-exit.png",
  boss_peter: "assets/boss-peter.png",
  boss_richard_r: "assets/boss-richard-r.png",
  boss_richard_a: "assets/boss-richard-a.png",
  boss_chris: "assets/boss-chris.png",
  boss_denise: "assets/boss-denise.png",
  boss_sander: "assets/boss-sander.png",
  boss_walter: "assets/boss-walter.png",
  boss_salah: "assets/boss-salah.png",
  boss_patrick: "assets/boss-patrick.png",
  bgDatacenter: "assets/bg-datacenter-1.png",
  bgOffice: "assets/bg-office-1.png",
  bgServer: "assets/bg-server-1.png",
  bgDr: "assets/bg-dr-1.png",
  snapshotPickup: "assets/snapshot-pickup.png",
  vmotionPickup: "assets/vmotion-pickup.png",
  patchPickup: "assets/patch-pickup.png",
  haPickup: "assets/ha-pickup.png",
};
const BACKGROUND_VARIANT_MAP = {
  bgDatacenter: { prefix: "bg-datacenter-", basePath: "assets/" },
  bgOffice: { prefix: "bg-office-", basePath: "assets/" },
  bgServer: { prefix: "bg-server-", basePath: "assets/" },
  bgDr: { prefix: "bg-dr-", basePath: "assets/" },
};
const SPRITE_VARIANT_MAP = {
  rack: { prefix: "server-rack-", basePath: "assets/" },
  switch: { prefix: "network-switch-", basePath: "assets/" },
  database: { prefix: "database-node-", basePath: "assets/" },
  esxi: { prefix: "esxi-host-", basePath: "assets/" },
  officeDesk: { prefix: "platform-office-desk-", basePath: "assets/" },
  upsRack: { prefix: "platform-ups-battery-rack-", basePath: "assets/" },
  cableTray: { prefix: "platform-cable-tray-", basePath: "assets/" },
  crashCart: { prefix: "platform-crash-cart-", basePath: "assets/" },
  patchWall: { prefix: "platform-patch-wall-", basePath: "assets/" },
  cloudAppliance: { prefix: "platform-cloud-appliance-", basePath: "assets/" },
  terminal: { prefix: "terminal-console-", basePath: "assets/" },
  antenna: { prefix: "wifi-antenna-", basePath: "assets/" },
  patchpanel: { prefix: "patch-panel-", basePath: "assets/" },
  winserver: { prefix: "windows-server-", basePath: "assets/" },
  firewall: { prefix: "firewall-", basePath: "assets/" },
  user: { prefix: "difficult-user-", basePath: "assets/" },
  jumperUser: { prefix: "asap-user-", basePath: "assets/" },
  armoredUser: { prefix: "armored-user-", basePath: "assets/" },
  armoredHeavyUser: { prefix: "armored-user-heavy-", basePath: "assets/" },
  emailUser: { prefix: "email-shooting-user-", basePath: "assets/" },
  vipUser: { prefix: "vip-user-", basePath: "assets/" },
  auditorUser: { prefix: "auditor-user-", basePath: "assets/" },
  spamCallerUser: { prefix: "spam-caller-user-", basePath: "assets/" },
  changeManagerUser: { prefix: "change-manager-user-", basePath: "assets/" },
  ransomwarePopupUser: { prefix: "ransomware-popup-user-", basePath: "assets/" },
  escalationUserSprite: { prefix: "escalation-user-", basePath: "assets/" },
  ticketSpammerUser: { prefix: "ticket-spammer-user-", basePath: "assets/" },
  bossMemoProjectile: { prefix: "boss-projectile-memo-", basePath: "assets/" },
  bossAlertProjectile: { prefix: "boss-projectile-alert-", basePath: "assets/" },
  bossFolderProjectile: { prefix: "boss-projectile-folder-", basePath: "assets/" },
  bossBubbleProjectile: { prefix: "boss-projectile-bubble-", basePath: "assets/" },
  bossSyncProjectile: { prefix: "boss-projectile-sync-", basePath: "assets/" },
  dataLeakHazard: { prefix: "data-leak-", basePath: "assets/" },
  staticHazard: { prefix: "static-electricity-", basePath: "assets/" },
  rebootHazard: { prefix: "patch-reboot-", basePath: "assets/" },
  cableMessHazard: { prefix: "cable-mess-", basePath: "assets/" },
  ventHazard: { prefix: "overheating-vent-", basePath: "assets/" },
  backupWindowHazard: { prefix: "backup-window-", basePath: "assets/" },
  ticket: { prefix: "ticket-server-", basePath: "assets/" },
  keyboard: { prefix: "keyboard-", basePath: "assets/" },
  snapshotPickup: { prefix: "snapshot-pickup-", basePath: "assets/" },
  vmotionPickup: { prefix: "vmotion-pickup-", basePath: "assets/" },
  patchPickup: { prefix: "patch-pickup-", basePath: "assets/" },
  haPickup: { prefix: "ha-pickup-", basePath: "assets/" },
};
const OPTIONAL_SPRITE_KEYS = new Set([
  "snapshotPickup",
  "vmotionPickup",
  "patchPickup",
  "haPickup",
  "vipUser",
  "auditorUser",
  "spamCallerUser",
  "changeManagerUser",
  "ransomwarePopupUser",
  "escalationUserSprite",
  "ticketSpammerUser",
  "bossMemoProjectile",
  "bossAlertProjectile",
  "bossFolderProjectile",
  "bossBubbleProjectile",
  "bossSyncProjectile",
  "dataLeakHazard",
  "staticHazard",
  "rebootHazard",
  "cableMessHazard",
  "ventHazard",
  "backupWindowHazard",
]);
registerOptionalBackgroundVariants();
registerOptionalSpriteVariants();

const upgradeConfig = {
  speed: { step: 28, max: 10 },
  jump: { step: 38, max: 8 },
  fireRate: { multiplier: 0.9, max: 10 },
  damage: { step: 1, max: 6 },
  shield: { step: 0.18, max: 8 },
};

const UPGRADE_RARITY_WEIGHT = {
  common: 7,
  uncommon: 3,
  rare: 1,
};

function createRunUpgrades() {
  return {
    speed: 0,
    jump: 0,
    fireRate: 0,
    damage: 0,
    shield: 0,
    life: 0,
    heavyKeyboards: 0,
    sprintBoots: 0,
    tripleJump: 0,
    hypervisorGuard: 0,
    ticketVacuum: 0,
    bounceKeys: 0,
    emergencySnapshot: 0,
    piercingKeys: 0,
    fragmentingKeyboard: 0,
    overclockedThrow: 0,
    critIncident: 0,
    lowLatencyInput: 0,
    highJumpProfile: 0,
    momentumCache: 0,
    quickRecovery: 0,
    efficientPatchCycle: 0,
    snapshotCache: 0,
    snapshotRollback: 0,
    bonusRecovery: 0,
    fieldKit: 0,
    cableManagement: 0,
    leakSkates: 0,
    ventRider: 0,
    shockInsulation: 0,
    hazardRouting: 0,
    beamTiming: 0,
    managerialImmunity: 0,
    escalationShield: 0,
    changeFreeze: 0,
    pressureResponse: 0,
    goldenImage: 0,
    drPlan: 0,
    chainResolution: 0,
    datastoreEcho: 0,
    vMotionReflex: 0,
    autoAim: 0,
    replyAll: 0,
    maintenanceWindow: 0,
    outOfOffice: 0,
    changeAdvisoryBoard: 0,
  };
}

function createTraitState() {
  return {
    drPlanUsed: false,
    emergencySnapshotUsed: false,
    escalationShieldUsed: false,
    snapshotRollbacksUsed: 0,
    bonusRecoveryTickets: 0,
    pressureResponseTriggered: false,
    chainKills: 0,
    chainTimer: 0,
  };
}

let selectedPlayerKey = "paul";
let gameState = "select";
let currentLevel = 1;
let currentLevelConfig = {
  ticketTarget: BASE_TICKETS,
  segments: BASE_LEVEL_SEGMENTS,
  maxGapWidth: BASE_GAP_WIDTH,
  maxStepUp: BASE_STEP_UP,
  maxStepDown: BASE_STEP_DOWN,
  hazardChance: 0.5,
  enemyChance: 0.65,
  minUserSpeed: 90,
  maxUserSpeed: 170,
  isBossLevel: false,
  bossName: MANAGER_BOSSES[0],
  bossHp: 12,
  bossSpeedScale: 1,
  bossAttackScale: 1,
  slaEscalationRate: 0,
  enemyShootCooldownMultiplier: 1,
  theme: {
    skyTop: "#07111f",
    skyMid: "#09152a",
    skyBottom: "#04060d",
    glow: "#74f7c4",
    haze: "rgba(116, 247, 196, 0.16)",
    skylineA: "#0b1d33",
    skylineB: "#0d2642",
  },
};
let cameraX = 0;
let lastTime = performance.now();
let finishGate = { x: 3635, y: 490, w: 120, h: 150, hitbox: { left: 24, right: 24, top: 24, bottom: 12 } };
let levelStartSpawn = { x: 90, y: 300 };

let player = null;
let platforms = [];
let firewallZones = [];
let specialHazards = [];
let tickets = [];
let pickups = [];
let users = [];
let keyboards = [];
let decorations = [];
let boss = null;
let bossProjectiles = [];
let bossMechanics = [];
let userProjectiles = [];
let userDenialZones = [];
let impactParticles = [];
let screenShakeTimer = 0;
let screenShakeStrength = 0;
let spriteVariantState = {};
let godModeEnabled = false;
let jumpQueued = false;
let runScore = 0;
let bestRunScore = loadStoredInt(BEST_SCORE_KEY, 0);
let bestLevel = loadStoredInt(BEST_LEVEL_KEY, 1);
let runStats = createRunStats();
let runUpgrades = createRunUpgrades();
let traitState = createTraitState();
let currentUpgradeChoices = [];
let slaEscalation = 0;
let slaPriorityTier = 0;
let slaStabilizedTimer = 0;
let slaHudTimer = 0;
let slaNoRestoreTimer = 0;
let slaDispatchTimer = 0;
let debugShowHitboxes = false;
let debugShowPlatformTops = false;
let debugBotEnabled = false;
let debugAutoAimEnabled = false;
let debugBotState = {
  direction: 1,
  jumpCooldown: 0,
  throwCooldown: 0,
  stuckTimer: 0,
  lastX: 0,
};
let pendingLevelRestart = null;
let nextHazardId = 1;
let assetsReady = false;
let pendingCampaignStart = false;

function createRunStats() {
  return {
    bossesDefeated: 0,
    vmsRestored: 0,
    enemiesKilled: 0,
    keyboardsThrown: 0,
    pickupsCollected: 0,
    upgradesDeployed: 0,
    livesBurned: 0,
    shieldPops: 0,
  };
}

function getUpgradeCount(id) {
  return runUpgrades[id] || 0;
}

function hasUpgrade(id) {
  return getUpgradeCount(id) > 0 || (id === "autoAim" && debugAutoAimEnabled);
}

function getTempoStacks() {
  return hasUpgrade("chainResolution") && traitState.chainTimer > 0
    ? Math.min(traitState.chainKills, 5)
    : 0;
}

function getCurrentMaxLives() {
  return playerConfigs[selectedPlayerKey].lives + 2 + getUpgradeCount("life");
}

function getBuildTraitNames(limit = 4) {
  return UPGRADE_POOL
    .filter((entry) => !entry.stat && getUpgradeCount(entry.id) > 0)
    .slice(0, limit)
    .map((entry) => entry.name);
}

function getPickedUpgradeEntries() {
  return UPGRADE_POOL
    .map((entry) => ({ ...entry, count: getUpgradeCount(entry.id) }))
    .filter((entry) => entry.count > 0);
}

function getBuildStatsText(options = {}) {
  const stats = getPlayerStats();
  const pierce = (stats.basePierce || 0) + getUpgradeCount("piercingKeys");
  const bounces = (stats.baseBounces || 0) + getUpgradeCount("bounceKeys");
  const returns = getUpgradeCount("datastoreEcho");
  const parts = [
    `SPD ${Math.round(stats.speed)}`,
    `JMP ${Math.round(stats.jump)}`,
    `DMG ${stats.keyboardDamage}`,
    `CD ${stats.keyboardCooldown.toFixed(2)}s`,
    `AIR ${stats.maxAirJumps}`,
    `PRC ${pierce}`,
  ];

  if (!options.compact) {
    parts.push(`GRACE ${stats.invincibleDuration.toFixed(1)}s`);
  }
  if (bounces > 0) {
    parts.push(`BNC ${bounces}`);
  }
  if (returns > 0) {
    parts.push(`RET ${returns}`);
  }
  if (getUpgradeCount("ticketVacuum") > 0) {
    parts.push(`VAC ${getTicketVacuumRange()}px`);
  }
  if (getUpgradeCount("snapshotRollback") > 0) {
    parts.push(`ROLL ${getUpgradeCount("snapshotRollback")}`);
  }

  return parts.join(" | ");
}

function buildUpgradePillHTML(entry) {
  return `
    <span class="build-upgrade-pill" data-rarity="${entry.rarity}">
      <strong>${entry.name}</strong>
      <span>x${entry.count}</span>
    </span>
  `;
}

const UPGRADE_POOL = [
  {
    id: "speed",
    name: "CPU Boost",
    rarity: "common",
    description: "Run faster across hosts and close distance sooner.",
    maxStacks: upgradeConfig.speed.max,
    preview: () => {
      const stats = getPlayerStats();
      return getUpgradeCount("speed") >= upgradeConfig.speed.max
        ? "Move speed MAX"
        : `${Math.round(stats.speed)} -> ${Math.round(stats.speed + upgradeConfig.speed.step)}`;
    },
    apply: () => { runUpgrades.speed += 1; },
  },
  {
    id: "jump",
    name: "DRS Jump",
    rarity: "common",
    description: "Increase jump power for cleaner platform recovery.",
    maxStacks: upgradeConfig.jump.max,
    preview: () => {
      const stats = getPlayerStats();
      return getUpgradeCount("jump") >= upgradeConfig.jump.max
        ? "Jump height MAX"
        : `${Math.round(stats.jump)} -> ${Math.round(stats.jump + upgradeConfig.jump.step)}`;
    },
    apply: () => { runUpgrades.jump += 1; },
  },
  {
    id: "fireRate",
    name: "IOPS Burst",
    rarity: "common",
    description: "Reduce keyboard cooldown for faster throws.",
    maxStacks: upgradeConfig.fireRate.max,
    preview: () => {
      const stats = getPlayerStats();
      return getUpgradeCount("fireRate") >= upgradeConfig.fireRate.max
        ? "Attack speed MAX"
        : `${stats.keyboardCooldown.toFixed(2)}s -> ${(Math.max(0.08, stats.keyboardCooldown * upgradeConfig.fireRate.multiplier)).toFixed(2)}s`;
    },
    apply: () => { runUpgrades.fireRate += 1; },
  },
  {
    id: "damage",
    name: "Patch Bundle",
    rarity: "common",
    description: "Make each keyboard hit harder.",
    maxStacks: upgradeConfig.damage.max,
    preview: () => {
      const stats = getPlayerStats();
      return getUpgradeCount("damage") >= upgradeConfig.damage.max
        ? "Damage MAX"
        : `${stats.keyboardDamage} -> ${stats.keyboardDamage + upgradeConfig.damage.step}`;
    },
    apply: () => { runUpgrades.damage += 1; },
  },
  {
    id: "shield",
    name: "HA Buffer",
    rarity: "common",
    description: "Gain a longer grace period after taking a hit.",
    maxStacks: upgradeConfig.shield.max,
    preview: () => {
      const stats = getPlayerStats();
      return getUpgradeCount("shield") >= upgradeConfig.shield.max
        ? "Invulnerability MAX"
        : `${stats.invincibleDuration.toFixed(1)}s -> ${(stats.invincibleDuration + upgradeConfig.shield.step).toFixed(1)}s`;
    },
    apply: () => { runUpgrades.shield += 1; },
  },
  {
    id: "life",
    name: "Extra Snapshot",
    rarity: "uncommon",
    description: "Add one immediate life and raise your life cap.",
    maxStacks: 8,
    preview: () => "+1 life now and for future levels",
    apply: () => {
      runUpgrades.life += 1;
      player.lives += 1;
    },
  },
  {
    id: "heavyKeyboards",
    name: "Heavy Keyboards",
    rarity: "common",
    description: "Gain +2 damage, but each keyboard flies slower.",
    maxStacks: 4,
    preview: () => `+2 damage, -${110 * (getUpgradeCount("heavyKeyboards") + 1)} throw speed`,
    apply: () => { runUpgrades.heavyKeyboards += 1; },
  },
  {
    id: "sprintBoots",
    name: "Sprint Boots",
    rarity: "common",
    description: "Gain extra move speed, but air control gets a bit looser.",
    maxStacks: 4,
    preview: () => `+${22 * (getUpgradeCount("sprintBoots") + 1)} total speed`,
    apply: () => { runUpgrades.sprintBoots += 1; },
  },
  {
    id: "tripleJump",
    name: "Triple Jump",
    rarity: "uncommon",
    description: "Gain one extra air jump for safer recoveries and greedier routes.",
    maxStacks: 2,
    preview: () => `Air jumps ${1 + getUpgradeCount("tripleJump")} -> ${2 + getUpgradeCount("tripleJump")}`,
    apply: () => { runUpgrades.tripleJump += 1; },
  },
  {
    id: "hypervisorGuard",
    name: "Hypervisor Guard",
    rarity: "common",
    description: "Extend invulnerability after taking damage.",
    maxStacks: 4,
    preview: () => `+${(0.35 * (getUpgradeCount("hypervisorGuard") + 1)).toFixed(2)}s total damage grace`,
    apply: () => { runUpgrades.hypervisorGuard += 1; },
  },
  {
    id: "ticketVacuum",
    name: "Ticket Vacuum",
    rarity: "common",
    description: "Nearby VMs and pickups lock on, then keep drifting into your build.",
    maxStacks: 4,
    preview: () => `Pickup radius ${150 + (getUpgradeCount("ticketVacuum") + 1) * 90}px`,
    apply: () => { runUpgrades.ticketVacuum += 1; },
  },
  {
    id: "efficientPatchCycle",
    name: "Efficient Patch Cycle",
    rarity: "common",
    description: "Temporary pickup effects last longer.",
    maxStacks: 4,
    preview: () => `+${Math.round((Math.pow(1.3, getUpgradeCount("efficientPatchCycle") + 1) - 1) * 100)}% pickup duration`,
    apply: () => { runUpgrades.efficientPatchCycle += 1; },
  },
  {
    id: "fieldKit",
    name: "Field Kit",
    rarity: "common",
    description: "Procedural levels spawn more mid-run pickups.",
    maxStacks: 4,
    preview: () => `+${Math.round((getUpgradeCount("fieldKit") + 1) * 6)}% pickup chance`,
    apply: () => { runUpgrades.fieldKit += 1; },
  },
  {
    id: "cableManagement",
    name: "Cable Management",
    rarity: "common",
    description: "Cable mess hazards barely slow you down anymore.",
    maxStacks: 3,
    preview: () => `${Math.max(0.04, 0.24 - (getUpgradeCount("cableManagement") + 1) * 0.06).toFixed(2)}s cable penalty`,
    apply: () => { runUpgrades.cableManagement += 1; },
  },
  {
    id: "leakSkates",
    name: "Leak Skates",
    rarity: "common",
    description: "Data leaks become a speed lane instead of a slippery penalty.",
    maxStacks: 3,
    preview: () => `Data leak boost ${(0.5 + getUpgradeCount("leakSkates") * 0.25).toFixed(2)}s`,
    apply: () => { runUpgrades.leakSkates += 1; },
  },
  {
    id: "ventRider",
    name: "Vent Rider",
    rarity: "common",
    description: "Overheating vents launch you higher and more safely.",
    maxStacks: 3,
    preview: () => `Vent boost +${200 * (getUpgradeCount("ventRider") + 1)}`,
    apply: () => { runUpgrades.ventRider += 1; },
  },
  {
    id: "outOfOffice",
    name: "Out of Office",
    rarity: "uncommon",
    description: "Ranged users shoot less often across the whole run.",
    maxStacks: 3,
    preview: () => `${Math.round((1 - Math.pow(1.22, -(getUpgradeCount("outOfOffice") + 1))) * 100)}% slower ranged attacks`,
    apply: () => { runUpgrades.outOfOffice += 1; },
  },
  {
    id: "bounceKeys",
    name: "Bounce Keys",
    rarity: "uncommon",
    description: "Thrown keyboards ricochet extra times off the environment.",
    maxStacks: 3,
    preview: () => `${getUpgradeCount("bounceKeys") + 1} keyboard bounce${getUpgradeCount("bounceKeys") === 0 ? "" : "s"}`,
    apply: () => { runUpgrades.bounceKeys += 1; },
  },
  {
    id: "emergencySnapshot",
    name: "Emergency Snapshot",
    rarity: "rare",
    description: "Survive one lethal hit per level with 1 life remaining.",
    maxStacks: 1,
    preview: () => "One lethal hit each level becomes a rollback",
    apply: () => { runUpgrades.emergencySnapshot += 1; },
  },
  {
    id: "piercingKeys",
    name: "Piercing Keys",
    rarity: "uncommon",
    description: "Keyboards pass through one additional normal enemy.",
    maxStacks: 4,
    preview: () => `Pierce ${getUpgradeCount("piercingKeys") + 1} extra target${getUpgradeCount("piercingKeys") >= 1 ? "s" : ""}`,
    apply: () => { runUpgrades.piercingKeys += 1; },
  },
  {
    id: "fragmentingKeyboard",
    name: "Fragmenting Keyboard",
    rarity: "uncommon",
    description: "A hit splinters into more smaller shards.",
    maxStacks: 3,
    preview: () => `Spawn ${(getUpgradeCount("fragmentingKeyboard") + 1) * 2} mini-keyboard shards`,
    apply: () => { runUpgrades.fragmentingKeyboard += 1; },
  },
  {
    id: "overclockedThrow",
    name: "Overclocked Throw",
    rarity: "uncommon",
    description: "Keyboards fly faster, but the throw cycle takes slightly longer.",
    maxStacks: 4,
    preview: () => `+${220 * (getUpgradeCount("overclockedThrow") + 1)} total throw speed, longer cooldown`,
    apply: () => { runUpgrades.overclockedThrow += 1; },
  },
  {
    id: "critIncident",
    name: "Crit Incident",
    rarity: "uncommon",
    description: "A few keyboards turn into high-damage incident spikes.",
    maxStacks: 4,
    preview: () => `${Math.round((getUpgradeCount("critIncident") + 1) * 10)}% crit chance`,
    apply: () => { runUpgrades.critIncident += 1; },
  },
  {
    id: "lowLatencyInput",
    name: "Low-Latency Input",
    rarity: "uncommon",
    description: "Gain snappier air control at the cost of a little top speed.",
    maxStacks: 3,
    preview: () => `+${Math.round((getUpgradeCount("lowLatencyInput") + 1) * 18)}% air control, -${(getUpgradeCount("lowLatencyInput") + 1) * 8} speed`,
    apply: () => { runUpgrades.lowLatencyInput += 1; },
  },
  {
    id: "autoAim",
    name: "Smart Assist",
    rarity: "uncommon",
    description: "Neutral throws subtly angle toward the nearest target ahead. Up and down throws stay manual.",
    maxStacks: 1,
    preview: () => "Forward throws gain target assist",
    apply: () => { runUpgrades.autoAim += 1; },
  },
  {
    id: "highJumpProfile",
    name: "High Jump Profile",
    rarity: "uncommon",
    description: "Jump higher, but sacrifice a bit of movement speed.",
    maxStacks: 3,
    preview: () => `+${52 * (getUpgradeCount("highJumpProfile") + 1)} total jump, -${14 * (getUpgradeCount("highJumpProfile") + 1)} speed`,
    apply: () => { runUpgrades.highJumpProfile += 1; },
  },
  {
    id: "momentumCache",
    name: "Momentum Cache",
    rarity: "uncommon",
    description: "Carry speed better through the air and resist slippery hazard drag.",
    maxStacks: 3,
    preview: () => `+${Math.round((getUpgradeCount("momentumCache") + 1) * 8)}% air carry, better hazard resistance`,
    apply: () => { runUpgrades.momentumCache += 1; },
  },
  {
    id: "quickRecovery",
    name: "Quick Recovery",
    rarity: "uncommon",
    description: "After taking a hit, you surge back into motion faster.",
    maxStacks: 3,
    preview: () => `${(2.0 + (getUpgradeCount("quickRecovery") + 1) * 0.5).toFixed(1)}s recovery burst`,
    apply: () => { runUpgrades.quickRecovery += 1; },
  },
  {
    id: "snapshotCache",
    name: "Snapshot Cache",
    rarity: "uncommon",
    description: "Runs skew toward defensive pickups like Snapshot and HA.",
    maxStacks: 3,
    preview: () => `Defensive pickup weight x${1 + (getUpgradeCount("snapshotCache") + 1) * 2}`,
    apply: () => { runUpgrades.snapshotCache += 1; },
  },
  {
    id: "snapshotRollback",
    name: "Snapshot Rollback",
    rarity: "uncommon",
    description: "Falls spend a life and rematerialize you on the last safe platform instead of rewinding the whole level.",
    maxStacks: 2,
    preview: () => `${getUpgradeCount("snapshotRollback") + 1} fall rollback${getUpgradeCount("snapshotRollback") === 0 ? "" : "s"} per level`,
    apply: () => { runUpgrades.snapshotRollback += 1; },
  },
  {
    id: "bonusRecovery",
    name: "Bonus Recovery",
    rarity: "rare",
    description: "Every few restored VMs grants a Snapshot shield.",
    maxStacks: 3,
    preview: () => `Shield every ${Math.max(2, 5 - (getUpgradeCount("bonusRecovery") + 1))} VMs`,
    apply: () => { runUpgrades.bonusRecovery += 1; },
  },
  {
    id: "shockInsulation",
    name: "Shock Insulation",
    rarity: "uncommon",
    description: "Static and reboot hazards hit much less harshly.",
    maxStacks: 3,
    preview: () => `${getUpgradeCount("shockInsulation") + 1} hazard insulation stack${getUpgradeCount("shockInsulation") === 0 ? "" : "s"}`,
    apply: () => { runUpgrades.shockInsulation += 1; },
  },
  {
    id: "hazardRouting",
    name: "Hazard Routing",
    rarity: "uncommon",
    description: "Backup windows and moving hazards shove you less aggressively.",
    maxStacks: 3,
    preview: () => `${Math.round((1 - Math.pow(0.72, getUpgradeCount("hazardRouting") + 1)) * 100)}% less moving hazard push`,
    apply: () => { runUpgrades.hazardRouting += 1; },
  },
  {
    id: "beamTiming",
    name: "Beam Timing",
    rarity: "uncommon",
    description: "Boss warning mechanics telegraph a little longer.",
    maxStacks: 3,
    preview: () => `${Math.round((1 + (getUpgradeCount("beamTiming") + 1) * 0.22) * 100)}% boss warning time`,
    apply: () => { runUpgrades.beamTiming += 1; },
  },
  {
    id: "managerialImmunity",
    name: "Managerial Immunity",
    rarity: "uncommon",
    description: "Boss hits get a small grace buffer between life losses.",
    maxStacks: 3,
    preview: () => `+${((getUpgradeCount("managerialImmunity") + 1) * 0.45).toFixed(2)}s boss grace`,
    apply: () => { runUpgrades.managerialImmunity += 1; },
  },
  {
    id: "escalationShield",
    name: "Escalation Shield",
    rarity: "uncommon",
    description: "The first boss projectile hit each boss fight is ignored.",
    maxStacks: 1,
    preview: () => "Negate the first boss projectile per fight",
    apply: () => { runUpgrades.escalationShield += 1; },
  },
  {
    id: "changeFreeze",
    name: "Change Freeze",
    rarity: "rare",
    description: "Bosses briefly slow down on impact, with a short refresh cooldown.",
    maxStacks: 3,
    preview: () => `${(0.45 + getUpgradeCount("changeFreeze") * 0.14).toFixed(2)}s boss impact freeze`,
    apply: () => { runUpgrades.changeFreeze += 1; },
  },
  {
    id: "pressureResponse",
    name: "Pressure Response",
    rarity: "uncommon",
    description: "When a boss drops below half HP, gain a temporary speed surge.",
    maxStacks: 3,
    preview: () => `${6 + getUpgradeCount("pressureResponse") * 2}s boss tempo burst`,
    apply: () => { runUpgrades.pressureResponse += 1; },
  },
  {
    id: "goldenImage",
    name: "Golden Image",
    rarity: "rare",
    description: "Start every level with a free Snapshot shield.",
    maxStacks: 2,
    preview: () => `Begin each level with Shield x${getUpgradeCount("goldenImage") + 1}`,
    apply: () => { runUpgrades.goldenImage += 1; },
  },
  {
    id: "drPlan",
    name: "DR Plan",
    rarity: "rare",
    description: "The first death in a run no longer consumes a life.",
    maxStacks: 1,
    preview: () => "One free disaster-recovery rollback this run",
    apply: () => { runUpgrades.drPlan += 1; },
  },
  {
    id: "chainResolution",
    name: "Chain Resolution",
    rarity: "rare",
    description: "Consecutive enemy kills build a temporary tempo bonus.",
    maxStacks: 1,
    preview: () => "Kill streaks boost speed and throw cadence",
    apply: () => { runUpgrades.chainResolution += 1; },
  },
  {
    id: "datastoreEcho",
    name: "Datastore Echo",
    rarity: "rare",
    description: "Missed keyboards can loop back like a boomerang.",
    maxStacks: 2,
    preview: () => `${getUpgradeCount("datastoreEcho") + 1} miss return${getUpgradeCount("datastoreEcho") === 0 ? "" : "s"}`,
    apply: () => { runUpgrades.datastoreEcho += 1; },
  },
  {
    id: "vMotionReflex",
    name: "vMotion Reflex",
    rarity: "rare",
    description: "Taking damage triggers a short speed burst and extra phasing.",
    maxStacks: 3,
    preview: () => `${(3.0 + (getUpgradeCount("vMotionReflex") + 1) * 0.6).toFixed(1)}s reflex burst`,
    apply: () => { runUpgrades.vMotionReflex += 1; },
  },
  {
    id: "replyAll",
    name: "Reply-All",
    rarity: "rare",
    description: "Every throw sends weaker side keyboards with it.",
    maxStacks: 2,
    preview: () => `${(getUpgradeCount("replyAll") + 1) * 2} side keyboards per throw`,
    apply: () => { runUpgrades.replyAll += 1; },
  },
  {
    id: "maintenanceWindow",
    name: "Maintenance Window",
    rarity: "uncommon",
    description: "Normal enemies start each level slowed and out of sync.",
    maxStacks: 3,
    preview: () => `${(2.0 + (getUpgradeCount("maintenanceWindow") + 1) * 0.6).toFixed(1)}s enemy startup slow`,
    apply: () => { runUpgrades.maintenanceWindow += 1; },
  },
  {
    id: "changeAdvisoryBoard",
    name: "Change Advisory Board",
    rarity: "rare",
    description: "Bosses move and fire slower, but they take longer to delete.",
    maxStacks: 2,
    preview: () => `${getUpgradeCount("changeAdvisoryBoard") + 1} CAB safety stack${getUpgradeCount("changeAdvisoryBoard") === 0 ? "" : "s"}`,
    apply: () => { runUpgrades.changeAdvisoryBoard += 1; },
  },
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function loadStoredInt(key, fallback) {
  const value = Number.parseInt(localStorage.getItem(key) || "", 10);
  return Number.isInteger(value) ? value : fallback;
}

function resetBestRun() {
  const confirmed = window.confirm("Reset the saved Best Run and highest level?");
  if (!confirmed) {
    return;
  }
  bestRunScore = 0;
  bestLevel = 1;
  localStorage.removeItem(BEST_SCORE_KEY);
  localStorage.removeItem(BEST_LEVEL_KEY);
  hudBestRun.textContent = `${bestRunScore} / L${bestLevel}`;
  if (player) {
    syncHud();
  }
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function addScreenShake(strength = 8, duration = 0.14) {
  screenShakeStrength = Math.max(screenShakeStrength, strength);
  screenShakeTimer = Math.max(screenShakeTimer, duration);
}

function spawnImpactParticles(x, y, color, count = 6, options = {}) {
  const {
    speedMin = 90,
    speedMax = 260,
    lifeMin = 0.16,
    lifeMax = 0.34,
    sizeMin = 3,
    sizeMax = 7,
    gravity = 720,
  } = options;

  for (let i = 0; i < count; i += 1) {
    const angle = randomBetween(-Math.PI * 0.9, Math.PI * 0.2);
    const speed = randomBetween(speedMin, speedMax);
    const life = randomBetween(lifeMin, lifeMax);
    impactParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: randomBetween(sizeMin, sizeMax),
      color,
      gravity,
    });
  }
}

function spawnSystemParticles(x, y, color = "#74f7c4", count = 12, options = {}) {
  spawnImpactParticles(x, y, color, count, {
    speedMin: 70,
    speedMax: 220,
    lifeMin: 0.22,
    lifeMax: 0.48,
    sizeMin: 3,
    sizeMax: 6,
    gravity: 420,
    ...options,
  });
}

function pickOne(items) {
  return items[randomInt(0, items.length - 1)];
}

function moveTowards(current, target, maxDelta) {
  if (current < target) {
    return Math.min(current + maxDelta, target);
  }
  if (current > target) {
    return Math.max(current - maxDelta, target);
  }
  return target;
}

function getThemeTuning(theme = currentLevelConfig?.theme) {
  return {
    ...THEME_DEFAULT_TUNING,
    ...(theme?.themeTuning || {}),
    enemyWeights: { ...THEME_DEFAULT_TUNING.enemyWeights, ...(theme?.themeTuning?.enemyWeights || {}) },
    hazardWeights: { ...THEME_DEFAULT_TUNING.hazardWeights, ...(theme?.themeTuning?.hazardWeights || {}) },
    platformWeights: { ...THEME_DEFAULT_TUNING.platformWeights, ...(theme?.themeTuning?.platformWeights || {}) },
  };
}

function getThemeWeightedEnemySpawnWeight(variant, tuning = getThemeTuning()) {
  const baseWeight = variant.behavior?.spawnWeight ?? 1;
  return baseWeight * (tuning.enemyWeights[variant.kind] ?? 1);
}

function getThemeWeightedHazardSpawnWeight(kind, tuning = getThemeTuning()) {
  const baseWeight = kind === "firewall" ? 4 : SPECIAL_HAZARD_TYPES[kind]?.spawnWeight ?? 1;
  return baseWeight * (tuning.hazardWeights[kind] ?? 1);
}

function getLateGameDirector(level = currentLevel, theme = currentLevelConfig?.theme) {
  const band = level < 12 ? 0 : level < 20 ? 1 : level < 30 ? 2 : level < 40 ? 3 : 4;
  return {
    enabled: band > 0,
    band,
    themeStyle: theme?.backgroundStyle || "datacenter",
    comboChance: band >= 4 ? 0.24 : band >= 3 ? 0.18 : band >= 2 ? 0.1 : 0,
    extraMinWidth: band >= 3 ? 350 : 380,
    supportWeightMultiplier: band >= 4 ? 1.35 : band >= 3 ? 1.24 : band >= 2 ? 1.12 : 1,
  };
}

function getLateGameThemeEnemyMultiplier(kind, director) {
  if (!director.enabled) return 1;
  const band = director.band;
  const table = {
    office: { emailer: 1 + band * 0.22, vip: 1 + band * 0.2, ticketSpammer: 1 + band * 0.22, auditor: 1 + band * 0.1, armoredElite: 0.86 },
    serverroom: { armored: 1 + band * 0.18, armoredElite: 1 + band * 0.22, auditor: 1 + band * 0.2, changeManager: 1 + band * 0.16, spamCaller: 0.9 },
    datacenter: { emailer: 1 + band * 0.1, ticketSpammer: 1 + band * 0.12, jumper: 1 + band * 0.1, escalationUser: 1 + band * 0.1 },
    drsite: { escalationUser: 1 + band * 0.28, spamCaller: 1 + band * 0.18, ticketSpammer: 1 + band * 0.18, vip: 1 + band * 0.1, walker: 0.82 },
  };
  return table[director.themeStyle]?.[kind] ?? 1;
}

function getLateGameThemeHazardMultiplier(kind, director) {
  if (!director.enabled) return 1;
  const band = director.band;
  const table = {
    office: { dataLeak: 1 + band * 0.12, static: 1 + band * 0.1, cableMess: 1 + band * 0.08, backupWindow: 0.9 },
    serverroom: { cableMess: 1 + band * 0.18, vent: 1 + band * 0.18, static: 1 + band * 0.12, diskFailure: 1 + band * 0.08 },
    datacenter: { static: 1 + band * 0.1, reboot: 1 + band * 0.1, cableMess: 1 + band * 0.08, firewall: 1 + band * 0.05 },
    drsite: { backupWindow: 1 + band * 0.28, diskFailure: 1 + band * 0.28, reboot: 1 + band * 0.14, dataLeak: 0.86, vent: 0.9 },
  };
  return table[director.themeStyle]?.[kind] ?? 1;
}

function getLateGameEnemyWeight(variant, platform, hazard, director, themeTuning) {
  let weight = getThemeWeightedEnemySpawnWeight(variant, themeTuning);
  if (!director.enabled) return weight;
  weight *= getLateGameThemeEnemyMultiplier(variant.kind, director);
  if (variantHasSupportBehavior(variant) && platform?.w >= 330) weight *= director.supportWeightMultiplier;
  if (director.band >= 2 && (hazard?.kind === "backupWindow" || hazard?.kind === "diskFailure") && ["escalationUser", "ticketSpammer", "spamCaller"].includes(variant.kind)) {
    weight *= 1.45 + director.band * 0.08;
  }
  if (director.band >= 3 && platform?.w >= 390 && ["auditor", "changeManager", "vip"].includes(variant.kind)) weight *= 1.16;
  return weight;
}

function getLateGameHazardWeight(kind, director, themeTuning) {
  let weight = getThemeWeightedHazardSpawnWeight(kind, themeTuning);
  if (!director.enabled) return weight;
  weight *= getLateGameThemeHazardMultiplier(kind, director);
  if (director.band >= 3 && ["backupWindow", "diskFailure", "reboot"].includes(kind)) weight *= 1.12;
  return weight;
}

function getLateGameComplementKinds(primaryKind, hazardKind, director) {
  if (hazardKind === "backupWindow" || hazardKind === "diskFailure") return ["escalationUser", "ticketSpammer"];
  if (primaryKind === "auditor" || primaryKind === "changeManager") return ["emailer", "ticketSpammer"];
  if (primaryKind === "escalationUser") return ["spamCaller", "jumper"];
  if (primaryKind === "spamCaller" || primaryKind === "jumper") return ["escalationUser"];
  if (primaryKind === "vip") return ["armored", "jumper", "emailer"];
  if (director.band >= 3 && ["armored", "jumper", "emailer"].includes(primaryKind)) return ["vip", "ticketSpammer"];
  return ["emailer", "ticketSpammer", "jumper", "spamCaller", "escalationUser"];
}

function pickLateGameExtraSpawnX(platform, variant, hazardZone) {
  const leftX = platform.x + 28;
  const rightX = platform.x + platform.w - variant.w - 28;
  if (!hazardZone) return Math.random() > 0.5 ? rightX : leftX;
  const rightProbe = { x: rightX, y: platform.y - variant.h, w: variant.w, h: variant.h, hitbox: variant.hitbox };
  return rectsOverlap(rightProbe, hazardZone) ? leftX : rightX;
}

function maybeSpawnLateGameEncounter(platform, primaryVariant, hazardZone, director, unlockedVariants, enemyScaling, themeTuning) {
  if (!director.enabled || !primaryVariant || director.comboChance <= 0 || platform.w < director.extraMinWidth) return false;
  if (hazardZone && platform.w < director.extraMinWidth + 50) return false;
  if (Math.random() > director.comboChance) return false;
  const complementKinds = getLateGameComplementKinds(primaryVariant.kind, hazardZone?.kind, director);
  const candidates = unlockedVariants.filter((variant) => complementKinds.includes(variant.kind) && variant.kind !== primaryVariant.kind && variantCanEscortSupport(variant));
  if (!candidates.length) return false;
  const extraVariant = pickWeighted(candidates, (variant) => getLateGameEnemyWeight(variant, platform, hazardZone, director, themeTuning));
  if (!extraVariant) return false;
  const spawnX = pickLateGameExtraSpawnX(platform, extraVariant, hazardZone);
  spawnUserFromVariant(platform, extraVariant, spawnX, enemyScaling, { dir: spawnX < platform.x + platform.w / 2 ? 1 : -1 });
  return true;
}

function getScalingDirector(level = currentLevel, theme = currentLevelConfig?.theme) {
  const band = level < 15 ? 0 : level < 25 ? 1 : level < 35 ? 2 : 3;
  const style = theme?.backgroundStyle || "datacenter";
  const themeScaling = {
    office: { gap: 0.9, stepUp: 0.86, stepDown: 0.9, hazard: 0.96, enemy: 1.04, width: 1.03, speed: 0.96 },
    serverroom: { gap: 0.96, stepUp: 1.02, stepDown: 0.98, hazard: 1.08, enemy: 1.02, width: 0.96, speed: 0.98 },
    datacenter: { gap: 1, stepUp: 1, stepDown: 1, hazard: 1, enemy: 1, width: 1, speed: 1 },
    drsite: { gap: 1.08, stepUp: 1.02, stepDown: 1.08, hazard: 1.06, enemy: 1.02, width: 0.98, speed: 0.98 },
  }[style] || { gap: 1, stepUp: 1, stepDown: 1, hazard: 1, enemy: 1, width: 1, speed: 1 };

  return {
    enabled: band > 0,
    band,
    themeStyle: style,
    gapMultiplier: themeScaling.gap * (band >= 3 ? 1.04 : band >= 2 ? 1.02 : 1),
    stepUpMultiplier: themeScaling.stepUp * (band >= 3 ? 1.04 : 1),
    stepDownMultiplier: themeScaling.stepDown * (band >= 2 ? 1.04 : 1),
    hazardChanceMultiplier: themeScaling.hazard * (band >= 3 ? 1.08 : band >= 2 ? 1.04 : 1),
    enemyChanceMultiplier: themeScaling.enemy * (band >= 3 ? 1.06 : band >= 2 ? 1.03 : 1),
    platformWidthMultiplier: themeScaling.width,
    speedMultiplier: themeScaling.speed * (band >= 3 ? 0.94 : band >= 2 ? 0.97 : 1),
    shootCooldownMultiplier: band >= 3 ? 0.9 : band >= 2 ? 0.94 : band >= 1 ? 0.98 : 1,
  };
}

function getScalingEnemyWeightMultiplier(variant, director) {
  if (!director.enabled) return 1;
  const kind = variant.kind;
  const isRanged = !!variant.behavior?.ranged?.enabled;
  let multiplier = 1;
  if (isRanged) multiplier *= 1 + director.band * 0.12;
  if (variantHasSupportBehavior(variant)) multiplier *= 1 + director.band * 0.1;
  if (["armored", "armoredElite"].includes(kind)) multiplier *= 1 + director.band * 0.1;
  if (kind === "escalationUser") multiplier *= 1 + director.band * 0.12;
  return multiplier;
}

function getSegmentLayoutIntent(index, totalSegments, director) {
  if (!director.enabled) return "normal";
  if (index > 0 && index % 5 === 0) return "recovery";
  if (director.band >= 2) {
    const alternatingBeat = index % 6;
    if (alternatingBeat === 2) return "climb";
    if (alternatingBeat === 4) return "drop";
  }

  const style = director.themeStyle;
  const weights = {
    recovery: index > totalSegments - 3 ? 1.4 : 0.9,
    climb: style === "serverroom" ? 1.25 : 1,
    drop: style === "drsite" ? 1.35 : 1,
    hazard: style === "drsite" || style === "serverroom" ? 1.35 : 1,
    combat: style === "office" ? 1.45 : 1,
  };
  if (director.band >= 2) {
    weights.hazard += 0.25;
    weights.combat += 0.2;
  }
  if (director.band >= 3) {
    weights.climb += 0.15;
    weights.drop += 0.2;
  }
  return pickWeighted(Object.keys(weights), (intent) => weights[intent]) || "normal";
}

function getLayoutGapRange(isFloor, maxGapWidth, themeTuning, director, intent) {
  const baseMin = isFloor ? Math.round(60 * themeTuning.floorGapMultiplier) : 70;
  const baseMax = isFloor ? Math.round(120 * themeTuning.floorGapMultiplier) : maxGapWidth;
  if (!director.enabled) return { min: baseMin, max: baseMax };

  const intentScale = { recovery: 0.58, climb: 0.72, combat: 0.8, hazard: 0.86, drop: 1.08, normal: 1 }[intent] || 1;
  const min = Math.max(baseMin, Math.round(baseMin * (intent === "recovery" ? 0.85 : 1)));
  const max = Math.max(min + 12, Math.round(baseMax * intentScale));
  return { min, max: Math.min(baseMax, max) };
}

function getLayoutWidthRange(isFloor, themeTuning, director, intent) {
  const baseMin = isFloor ? Math.round(380 * themeTuning.platformWidthMultiplier) : Math.round(220 * themeTuning.platformWidthMultiplier);
  const baseMax = isFloor ? Math.round(620 * themeTuning.platformWidthMultiplier) : Math.round(360 * themeTuning.platformWidthMultiplier);
  if (!director.enabled || isFloor) return { min: baseMin, max: baseMax };

  const ranges = {
    recovery: [300, 390],
    climb: [220, 330],
    drop: [230, 340],
    hazard: [280, 380],
    combat: [300, 390],
    normal: [baseMin, baseMax],
  };
  const [minRaw, maxRaw] = ranges[intent] || ranges.normal;
  const widthScale = themeTuning.platformWidthMultiplier * director.platformWidthMultiplier;
  const min = Math.max(210, Math.round(minRaw * widthScale));
  const max = Math.max(min + 24, Math.round(maxRaw * widthScale));
  return { min, max };
}

function getLayoutVerticalOffset(intent, maxStepUp, maxStepDown, director) {
  if (!director.enabled || intent === "normal") {
    return randomInt(-maxStepUp, maxStepDown);
  }
  if (intent === "recovery") return randomInt(-70, 70);
  if (intent === "climb") return -randomInt(Math.round(maxStepUp * 0.35), maxStepUp);
  if (intent === "drop") return randomInt(Math.round(maxStepDown * 0.35), maxStepDown);
  if (intent === "hazard") return randomInt(-Math.round(maxStepUp * 0.55), Math.round(maxStepDown * 0.55));
  if (intent === "combat") return randomInt(-Math.round(maxStepUp * 0.45), Math.round(maxStepDown * 0.45));
  return randomInt(-maxStepUp, maxStepDown);
}

function getSegmentHazardChance(baseChance, intent, director) {
  if (!director.enabled) return baseChance;
  const multiplier = { recovery: 0.45, climb: 0.8, drop: 0.85, hazard: 1.22, combat: 0.9, normal: 1 }[intent] || 1;
  return Math.min(baseChance * multiplier, 0.98);
}

function getSegmentEnemyChance(baseChance, intent, director) {
  if (!director.enabled) return baseChance;
  const multiplier = { recovery: 0.55, climb: 0.86, drop: 0.88, hazard: 0.92, combat: 1.18, normal: 1 }[intent] || 1;
  return Math.min(baseChance * multiplier, 0.98);
}

function pickThemePlatformStyle(theme, segmentIndex) {
  if (segmentIndex % 4 === 3) {
    return "bridge";
  }
  const tuning = getThemeTuning(theme);
  return pickWeighted(theme.platformPool, (kind) => tuning.platformWeights[kind] ?? 1) || pickOne(theme.platformPool);
}
function pickWeighted(items, getWeight) {
  if (!items.length) {
    return null;
  }

  let totalWeight = 0;
  for (const item of items) {
    totalWeight += Math.max(0, getWeight(item) || 0);
  }

  if (totalWeight <= 0) {
    return pickOne(items);
  }

  let roll = randomBetween(0, totalWeight);
  for (const item of items) {
    roll -= Math.max(0, getWeight(item) || 0);
    if (roll <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

function createSpecialHazard(kind, x, y, w, h, side = "left", platformRef = null) {
  const config = SPECIAL_HAZARD_TYPES[kind];
  return {
    hazardId: nextHazardId++,
    kind,
    x,
    baseX: x,
    y,
    w,
    h,
    side,
    surfaceY: y + h,
    platformRef,
    color: config.color,
    label: config.label,
    spriteKey: config.spriteKey ? pickLoadedSpriteVariant(config.spriteKey) : null,
    phaseOffset: randomBetween(0, config.period || 1),
    lastHitCycle: -1,
    lastTouchTime: -999,
    hitbox: { left: 4, right: 4, top: 4, bottom: 2 },
  };
}

function getSpecialHazardCycleProgress(zone, now = performance.now()) {
  const config = SPECIAL_HAZARD_TYPES[zone.kind];
  if (!config?.period) {
    return 0;
  }
  const t = (now / 1000 + (zone.phaseOffset || 0)) % config.period;
  return t / config.period;
}

function isVentHazardActive(zone, now = performance.now()) {
  const config = SPECIAL_HAZARD_TYPES[zone.kind];
  if (zone.kind !== "vent" || !config) {
    return false;
  }
  return true;
}

function isStaticHazardActive(zone, now = performance.now()) {
  const config = SPECIAL_HAZARD_TYPES[zone.kind];
  if (zone.kind !== "static" || !config) {
    return false;
  }
  const progress = getSpecialHazardCycleProgress(zone, now);
  return progress >= config.activeWindowStart && progress <= config.activeWindowEnd;
}

function isDiskFailureHazardActive(zone, now = performance.now()) {
  const config = SPECIAL_HAZARD_TYPES[zone.kind];
  if (zone.kind !== "diskFailure" || !config) {
    return false;
  }
  const progress = getSpecialHazardCycleProgress(zone, now);
  return progress >= config.burstWindowStart && progress <= config.burstWindowEnd;
}

function isDiskFailureHazardWarning(zone, now = performance.now()) {
  const config = SPECIAL_HAZARD_TYPES[zone.kind];
  if (zone.kind !== "diskFailure" || !config) {
    return false;
  }
  const progress = getSpecialHazardCycleProgress(zone, now);
  return progress >= config.warningWindowStart && progress < config.burstWindowStart;
}

function isRebootHazardBurstActive(zone, now = performance.now()) {
  const config = SPECIAL_HAZARD_TYPES[zone.kind];
  if (zone.kind !== "reboot" || !config) {
    return false;
  }
  const progress = getSpecialHazardCycleProgress(zone, now);
  return progress >= config.burstWindowStart && progress <= config.burstWindowEnd;
}

function getBackupWindowMotion(zone, now = performance.now()) {
  const config = SPECIAL_HAZARD_TYPES[zone.kind];
  if (zone.kind !== "backupWindow" || !config || !zone.platformRef) {
    return { offset: 0, dir: 0, speed: 0 };
  }
  const progress = getSpecialHazardCycleProgress(zone, now);
  const padding = config.sweepPadding || 0;
  const overshoot = config.sweepOvershoot || 0;
  const startOffset = padding - overshoot;
  const travel = Math.max(0, zone.platformRef.w - zone.w - padding * 2 + overshoot * 2);
  const forward = progress < 0.5;
  const t = forward ? progress * 2 : (1 - progress) * 2;
  return {
    offset: startOffset + travel * t,
    dir: forward ? 1 : -1,
    speed: config.period ? (travel * 2) / config.period : 0,
  };
}

function getSpecialHazardRect(zone, now = performance.now()) {
  if (zone.kind === "backupWindow") {
    const motion = getBackupWindowMotion(zone, now);
    return {
      ...zone,
      x: zone.baseX + motion.offset,
      vx: motion.speed * motion.dir,
      dir: motion.dir,
    };
  }
  return zone;
}

function pickBossMode(profile) {
  if (profile.moveStyle === "dash") {
    return pickOne(["patrol", "retreat", "hold", "chase"]);
  }
  if (profile.moveStyle === "hop") {
    return pickOne(["patrol", "hold", "retreat", "chase"]);
  }
  return pickOne(["patrol", "patrol", "hold", "retreat", "chase"]);
}

function getBackgroundVariants(baseKey) {
  const variants = [baseKey];
  const base = BACKGROUND_VARIANT_MAP[baseKey];
  if (!base) {
    return variants;
  }

  for (let i = 1; i <= 9; i += 1) {
    const key = `${baseKey}Var${i}`;
    const src = `${base.basePath}${base.prefix}${i}.png`;
    staticSprites[key] = src;
    variants.push(key);
  }

  return variants;
}

function registerOptionalBackgroundVariants(maxVariants = 9) {
  for (const [baseKey, base] of Object.entries(BACKGROUND_VARIANT_MAP)) {
    for (let i = 1; i <= maxVariants; i += 1) {
      const key = `${baseKey}Var${i}`;
      const src = `${base.basePath}${base.prefix}${i}.png`;
      staticSprites[key] = src;
    }
  }
}

function getLoadedBackgroundVariants(baseKey) {
  return getBackgroundVariants(baseKey).filter((key) => assets[key]);
}

function registerOptionalSpriteVariants(maxVariants = 9) {
  for (const [baseKey, base] of Object.entries(SPRITE_VARIANT_MAP)) {
    for (let i = 1; i <= maxVariants; i += 1) {
      const key = `${baseKey}Var${i}`;
      const src = `${base.basePath}${base.prefix}${i}.png`;
      staticSprites[key] = src;
      OPTIONAL_SPRITE_KEYS.add(key);
    }
  }
}

function getSpriteVariants(baseKey, maxVariants = 9) {
  const variants = [baseKey];
  for (let i = 1; i <= maxVariants; i += 1) {
    variants.push(`${baseKey}Var${i}`);
  }
  return variants;
}

function getLoadedSpriteVariants(baseKey) {
  return getSpriteVariants(baseKey).filter((key) => assets[key]);
}

function pickLoadedSpriteVariant(baseKey) {
  const variants = getLoadedSpriteVariants(baseKey);
  if (variants.length === 0) {
    return baseKey;
  }

  if (variants.length === 1) {
    return variants[0];
  }

  const state = spriteVariantState[baseKey] || { index: 0, order: [] };
  const needsRefresh = state.order.length !== variants.length || state.order.some((key) => !variants.includes(key));
  if (needsRefresh) {
    state.order = [...variants];
    state.index = 0;
  }

  const choice = state.order[state.index % state.order.length];
  state.index = (state.index + 1) % state.order.length;
  spriteVariantState[baseKey] = state;
  return choice;
}

function getPickupSpriteBaseKey(kind) {
  if (kind === "snapshot") {
    return "snapshotPickup";
  }
  if (kind === "vmotion") {
    return "vmotionPickup";
  }
  if (kind === "patch") {
    return "patchPickup";
  }
  if (kind === "ha") {
    return "haPickup";
  }
  return null;
}

function hideMessageGuide() {
  messageCard.classList.remove("guide-mode");
  messageGuide.classList.add("hidden");
  messageSummary.classList.add("hidden");
  pauseResetBestRunButton.classList.add("hidden");
  messageHazards.innerHTML = "";
  messageEnemies.innerHTML = "";
  messagePickups.innerHTML = "";
  messageSummary.innerHTML = "";
}

function buildGuideCardHTML({ title, description, unlockLevel, spriteSrc, spriteAlt, placeholderLabel }) {
  const art = spriteSrc
    ? `<img src="${spriteSrc}" alt="${spriteAlt}">`
    : `<div class="guide-placeholder">${placeholderLabel || "INFO"}</div>`;
  const meta = Number.isFinite(unlockLevel)
    ? `<span class="guide-meta">Level ${unlockLevel}+</span>`
    : "";

  return `
    <article class="guide-card">
      <div class="guide-art">${art}</div>
      <div class="guide-copy">
        <h4>${title}</h4>
        <p>${description}</p>
        ${meta}
      </div>
    </article>
  `;
}

function renderPauseGuide() {
  messageSummary.classList.add("hidden");
  messageSummary.innerHTML = "";
  const hazardCards = Object.entries(SPECIAL_HAZARD_TYPES).map(([kind, config]) => {
    const guide = HAZARD_GUIDE_TEXT[kind] || {};
    const spriteSrc = config.spriteKey ? staticSprites[config.spriteKey] : null;
    return buildGuideCardHTML({
      title: guide.title || config.label,
      description: guide.description || "Platform hazard.",
      unlockLevel: config.unlockLevel || 1,
      spriteSrc,
      spriteAlt: `${guide.title || config.label} sprite`,
      placeholderLabel: config.label,
    });
  });

  const enemyCards = USER_VARIANTS.map((variant) => {
    const guide = ENEMY_GUIDE_TEXT[variant.kind] || {};
    const spriteSrc = staticSprites[variant.spriteKey] || null;
    return buildGuideCardHTML({
      title: guide.title || variant.kind,
      description: guide.description || "Enemy unit.",
      unlockLevel: variant.behavior?.unlockLevel || 1,
      spriteSrc,
      spriteAlt: `${guide.title || variant.kind} sprite`,
      placeholderLabel: guide.title || variant.kind,
    });
  });

  const pickupCards = PICKUP_TYPES.map((pickupType) => {
    const guide = PICKUP_GUIDE_TEXT[pickupType.kind] || {};
    const spriteBaseKey = getPickupSpriteBaseKey(pickupType.kind);
    const spriteSrc = spriteBaseKey ? staticSprites[spriteBaseKey] || null : null;
    return buildGuideCardHTML({
      title: guide.title || pickupType.title || pickupType.kind,
      description: guide.description || "Temporary pickup effect.",
      spriteSrc,
      spriteAlt: `${guide.title || pickupType.title || pickupType.kind} sprite`,
      placeholderLabel: pickupType.label,
    });
  });

  messageHazards.innerHTML = hazardCards.join("");
  messageEnemies.innerHTML = enemyCards.join("");
  messagePickups.innerHTML = pickupCards.join("");
  messageCard.classList.add("guide-mode");
  messageGuide.classList.remove("hidden");
}

function buildSummaryStatHTML({ label, value, note }) {
  const meta = note ? `<span>${note}</span>` : "";
  return `
    <article class="summary-stat">
      <span>${label}</span>
      <strong>${value}</strong>
      ${meta}
    </article>
  `;
}

function renderGameOverSla() {
  const levelReached = currentLevel;
  const pickedUpgrades = getPickedUpgradeEntries();
  const summaryCards = [
    { label: "Managers Escalated", value: runStats.bossesDefeated, note: "Bosses defeated" },
    { label: "VMs Restored", value: runStats.vmsRestored, note: "Tickets recovered across the run" },
    { label: "Level Reached", value: `L${levelReached}`, note: "Deepest maintenance window reached" },
    { label: "Users Neutralized", value: runStats.enemiesKilled, note: "Normal enemies defeated" },
    { label: "Keyboards Thrown", value: runStats.keyboardsThrown, note: "Improvised hardware projectiles" },
    { label: "Pickups Collected", value: runStats.pickupsCollected, note: "Temporary boosts and recoveries" },
    { label: "Upgrades Deployed", value: runStats.upgradesDeployed, note: "Build choices locked in" },
    { label: "Lives Burned", value: runStats.livesBurned, note: "SLA breaches absorbed" },
    { label: "Shield Pops", value: runStats.shieldPops, note: "Snapshot saves consumed" },
    { label: "Run Score", value: runScore, note: "Tickets, bosses, and pickups combined" },
  ];

  messageSummary.innerHTML = `
    <section class="summary-section">
      <div class="guide-section-header">
        <h3>Service Level Agreement</h3>
        <span>Post-incident remediation summary</span>
      </div>
      <div class="summary-grid">
        ${summaryCards.map(buildSummaryStatHTML).join("")}
      </div>
    </section>
    <section class="summary-section build-summary-section">
      <div class="guide-section-header">
        <h3>Final Build</h3>
        <span>${getBuildStatsText()}</span>
      </div>
      <div class="build-upgrade-list">
        ${pickedUpgrades.length ? pickedUpgrades.map(buildUpgradePillHTML).join("") : "<p>No upgrades deployed.</p>"}
      </div>
    </section>
  `;
  messageCard.classList.add("guide-mode");
  messageSummary.classList.remove("hidden");
}

function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
    keys.clear();
    jumpQueued = false;
    messageTitle.textContent = "Paused";
    messageText.textContent = "Press P or Esc to resume. Use this pause screen as a quick field guide for hazards and enemies.";
    renderPauseGuide();
    pauseResetBestRunButton.classList.remove("hidden");
    messageOverlay.classList.remove("hidden");
  } else if (gameState === "paused") {
    gameState = "playing";
    hideMessageGuide();
    messageOverlay.classList.add("hidden");
  }
}

function buildLevelConfig(level) {
  const tier = level - 1;
  const longRunBonus = Math.floor(tier / 8);
  const bossName = pickOne(MANAGER_BOSSES);
  const roomTheme = ROOM_THEMES[tier % ROOM_THEMES.length];
  const backgroundImages = roomTheme.backgroundImageBase ? getLoadedBackgroundVariants(roomTheme.backgroundImageBase) : [];
  const backgroundImage = backgroundImages.length > 0
    ? backgroundImages[tier % backgroundImages.length]
    : roomTheme.backgroundImageBase || null;

  const tuning = getThemeTuning(roomTheme);
  const scalingDirector = getScalingDirector(level, roomTheme);
  const isBossLevel = level % BOSS_LEVEL_INTERVAL === 0;
  const rawMaxGapWidth = Math.round((BASE_GAP_WIDTH + Math.floor(tier * 2.3)) * tuning.gapMultiplier);
  const rawMaxStepUp = BASE_STEP_UP + Math.floor(tier * 1.2);
  const rawMaxStepDown = BASE_STEP_DOWN + Math.floor(tier * 1.4);
  const maxGapWidth = scalingDirector.enabled
    ? Math.min(Math.round(rawMaxGapWidth * scalingDirector.gapMultiplier), 380)
    : Math.min(rawMaxGapWidth, 390);
  const maxStepUp = scalingDirector.enabled
    ? Math.min(Math.round(rawMaxStepUp * scalingDirector.stepUpMultiplier), 225)
    : Math.min(rawMaxStepUp, 230);
  const maxStepDown = scalingDirector.enabled
    ? Math.min(Math.round(rawMaxStepDown * scalingDirector.stepDownMultiplier), 275)
    : Math.min(rawMaxStepDown, 280);
  const hazardChance = scalingDirector.enabled
    ? Math.min((0.5 + tier * 0.007) * tuning.hazardChanceMultiplier * scalingDirector.hazardChanceMultiplier, 0.96)
    : Math.min((0.5 + tier * 0.008) * tuning.hazardChanceMultiplier, 0.98);
  const enemyChance = scalingDirector.enabled
    ? Math.min((0.65 + tier * 0.005) * tuning.enemyChanceMultiplier * scalingDirector.enemyChanceMultiplier, 0.96)
    : Math.min((0.65 + tier * 0.006) * tuning.enemyChanceMultiplier, 0.98);
  const minUserSpeed = scalingDirector.enabled
    ? Math.min(Math.round((90 + Math.floor(tier * 2.6)) * scalingDirector.speedMultiplier), 330)
    : Math.min(90 + Math.floor(tier * 3.2), 420);
  const maxUserSpeed = scalingDirector.enabled
    ? Math.min(Math.round((170 + Math.floor(tier * 4.2)) * scalingDirector.speedMultiplier), 520)
    : Math.min(170 + Math.floor(tier * 5.4), 700);

  return {
    isBossLevel,
    bossName,
    bossHp: Math.floor(tier * 3.0),
    bossSpeedScale: Math.min(1 + tier * 0.008, 1.85),
    bossAttackScale: Math.min(1 + tier * 0.009, 1.85),
    slaEscalationRate: isBossLevel ? 0 : Math.min(1.15 + tier * 0.01, 1.35),
    ticketTarget: Math.min(BASE_TICKETS + Math.floor(tier * 0.35) + longRunBonus, 40),
    segments: Math.min(BASE_LEVEL_SEGMENTS + Math.floor(tier * 0.4) + longRunBonus, 48),
    maxGapWidth,
    maxStepUp,
    maxStepDown,
    hazardChance,
    enemyChance,
    minUserSpeed,
    maxUserSpeed,
    enemyShootCooldownMultiplier: scalingDirector.shootCooldownMultiplier,
    theme: { ...roomTheme, backgroundImage },
    roomName: roomTheme.name,
  };
}

function makeCollider(entity) {
  if (entity.colliderRect) {
    return {
      x: entity.x + entity.colliderRect.x,
      y: entity.y + entity.colliderRect.y,
      w: entity.colliderRect.w,
      h: entity.colliderRect.h,
    };
  }

  if (entity.assetColliderKey) {
    const rect = getAssetColliderRect(
      entity.assetColliderKey,
      entity.w,
      entity.h,
      entity.assetColliderOptions || {},
    );
    return {
      x: entity.x + (entity.assetColliderOffsetX || 0) + rect.x,
      y: entity.y + (entity.assetColliderOffsetY || 0) + rect.y,
      w: rect.w,
      h: rect.h,
    };
  }

  const box = entity.hitbox || { left: 0, right: 0, top: 0, bottom: 0 };
  return {
    x: entity.x + box.left,
    y: entity.y + box.top,
    w: entity.w - box.left - box.right,
    h: entity.h - box.top - box.bottom,
  };
}

function getSpriteFitRect(image, targetW, targetH, options = {}) {
  if (!image) {
    return { x: 0, y: 0, w: targetW, h: targetH };
  }

  const mode = options.mode || "contain";
  if (mode === "stretch") {
    return { x: 0, y: 0, w: targetW, h: targetH };
  }
  const scale = mode === "cover"
    ? Math.max(targetW / image.width, targetH / image.height)
    : Math.min(targetW / image.width, targetH / image.height);
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  const alignX = options.alignX || "center";
  const alignY = options.alignY || "bottom";

  let drawX = 0;
  let drawY = 0;

  if (alignX === "center") {
    drawX = (targetW - drawW) / 2;
  } else if (alignX === "right") {
    drawX = targetW - drawW;
  }

  if (alignY === "center") {
    drawY = (targetH - drawH) / 2;
  } else if (alignY === "bottom") {
    drawY = targetH - drawH;
  }

  return { x: drawX, y: drawY, w: drawW, h: drawH };
}

function measureOpaqueBounds(image, alphaThreshold = 12) {
  try {
    const canvasEl = document.createElement("canvas");
    canvasEl.width = image.width;
    canvasEl.height = image.height;
    const context = canvasEl.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, image.width, image.height).data;

    let minX = image.width;
    let minY = image.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const alpha = data[(y * image.width + x) * 4 + 3];
        if (alpha < alphaThreshold) {
          continue;
        }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX < minX || maxY < minY) {
      return { left: 0, top: 0, width: 1, height: 1 };
    }

    return {
      left: minX / image.width,
      top: minY / image.height,
      width: (maxX - minX + 1) / image.width,
      height: (maxY - minY + 1) / image.height,
    };
  } catch (_error) {
    return { left: 0, top: 0, width: 1, height: 1 };
  }
}

function getAssetColliderRect(assetKey, targetW, targetH, options = {}) {
  const image = assets[assetKey];
  const fitted = getSpriteFitRect(image, targetW, targetH, options);
  const bounds = assetOpaqueBounds[assetKey];

  if (!bounds) {
    return fitted;
  }

  return {
    x: fitted.x + bounds.left * fitted.w,
    y: fitted.y + bounds.top * fitted.h,
    w: Math.max(2, bounds.width * fitted.w),
    h: Math.max(2, bounds.height * fitted.h),
  };
}

function getAdaptivePlatformMode(assetKey, targetW, targetH, fallbackMode = "contain") {
  const image = assets[assetKey];
  if (!image) {
    return fallbackMode;
  }

  const spriteRatio = image.width / Math.max(1, image.height);
  const targetRatio = targetW / Math.max(1, targetH);
  const ratioDelta = Math.max(spriteRatio, targetRatio) / Math.max(0.01, Math.min(spriteRatio, targetRatio));

  return ratioDelta > 2.2 ? "stretch" : fallbackMode;
}

const PLATFORM_RENDER_CONFIG = {
  rack: { asset: "rack", offsetY: -4, renderH: 108, surfaceInset: 2, platformH: 32 },
  switch: { asset: "switch", offsetY: -4, renderH: 92, surfaceInset: 2, platformH: 32 },
  database: { asset: "database", offsetY: -10, renderH: 116, surfaceInset: 4, platformH: 42 },
  esxi: { asset: "esxi", offsetY: -4, renderH: 108, surfaceInset: 4, platformH: 32 },
  officeDesk: { asset: "officeDesk", offsetY: -8, renderH: 106, surfaceInset: 4, platformH: 34 },
  upsRack: { asset: "upsRack", offsetY: -6, renderH: 112, surfaceInset: 3, platformH: 36 },
  cableTray: { asset: "cableTray", offsetY: -2, renderH: 58, surfaceInset: 2, platformH: 24 },
  crashCart: { asset: "crashCart", offsetY: -18, renderH: 118, surfaceInset: 5, platformH: 34 },
  patchWall: { asset: "patchWall", offsetY: -6, renderH: 104, surfaceInset: 3, platformH: 32 },
  cloudAppliance: { asset: "cloudAppliance", offsetY: -8, renderH: 112, surfaceInset: 4, platformH: 36 },
};

function getPlatformRenderConfig(kind) {
  return PLATFORM_RENDER_CONFIG[kind] || null;
}

function getGeneratedPlatformHeight(kind) {
  return getPlatformRenderConfig(kind)?.platformH || 32;
}

function getEntityColliderOffset(entity) {
  if (entity.colliderRect) {
    return {
      x: entity.colliderRect.x,
      y: entity.colliderRect.y,
    };
  }

  if (entity.assetColliderKey) {
    const rect = getAssetColliderRect(
      entity.assetColliderKey,
      entity.w,
      entity.h,
      entity.assetColliderOptions || {},
    );
    return {
      x: (entity.assetColliderOffsetX || 0) + rect.x,
      y: (entity.assetColliderOffsetY || 0) + rect.y,
    };
  }

  return {
    x: entity.hitbox?.left || 0,
    y: entity.hitbox?.top || 0,
  };
}

function syncWorldSpriteColliders() {
  for (const platform of platforms) {
    const config = getPlatformRenderConfig(platform.kind);
    if (!config || !assets[config.asset]) {
      platform.colliderRect = null;
      continue;
    }

    const platformAssetKey = platform.spriteKey || config.asset;
    const mode = getAdaptivePlatformMode(platformAssetKey, platform.w, config.renderH, config.mode || "contain");
    const fitted = getAssetColliderRect(platformAssetKey, platform.w, config.renderH, { mode });
    const colliderTop = config.offsetY + fitted.y + (config.surfaceInset || 0);
    platform.colliderRect = {
      x: fitted.x,
      y: colliderTop,
      w: fitted.w,
      h: platform.h,
    };
  }

  if (assets.firewall) {
    for (const zone of firewallZones) {
      const fitted = getAssetColliderRect(zone.spriteKey || "firewall", zone.w, zone.h + 36, { alignY: "center" });
      zone.colliderRect = {
        x: fitted.x,
        y: -20 + fitted.y,
        w: fitted.w,
        h: fitted.h,
      };
    }
  }

  for (const zone of specialHazards) {
    const supportPlatform = zone.platformRef;
    const config = SPECIAL_HAZARD_TYPES[zone.kind];
    if (!supportPlatform || !config) {
      zone.surfaceY = zone.y + zone.h;
      continue;
    }

    const supportTop = supportPlatform.colliderRect
      ? supportPlatform.y + supportPlatform.colliderRect.y
      : supportPlatform.y;
    zone.surfaceY = supportTop + (config.surfaceInset || 0);
    zone.y = zone.surfaceY - zone.h;
    if (zone.kind === "backupWindow") {
      zone.baseX = supportPlatform.x;
    }
  }
}

function getSlaPriorityLabel(tier = slaPriorityTier) {
  if (tier >= 3) {
    return "P1";
  }
  if (tier === 2) {
    return "P2";
  }
  if (tier === 1) {
    return "P3";
  }
  return "OK";
}

function getSlaPriorityTier(escalation = slaEscalation) {
  if (escalation >= 100) {
    return 3;
  }
  if (escalation >= 70) {
    return 2;
  }
  if (escalation >= 35) {
    return 1;
  }
  return 0;
}

function getSlaPressure() {
  const tier = currentLevelConfig.isBossLevel ? 0 : slaPriorityTier;
  const unattendedMultiplier = slaNoRestoreTimer > 9 ? 1.08 : 1;
  return {
    speedMultiplier: (1 + tier * 0.1) * unattendedMultiplier,
    shootCooldownMultiplier: Math.max(0.62, 1 - tier * 0.12),
    projectileSpeedMultiplier: 1 + tier * 0.08,
  };
}

function getSlaDispatchInterval(tier = slaPriorityTier) {
  if (tier >= 3) {
    return 4;
  }
  if (tier === 2) {
    return 6;
  }
  if (tier === 1) {
    return 8;
  }
  return 0;
}

function updateSlaEscalation(dt) {
  if (currentLevelConfig.isBossLevel || gameState !== "playing") {
    return;
  }

  slaNoRestoreTimer += dt;
  if (slaStabilizedTimer > 0) {
    slaStabilizedTimer = Math.max(0, slaStabilizedTimer - dt);
  } else {
    const staleTicketMultiplier = slaNoRestoreTimer > 18 ? 1.8 : slaNoRestoreTimer > 10 ? 1.35 : 1;
    slaEscalation = Math.min(100, slaEscalation + (currentLevelConfig.slaEscalationRate || 0) * staleTicketMultiplier * dt);
  }

  const nextTier = getSlaPriorityTier();
  const previousTier = slaPriorityTier;
  if (nextTier > previousTier) {
    for (let tier = previousTier + 1; tier <= nextTier; tier += 1) {
      slaPriorityTier = tier;
      spawnSlaIncidentDispatch({ force: true });
    }
    slaPriorityTier = nextTier;
    slaDispatchTimer = getSlaDispatchInterval();
    addScreenShake(3 + slaPriorityTier, 0.1);
    spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.35, slaPriorityTier >= 3 ? "#ff5b6e" : "#ffd166", 10 + slaPriorityTier * 2, { speedMin: 80, speedMax: 230 });
    syncHud();
  } else {
    slaPriorityTier = nextTier;
    if (nextTier !== previousTier) {
      const interval = getSlaDispatchInterval();
      slaDispatchTimer = interval > 0 ? Math.min(slaDispatchTimer, interval) : 0;
    }
  }

  updateSlaDispatch(dt);

  slaHudTimer = Math.max(0, slaHudTimer - dt);
  if (slaHudTimer <= 0) {
    slaHudTimer = 0.5;
    syncHud();
  }
}

function resetRunUpgrades() {
  runUpgrades = createRunUpgrades();
  traitState = createTraitState();
  currentUpgradeChoices = [];
}

function getPlayerStats() {
  const config = playerConfigs[selectedPlayerKey];
  const lowLatencyPenalty = getUpgradeCount("lowLatencyInput") * 8;
  const highJumpPenalty = getUpgradeCount("highJumpProfile") * 14;
  const sprintBonus = getUpgradeCount("sprintBoots") * 22;
  const heavyKeyboardDamage = getUpgradeCount("heavyKeyboards") * 2;
  const heavyKeyboardSpeedPenalty = getUpgradeCount("heavyKeyboards") * 110;
  const overclockedThrowSpeed = getUpgradeCount("overclockedThrow") * 220;
  const overclockedCooldownPenalty = 1 + getUpgradeCount("overclockedThrow") * 0.07;
  const chainStacks = getTempoStacks();
  const chainSpeedBonus = chainStacks * 12;
  const chainCooldownMultiplier = Math.max(0.78, 1 - chainStacks * 0.04);
  return {
    ...config,
    speed: config.speed + getUpgradeCount("speed") * upgradeConfig.speed.step + sprintBonus + chainSpeedBonus - lowLatencyPenalty - highJumpPenalty,
    jump: config.jump + getUpgradeCount("jump") * upgradeConfig.jump.step + getUpgradeCount("highJumpProfile") * 52,
    keyboardDamage: config.keyboardDamage + getUpgradeCount("damage") * upgradeConfig.damage.step + heavyKeyboardDamage,
    keyboardSpeed: config.keyboardSpeed + overclockedThrowSpeed - heavyKeyboardSpeedPenalty,
    keyboardCooldown: Math.max(
      0.08,
      config.keyboardCooldown * (upgradeConfig.fireRate.multiplier ** getUpgradeCount("fireRate")) * overclockedCooldownPenalty * chainCooldownMultiplier,
    ),
    invincibleDuration: config.invincibleDuration + getUpgradeCount("shield") * upgradeConfig.shield.step + getUpgradeCount("hypervisorGuard") * 0.35,
    airControlMultiplier: (config.baseAirControlMultiplier || 1) * (1 + getUpgradeCount("lowLatencyInput") * 0.18 + getUpgradeCount("momentumCache") * 0.08),
    maxAirJumps: config.maxAirJumps + getUpgradeCount("tripleJump"),
  };
}

function getPickupDurationMultiplier() {
  return Math.pow(1.3, getUpgradeCount("efficientPatchCycle"));
}

function getTicketVacuumRange() {
  return 150 + getUpgradeCount("ticketVacuum") * 90;
}

function getBossWarningMultiplier() {
  return 1 + getUpgradeCount("beamTiming") * 0.22;
}

function resetPerLevelTraitState() {
  traitState.emergencySnapshotUsed = false;
  traitState.escalationShieldUsed = false;
  traitState.snapshotRollbacksUsed = 0;
  traitState.bonusRecoveryTickets = 0;
  traitState.pressureResponseTriggered = false;
  traitState.chainKills = 0;
  traitState.chainTimer = 0;
}

function applyLevelStartPerks() {
  resetPerLevelTraitState();
  if (hasUpgrade("goldenImage")) {
    player.snapshotShield = Math.max(player.snapshotShield, getUpgradeCount("goldenImage"));
    spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.75, "#ffd166", 10);
  }
}

function markDamageReset() {
  traitState.chainKills = 0;
  traitState.chainTimer = 0;
}

function getAvailableUpgrades() {
  return UPGRADE_POOL.filter((entry) => getUpgradeCount(entry.id) < (entry.maxStacks ?? 1));
}

function rollUpgradeChoices() {
  const available = getAvailableUpgrades();
  const choices = [];
  while (choices.length < Math.min(3, available.length)) {
    const remaining = available.filter((entry) => !choices.includes(entry));
    const picked = pickWeighted(remaining, (entry) => UPGRADE_RARITY_WEIGHT[entry.rarity] || 1);
    if (!picked) {
      break;
    }
    choices.push(picked);
  }
  currentUpgradeChoices = choices;
}

function getEnemyUpgradeScaling() {
  return {
    speedMultiplier: Math.min(1 + runUpgrades.speed * 0.025, 1.2),
    jumpBonus: Math.min(runUpgrades.jump * 8, 60),
    hpBonus: Math.min(Math.floor(runUpgrades.damage / 3), 2),
    armorBonus: Math.min(Math.floor(runUpgrades.damage / 5), 2),
    shootCooldownMultiplier: Math.max(1 - runUpgrades.fireRate * 0.022, 0.78),
    projectileSpeedMultiplier: Math.min(1 + runUpgrades.fireRate * 0.028, 1.22),
  };
}

function makePlayer() {
  const config = getPlayerStats();
  return {
    x: levelStartSpawn.x,
    prevX: levelStartSpawn.x,
    y: levelStartSpawn.y,
    vx: 0,
    vy: 0,
    w: config.width,
    h: config.height,
    speed: config.speed,
    jump: config.jump,
    hitbox: config.hitbox,
    assetColliderKey: selectedPlayerKey,
    assetColliderOptions: { alignY: "bottom" },
    maxAirJumps: config.maxAirJumps,
    airJumpsRemaining: config.maxAirJumps,
    keyboardDamage: config.keyboardDamage,
    keyboardSpeed: config.keyboardSpeed,
    keyboardCooldownDuration: config.keyboardCooldown,
    keyboardSize: config.keyboardSize,
    keyboardLift: config.keyboardLift,
    invincibleDuration: config.invincibleDuration,
    grounded: false,
    invincibleTimer: 0,
    pickupSpeedTimer: 0,
    pickupDamageTimer: 0,
    snapshotShield: 0,
    slipTimer: 0,
    snareTimer: 0,
    jumpDebuffTimer: 0,
    throwCooldown: 0,
    throwPoseTimer: 0,
    hurtTimer: 0,
    quickRecoveryTimer: 0,
    pressureResponseTimer: 0,
    bossGraceTimer: 0,
    lives: config.lives,
    score: 0,
    facing: 1,
    lastSafeX: levelStartSpawn.x,
    lastSafeY: levelStartSpawn.y,
  };
}

function buildProceduralLevel() {
  spriteVariantState = {};
  currentLevelConfig = buildLevelConfig(currentLevel);
  firewallZones = [];
  specialHazards = [];
  tickets = [];
  pickups = [];
  users = [];
  keyboards = [];
  decorations = [];
  boss = null;
  bossProjectiles = [];
  bossMechanics = [];
  userProjectiles = [];
  userDenialZones = [];

  if (currentLevelConfig.isBossLevel) {
    const arena = BOSS_ARENAS[Math.floor(currentLevel / BOSS_LEVEL_INTERVAL - 1) % BOSS_ARENAS.length];
    const profile = BOSS_PROFILES[currentLevelConfig.bossName];
    platforms = arena.platforms.map((platform) => ({
      ...platform,
      spriteKey: platform.kind === "floor" ? null : pickLoadedSpriteVariant(platform.kind),
      hitbox: { ...platform.hitbox },
    }));
    firewallZones = arena.firewalls.map((zone) => ({ ...zone, spriteKey: pickLoadedSpriteVariant("firewall"), hitbox: { ...zone.hitbox } }));
    decorations = arena.decorations.map((decoration) => ({
      ...decoration,
      spriteKey: pickLoadedSpriteVariant(decoration.kind),
    }));
    boss = {
      name: currentLevelConfig.bossName,
      x: arena.bossSpawn.x,
      y: arena.bossSpawn.y,
      spawnX: arena.bossSpawn.x,
      spawnY: arena.bossSpawn.y,
      w: 88,
      h: 126,
      vx: -profile.speed * currentLevelConfig.bossSpeedScale,
      vy: 0,
      minX: 12,
      maxX: arena.worldWidth - 100,
      hp: currentLevelConfig.bossHp,
      maxHp: currentLevelConfig.bossHp,
      scoreAwarded: false,
      jump: profile.moveStyle === "hop" ? 920 : 860,
      maxAirJumps: 1,
      airJumpsRemaining: 1,
      shootTimer: profile.cooldown,
      jumpTimer: 0.35,
      aiMode: pickBossMode(profile),
      aiTimer: randomBetween(0.8, 1.8),
      roamDir: Math.random() > 0.5 ? 1 : -1,
      hurtTimer: 0,
      stateTimer: 0.9,
      dodgeTimer: 0.8,
      stuckTimer: 0,
      homeTimer: 0,
      lastSafeX: arena.bossSpawn.x,
      lastSafeY: arena.bossSpawn.y,
      phaseSeed: randomBetween(0, Math.PI * 2),
      grounded: false,
      specialTimer: profile.specialCooldown * randomBetween(0.55, 0.9),
      dashBurstTimer: 0,
      pursuitTimer: 0,
      changeFreezeCooldown: 0,
      profile,
      hitbox: { left: 16, right: 16, top: 12, bottom: 4 },
    };
    const cabCount = getUpgradeCount("changeAdvisoryBoard");
    if (cabCount > 0) {
      boss.hp = Math.ceil(boss.hp * (1 + cabCount * 0.14));
      boss.maxHp = boss.hp;
      boss.profile = {
        ...boss.profile,
        speed: boss.profile.speed * Math.pow(0.92, cabCount),
        cooldown: boss.profile.cooldown * (1 + cabCount * 0.1),
        specialCooldown: boss.profile.specialCooldown * (1 + cabCount * 0.08),
      };
      boss.vx = Math.sign(boss.vx || -1) * boss.profile.speed * currentLevelConfig.bossSpeedScale;
    }
    finishGate = {
      x: arena.finishX,
      y: 490,
      w: 120,
      h: 150,
      hitbox: { left: 24, right: 24, top: 24, bottom: 12 },
      assetColliderKey: "cloud",
      assetColliderOptions: { alignY: "bottom" },
    };
    worldWidth = arena.worldWidth;
    syncWorldSpriteColliders();
    levelStartSpawn = { x: 90, y: GROUND_Y - getPlayerStats().height };
    return;
  }

  platforms = [{ x: 0, y: GROUND_Y, w: 580, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } }];

  let cursorX = 580;
  let currentY = GROUND_Y;
  let ticketsPlaced = 0;
  const enemyScaling = getEnemyUpgradeScaling();
  const themeTuning = getThemeTuning(currentLevelConfig.theme);
  const lateGameDirector = getLateGameDirector(currentLevel, currentLevelConfig.theme);
  const scalingDirector = getScalingDirector(currentLevel, currentLevelConfig.theme);

  for (let i = 0; i < currentLevelConfig.segments; i += 1) {
    const layoutIntent = getSegmentLayoutIntent(i, currentLevelConfig.segments, scalingDirector);
    const segmentStyle = pickThemePlatformStyle(currentLevelConfig.theme, i);
    const isFloor = segmentStyle === "bridge";
    const platformKind = isFloor ? "floor" : segmentStyle;
    const gapRange = getLayoutGapRange(isFloor, currentLevelConfig.maxGapWidth, themeTuning, scalingDirector, layoutIntent);
    const widthRange = getLayoutWidthRange(isFloor, themeTuning, scalingDirector, layoutIntent);
    const gap = randomInt(gapRange.min, gapRange.max);
    const width = randomInt(widthRange.min, widthRange.max);
    const platformHeight = isFloor ? 80 : getGeneratedPlatformHeight(platformKind);
    const verticalOffset = getLayoutVerticalOffset(layoutIntent, currentLevelConfig.maxStepUp, currentLevelConfig.maxStepDown, scalingDirector);
    const platformY = isFloor
      ? GROUND_Y
      : Math.max(410, Math.min(560, currentY + verticalOffset));
    const platform = {
      x: cursorX + gap,
      y: platformY,
      w: width,
      h: platformHeight,
      kind: platformKind,
      spriteKey: isFloor ? null : pickLoadedSpriteVariant(platformKind),
      hitbox: { left: isFloor ? 0 : 8, right: isFloor ? 0 : 8, top: 0, bottom: 0 },
    };

    if (platform.x - cursorX > 40) {
      firewallZones.push({
        x: cursorX + 8,
        y: 676,
        w: platform.x - cursorX - 16,
        h: 18,
        hitbox: { left: 8, right: 8, top: 8, bottom: 0 },
      });
    }

    const firewallSide = Math.random() > 0.5 ? "left" : "right";
    let surfaceFirewall = null;
    let surfaceHazard = null;
    let surfaceHazardSide = firewallSide;
    const demandingMovement = scalingDirector.enabled
      && !isFloor
      && gap > currentLevelConfig.maxGapWidth * 0.82
      && Math.abs(verticalOffset) > Math.max(currentLevelConfig.maxStepUp, currentLevelConfig.maxStepDown) * 0.7;
    const canSpawnSurfaceHazard = width >= (isFloor ? 320 : 250) && !demandingMovement;
    const segmentHazardChance = getSegmentHazardChance(currentLevelConfig.hazardChance, layoutIntent, scalingDirector);
    if (canSpawnSurfaceHazard && Math.random() < segmentHazardChance) {
      const unlockedSpecialHazards = Object.keys(SPECIAL_HAZARD_TYPES)
        .filter((key) => currentLevel >= (SPECIAL_HAZARD_TYPES[key].unlockLevel || 1));
      const hazardKind = isFloor
        ? pickWeighted(unlockedSpecialHazards.filter((key) => SPECIAL_HAZARD_TYPES[key].allowedOnFloor), (key) => getLateGameHazardWeight(key, lateGameDirector, themeTuning))
        : pickWeighted(["firewall", ...unlockedSpecialHazards], (key) => getLateGameHazardWeight(key, lateGameDirector, themeTuning));

      if (hazardKind === "firewall") {
        surfaceFirewall = {
          x: firewallSide === "left" ? platform.x + width * 0.18 : platform.x + width * 0.52,
          y: platform.y - 18,
          w: width * 0.3,
          h: 16,
          spriteKey: pickLoadedSpriteVariant("firewall"),
          hitbox: { left: 10, right: 10, top: 6, bottom: 0 },
        };
        firewallZones.push(surfaceFirewall);
        surfaceHazard = surfaceFirewall;
      } else if (hazardKind) {
        const hazardConfig = SPECIAL_HAZARD_TYPES[hazardKind];
        const hazardWidth = Math.max(84, width * hazardConfig.widthFactor);
        const hazardX = surfaceHazardSide === "left"
          ? platform.x + width * 0.16
          : platform.x + width - hazardWidth - width * 0.16;
        const hazardY = platform.y - hazardConfig.height;
        surfaceHazard = createSpecialHazard(hazardKind, hazardX, hazardY, hazardWidth, hazardConfig.height, surfaceHazardSide, platform);
        specialHazards.push(surfaceHazard);
      }
    }

    platforms.push(platform);

    if (isFloor && width > 460) {
      const decorationKind = pickOne(currentLevelConfig.theme.decorationPool);
      const loadedVariants = getLoadedSpriteVariants(decorationKind);
      const decorationCount = loadedVariants.length > 1 && width > 520 ? 2 : 1;
      const spacing = decorationCount > 1 ? Math.min(170, Math.max(110, width * 0.22)) : 0;
      const centerX = platform.x + randomInt(90, width - 90);

      for (let index = 0; index < decorationCount; index += 1) {
        const offset = decorationCount === 1 ? 0 : (index === 0 ? -spacing / 2 : spacing / 2);
        const decorationX = Math.max(platform.x + 36, Math.min(platform.x + width - 114, centerX + offset));
        decorations.push({
          x: decorationX,
          y: platform.y - 92,
          w: 78,
          h: 92,
          kind: decorationKind,
          spriteKey: pickLoadedSpriteVariant(decorationKind),
        });
      }
    }

    if (ticketsPlaced < currentLevelConfig.ticketTarget) {
      tickets.push({
        x: surfaceHazard && surfaceHazardSide === "left" ? platform.x + width * 0.72 - 22 : platform.x + width * 0.28 - 22,
        y: platform.y - 64,
        w: 44,
        h: 44,
        hitbox: { left: 8, right: 8, top: 8, bottom: 8 },
        assetColliderKey: null,
        assetColliderOptions: { alignY: "center", mode: "cover" },
        spriteKey: pickLoadedSpriteVariant("ticket"),
        taken: false,
        floatOffset: Math.random() * Math.PI * 2,
      });
      tickets[tickets.length - 1].assetColliderKey = tickets[tickets.length - 1].spriteKey;
      ticketsPlaced += 1;
    }

    if (i >= 1 && width >= 260 && Math.random() < (0.18 + getUpgradeCount("fieldKit") * 0.06)) {
      const snapshotCacheCount = getUpgradeCount("snapshotCache");
      const pickupType = snapshotCacheCount > 0
        ? pickWeighted(PICKUP_TYPES, (entry) => (entry.kind === "snapshot" || entry.kind === "ha" ? 1 + snapshotCacheCount * 2 : 1))
        : pickOne(PICKUP_TYPES);
      const pickupBaseKey = getPickupSpriteBaseKey(pickupType.kind);
      pickups.push({
        x: surfaceHazard && surfaceHazardSide === "left" ? platform.x + width * 0.74 - 22 : platform.x + width * 0.26 - 22,
        y: platform.y - 80,
        w: 44,
        h: 44,
        kind: pickupType.kind,
        label: pickupType.label,
        color: pickupType.color,
        title: pickupType.title,
        spriteKey: pickupBaseKey ? pickLoadedSpriteVariant(pickupBaseKey) : null,
        taken: false,
        floatOffset: Math.random() * Math.PI * 2,
        renderY: platform.y - 80,
        hitbox: { left: 8, right: 8, top: 8, bottom: 8 },
      });
    }

    const segmentEnemyChance = getSegmentEnemyChance(currentLevelConfig.enemyChance, layoutIntent, scalingDirector);
    if (width >= 250 && Math.random() < segmentEnemyChance) {
      const unlockedVariants = USER_VARIANTS.filter((variant) => currentLevel >= (variant.behavior?.unlockLevel || 1));
      const roomyEnoughForSupport = width >= 330;
      const spawnPool = roomyEnoughForSupport
        ? unlockedVariants
        : unlockedVariants.filter((entry) => !variantHasSupportBehavior(entry));
      const variant = pickWeighted(spawnPool.length ? spawnPool : unlockedVariants, (entry) => getLateGameEnemyWeight(entry, platform, surfaceHazard, lateGameDirector, themeTuning) * getScalingEnemyWeightMultiplier(entry, scalingDirector));
      const supportGroup = variantHasSupportBehavior(variant) && roomyEnoughForSupport;
      if (supportGroup) {
        spawnSupportUserGroup(platform, variant, unlockedVariants, enemyScaling, surfaceHazard, themeTuning);
      } else {
        const spawnX = pickSafeUserSpawnX(platform, variant, surfaceHazard);
        spawnUserFromVariant(platform, variant, spawnX, enemyScaling);
      }
      if (layoutIntent !== "recovery") {
        maybeSpawnLateGameEncounter(platform, variant, surfaceHazard, lateGameDirector, unlockedVariants, enemyScaling, themeTuning);
      }
    }

    cursorX = platform.x + platform.w;
    currentY = platformY;
  }

  while (ticketsPlaced < currentLevelConfig.ticketTarget) {
    const platform = platforms[randomInt(1, platforms.length - 1)];
    tickets.push({
      x: platform.x + randomInt(24, Math.max(24, platform.w - 68)),
      y: platform.y - 64,
      w: 44,
      h: 44,
      hitbox: { left: 8, right: 8, top: 8, bottom: 8 },
      assetColliderKey: null,
      assetColliderOptions: { alignY: "center", mode: "cover" },
      spriteKey: pickLoadedSpriteVariant("ticket"),
      taken: false,
      floatOffset: Math.random() * Math.PI * 2,
    });
    tickets[tickets.length - 1].assetColliderKey = tickets[tickets.length - 1].spriteKey;
    ticketsPlaced += 1;
  }

  ensureSupportEnemiesHaveEscorts(enemyScaling);

  const finalPadX = cursorX + 140;
  platforms.push({ x: finalPadX, y: GROUND_Y, w: 620, h: 80, kind: "floor", hitbox: { left: 0, right: 0, top: 0, bottom: 0 } });
  decorations.push({
    x: finalPadX + 120,
    y: GROUND_Y - 92,
    w: 78,
    h: 92,
    kind: pickOne(currentLevelConfig.theme.decorationPool),
    spriteKey: null,
  });
  decorations[decorations.length - 1].spriteKey = pickLoadedSpriteVariant(decorations[decorations.length - 1].kind);
  finishGate = {
    x: finalPadX + 420,
    y: 490,
    w: 120,
    h: 150,
    hitbox: { left: 24, right: 24, top: 24, bottom: 12 },
    assetColliderKey: "cloud",
    assetColliderOptions: { alignY: "bottom" },
  };
  worldWidth = finalPadX + 620;
  syncWorldSpriteColliders();
  levelStartSpawn = { x: 90, y: GROUND_Y - getPlayerStats().height };
}

function resetRun(preservedLives = null) {
  spriteVariantState = {};
  pendingLevelRestart = null;
  slaEscalation = 0;
  slaPriorityTier = 0;
  slaStabilizedTimer = 0;
  slaHudTimer = 0;
  slaNoRestoreTimer = 0;
  slaDispatchTimer = 0;
  buildProceduralLevel();
  player = makePlayer();
  if (preservedLives !== null) {
    player.lives = preservedLives;
  }
  applyLevelStartPerks();
  jumpQueued = false;
  cameraX = 0;
  gameState = "playing";
  selectOverlay.classList.add("hidden");
  hideMessageGuide();
  messageOverlay.classList.add("hidden");
  upgradeOverlay.classList.add("hidden");
  hudLevel.textContent = String(currentLevel);
  hudPlayer.textContent = playerConfigs[selectedPlayerKey].label;
  syncHud();
}

function startCampaign() {
  currentLevel = 1;
  runScore = 0;
  runStats = createRunStats();
  resetRunUpgrades();
  traitState = createTraitState();
  resetRun(null);
}

function startNextLevel() {
  const bonusLife = currentLevel > 0 && currentLevel % 3 === 0 ? 1 : 0;
  const nextLives = Math.min(player.lives + bonusLife, getCurrentMaxLives());
  currentLevel += 1;
  resetRun(nextLives);
}

function renderUpgradeOverlay() {
  const baseConfig = playerConfigs[selectedPlayerKey];
  rollUpgradeChoices();
  const activeTraits = getBuildTraitNames();

  upgradeTitle.textContent = `Level ${currentLevel} cleared. Choose one upgrade for level ${currentLevel + 1}.`;
  upgradeSummary.textContent = `${baseConfig.label} build: ${getBuildStatsText()} | LIVES ${player.lives}${activeTraits.length ? ` | traits: ${activeTraits.join(", ")}` : ""}`;
  upgradeGrid.innerHTML = currentUpgradeChoices.map((entry) => `
    <button class="upgrade-card" type="button" data-upgrade="${entry.id}" data-rarity="${entry.rarity}">
      <span class="upgrade-name">${entry.name}</span>
      <span class="upgrade-rarity">${entry.rarity}</span>
      <span class="upgrade-stack">x${getUpgradeCount(entry.id) + 1}${entry.maxStacks ? ` / ${entry.maxStacks}` : ""}</span>
      <strong>${entry.preview()}</strong>
      <p>${entry.description}</p>
    </button>
  `).join("");
}

function applyUpgrade(choice) {
  const entry = UPGRADE_POOL.find((item) => item.id === choice);
  if (!entry || getUpgradeCount(entry.id) >= (entry.maxStacks ?? 1)) {
    return;
  }
  entry.apply();
  runStats.upgradesDeployed += 1;
  startNextLevel();
}

function updateBestRun() {
  let changed = false;
  if (runScore > bestRunScore) {
    bestRunScore = runScore;
    localStorage.setItem(BEST_SCORE_KEY, String(bestRunScore));
    changed = true;
  }
  if (currentLevel > bestLevel) {
    bestLevel = currentLevel;
    localStorage.setItem(BEST_LEVEL_KEY, String(bestLevel));
    changed = true;
  }
  return changed;
}

hudBestRun.textContent = `${bestRunScore} / L${bestLevel}`;

function getSlaHudText() {
  if (currentLevelConfig.isBossLevel || !currentLevelConfig.slaEscalationRate) {
    return "SLA paused";
  }

  const priority = getSlaPriorityLabel();
  const dispatchInterval = getSlaDispatchInterval();
  const dispatchText = dispatchInterval > 0 && slaDispatchTimer > 0
    ? ` | Dispatch ${Math.ceil(slaDispatchTimer)}s`
    : priority === "OK"
      ? " | P3 at 35%"
      : " | Dispatch imminent";
  return `${priority} ${Math.round(slaEscalation)}%${dispatchText}`;
}

function updateSlaHudCard() {
  const card = hudBuffs.closest(".hud-card");
  if (!card) {
    return;
  }
  const priority = currentLevelConfig.isBossLevel ? "paused" : getSlaPriorityLabel().toLowerCase();
  card.classList.remove("sla-ok", "sla-p3", "sla-p2", "sla-p1", "sla-paused");
  card.classList.add(`sla-${priority}`);
  hudBuffs.textContent = getSlaHudText();
}

function syncHud() {
  updateBestRun();

  if (currentLevelConfig.isBossLevel && boss) {
    hudGoalLabel.textContent = `Manager: ${boss.name}`;
    hudScore.textContent = `${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`;
  } else {
    hudGoalLabel.textContent = "VMs Restored";
    hudScore.textContent = `${player.score} / ${currentLevelConfig.ticketTarget}`;
  }
  hudLives.textContent = String(player.lives);
  hudRunScore.textContent = String(runScore);
  hudBestRun.textContent = `${bestRunScore} / L${bestLevel}`;
  const activeEffects = [];
  if (player?.pickupSpeedTimer > 0) {
    activeEffects.push(`SPD +35% ${Math.ceil(player.pickupSpeedTimer)}s`);
  }
  if (player?.pickupDamageTimer > 0) {
    activeEffects.push(`DMG +1 ${Math.ceil(player.pickupDamageTimer)}s`);
  }
  if (player?.snapshotShield > 0) {
    activeEffects.push(`Shield x${player.snapshotShield}`);
  }
  const snapshotRollbackCount = getUpgradeCount("snapshotRollback");
  if (snapshotRollbackCount > 0) {
    activeEffects.push(`Rollback ${Math.max(0, snapshotRollbackCount - traitState.snapshotRollbacksUsed)}/${snapshotRollbackCount}`);
  }
  if (hasUpgrade("chainResolution") && traitState.chainTimer > 0 && traitState.chainKills > 0) {
    activeEffects.push(`Tempo x${Math.min(traitState.chainKills, 5)} ${Math.ceil(traitState.chainTimer)}s`);
  }
  if (player?.quickRecoveryTimer > 0) {
    activeEffects.push(`Recovery +${Math.ceil(player.quickRecoveryTimer)}s`);
  }
  if (player?.pressureResponseTimer > 0) {
    activeEffects.push(`Boss Tempo ${Math.ceil(player.pressureResponseTimer)}s`);
  }
  if (debugAutoAimEnabled) {
    activeEffects.push("Smart Assist TEST");
  }
  const buildStatsText = getBuildStatsText({ compact: true });
  hudStats.textContent = activeEffects.length > 0 ? `${buildStatsText} | ${activeEffects.join(" | ")}` : buildStatsText;
  updateSlaHudCard();
}

function showMessage(title, text) {
  messageTitle.textContent = title;
  messageText.textContent = text;
  hideMessageGuide();
  messageOverlay.classList.remove("hidden");
}

function showGameOverSla() {
  messageTitle.textContent = "Service Level Agreement Breach";
  messageText.textContent = "Cluster Crash ended in a production incident. Press R to start a new maintenance window.";
  renderGameOverSla();
  messageOverlay.classList.remove("hidden");
}

function scheduleLevelRestart(livesAfterRestart, reason = "damage") {
  if (pendingLevelRestart || gameState !== "playing") {
    return;
  }
  pendingLevelRestart = livesAfterRestart > 0
    ? {
        type: "restart",
        lives: livesAfterRestart,
        elapsed: 0,
        duration: 0.6,
        startCameraX: cameraX,
        targetCameraX: 0,
        reason,
      }
    : { type: "lost" };
  if (livesAfterRestart > 0) {
    gameState = "rewind";
    keys.clear();
    jumpQueued = false;
  }
}

function flushPendingLevelRestart() {
  if (!pendingLevelRestart) {
    return;
  }

  const pending = pendingLevelRestart;
  pendingLevelRestart = null;

  if (pending.type === "lost") {
    gameState = "lost";
    showGameOverSla();
    return;
  }

  respawnPlayerInLevel(pending.lives);
}

function updatePendingLevelRestart(dt) {
  if (!pendingLevelRestart || pendingLevelRestart.type !== "restart") {
    return;
  }

  pendingLevelRestart.elapsed += dt;
  const progress = Math.max(0, Math.min(1, pendingLevelRestart.elapsed / pendingLevelRestart.duration));
  const eased = 1 - ((1 - progress) * (1 - progress) * (1 - progress));
  cameraX = pendingLevelRestart.startCameraX + (pendingLevelRestart.targetCameraX - pendingLevelRestart.startCameraX) * eased;

  if (progress >= 1) {
    flushPendingLevelRestart();
  }
}

function respawnPlayerInLevel(preservedLives) {
  const respawnState = {
    lives: preservedLives,
    score: player.score,
    pickupSpeedTimer: player.pickupSpeedTimer,
    pickupDamageTimer: player.pickupDamageTimer,
    snapshotShield: player.snapshotShield,
    quickRecoveryTimer: player.quickRecoveryTimer,
    pressureResponseTimer: player.pressureResponseTimer,
    bossGraceTimer: player.bossGraceTimer,
  };

  player = makePlayer();
  player.lives = respawnState.lives;
  player.score = respawnState.score;
  player.pickupSpeedTimer = respawnState.pickupSpeedTimer;
  player.pickupDamageTimer = respawnState.pickupDamageTimer;
  player.snapshotShield = respawnState.snapshotShield;
  player.quickRecoveryTimer = respawnState.quickRecoveryTimer;
  player.pressureResponseTimer = respawnState.pressureResponseTimer;
  player.bossGraceTimer = respawnState.bossGraceTimer;
  player.invincibleTimer = 1.15;
  player.hurtTimer = 0.18;
  player.grounded = false;

  keyboards = [];
  userProjectiles = [];
  userDenialZones = [];
  bossProjectiles = [];
  bossMechanics = [];
  impactParticles = [];
  spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.75, "#74f7c4", 14);
  jumpQueued = false;
  cameraX = 0;
  gameState = "playing";
  syncHud();
}

function defeatUser(user, options = {}) {
  if (!user || user.defeated) {
    return;
  }

  user.defeated = true;
  user.deathTimer = options.deathTimer ?? 0.42;
  user.deathVy = options.deathVy ?? -randomBetween(180, 300);
  user.deathVx = options.deathVx ?? 0;
  runStats.enemiesKilled += 1;
  if (hasUpgrade("chainResolution")) {
    traitState.chainKills = Math.min(traitState.chainKills + 1, 5);
    traitState.chainTimer = 4.5;
  }
}

function getHazardCycleKey(zone) {
  return `${zone.kind}:${zone.hazardId}`;
}

function canHazardHitEntity(entity, zone, cycleIndex) {
  if (!entity.hazardCycles) {
    entity.hazardCycles = {};
  }
  const key = getHazardCycleKey(zone);
  if (entity.hazardCycles[key] === cycleIndex) {
    return false;
  }
  entity.hazardCycles[key] = cycleIndex;
  return true;
}

function resolveMovingHazardPush(entity, activeZone, zone, now, tuning = {}) {
  const entityBox = makeCollider(entity);
  const zoneBox = makeCollider(activeZone);
  const previousEntityBox = makeCollider({ ...entity, x: entity.prevX ?? entity.x });
  const colliderOffset = getEntityColliderOffset(entity);
  const dt = zone.lastTouchTime > 0 ? Math.min(0.05, (now - zone.lastTouchTime) / 1000) : 1 / 60;
  const pushDir = Math.sign(activeZone.vx || 0) || 1;
  const pushSpeed = Math.max(tuning.minPushSpeed ?? 160, Math.abs(activeZone.vx || 0) * (tuning.pushRatio ?? 0.65));
  let resolveSide = pushDir > 0 ? "right" : "left";

  if (previousEntityBox.x + previousEntityBox.w <= zoneBox.x + 1) {
    resolveSide = "left";
  } else if (previousEntityBox.x >= zoneBox.x + zoneBox.w - 1) {
    resolveSide = "right";
  } else {
    const leftPenetration = Math.max(0, entityBox.x + entityBox.w - zoneBox.x);
    const rightPenetration = Math.max(0, zoneBox.x + zoneBox.w - entityBox.x);
    resolveSide = leftPenetration <= rightPenetration ? "left" : "right";
    if (Math.abs(leftPenetration - rightPenetration) < 6) {
      resolveSide = pushDir > 0 ? "right" : "left";
    }
  }

  if (resolveSide === "left") {
    entity.x = zoneBox.x - entityBox.w - colliderOffset.x;
  } else {
    entity.x = zoneBox.x + zoneBox.w - colliderOffset.x;
  }

  entity.x += pushDir * pushSpeed * dt;
  entity.vx = moveTowards(
    entity.vx,
    pushDir * Math.max(tuning.minVelocity ?? 180, Math.abs(activeZone.vx || 0) * (tuning.velocityRatio ?? 0.7)),
    (tuning.accel ?? 1800) * dt,
  );
  entity.x = Math.max(0, Math.min(worldWidth - entity.w, entity.x));
  zone.lastTouchTime = now;
}

function damageUserFromHazard(user, zone, options = {}) {
  if (!user || user.defeated) {
    return;
  }

  user.hp -= options.damage ?? 1;
  user.hurtTimer = options.hurtTimer ?? 0.18;
  if (typeof options.knockVy === "number") {
    user.vy = Math.min(user.vy, options.knockVy);
    user.grounded = false;
  }
  spawnImpactParticles(
    user.x + user.w / 2,
    user.y + user.h * 0.45,
    zone.color,
    options.particleCount ?? 6,
    options.particleOptions || { speedMin: 110, speedMax: 240 },
  );
  if (user.hp <= 0) {
    defeatUser(user, {
      deathTimer: 0.4,
      deathVy: options.deathVy ?? -randomBetween(150, 240),
      deathVx: options.deathVx ?? randomBetween(-50, 50),
    });
  }
}

function applyHazardsToUser(user, now) {
  for (const zone of specialHazards) {
    const activeZone = getSpecialHazardRect(zone, now);
    if (!rectsOverlap(user, activeZone)) {
      continue;
    }

    if (zone.kind === "dataLeak") {
      user.slipTimer = Math.max(user.slipTimer || 0, 0.28);
      continue;
    }

    if (zone.kind === "cableMess") {
      user.snareTimer = Math.max(user.snareTimer || 0, 0.3);
      user.jumpDebuffTimer = Math.max(user.jumpDebuffTimer || 0, 0.3);
      continue;
    }

    if (zone.kind === "vent" && isVentHazardActive(zone, now)) {
      user.vy = Math.min(user.vy, -760);
      user.grounded = false;
      continue;
    }

    const config = SPECIAL_HAZARD_TYPES[zone.kind];
    const cycleIndex = config?.period ? Math.floor((now / 1000 + (zone.phaseOffset || 0)) / config.period) : 0;

    if (zone.kind === "static" && isStaticHazardActive(zone, now) && canHazardHitEntity(user, zone, cycleIndex)) {
      damageUserFromHazard(user, zone, { damage: 1, particleCount: 5 });
      continue;
    }

    if (zone.kind === "reboot" && isRebootHazardBurstActive(zone, now) && canHazardHitEntity(user, zone, cycleIndex)) {
      damageUserFromHazard(user, zone, {
        damage: 2,
        knockVy: -560,
        particleCount: 8,
        particleOptions: { speedMin: 150, speedMax: 320, sizeMin: 4, sizeMax: 8 },
      });
      continue;
    }

    if (zone.kind === "backupWindow") {
      resolveMovingHazardPush(user, activeZone, zone, now, {
        minPushSpeed: 150,
        pushRatio: 0.72,
        minVelocity: 180,
        velocityRatio: 0.78,
        accel: 1700,
      });
    }
  }
}

function rectsOverlap(a, b) {
  const boxA = makeCollider(a);
  const boxB = makeCollider(b);
  return boxA.x < boxB.x + boxB.w && boxA.x + boxA.w > boxB.x && boxA.y < boxB.y + boxB.h && boxA.y + boxA.h > boxB.y;
}

function isPlatformGapActiveAt(platform, x, now = performance.now()) {
  return specialHazards.some((zone) => (
    zone.kind === "diskFailure" &&
    zone.platformRef === platform &&
    isDiskFailureHazardActive(zone, now) &&
    x >= zone.x &&
    x <= zone.x + zone.w
  ));
}

function isPlatformDisabled(platform, now = performance.now()) {
  return specialHazards.some((zone) => (
    zone.kind === "diskFailure" &&
    zone.platformRef === platform &&
    isDiskFailureHazardActive(zone, now)
  ));
}

function hasGroundAhead(entity, dir, ahead = 22, drop = 18) {
  const box = makeCollider(entity);
  const probe = {
    x: dir > 0 ? box.x + box.w + ahead : box.x - ahead,
    y: box.y + box.h + 2,
    w: ahead,
    h: drop,
  };
  return platforms.some((platform) => rectsOverlap(probe, platform) && !isPlatformDisabled(platform));
}

function getSupportingPlatform(entity, tolerance = 10) {
  const box = makeCollider(entity);
  const footY = box.y + box.h;
  const centerX = box.x + box.w / 2;
  return platforms.find((platform) => {
    if (isPlatformDisabled(platform)) {
      return false;
    }
    const platformBox = makeCollider(platform);
    return (
      Math.abs(footY - platformBox.y) <= tolerance &&
      centerX >= platformBox.x - 6 &&
      centerX <= platformBox.x + platformBox.w + 6
    );
  }) || null;
}

function rememberPlayerSafeSpot() {
  if (!player || !player.grounded) {
    return;
  }
  const platform = getSupportingPlatform(player, 14);
  if (!platform || isPlatformDisabled(platform)) {
    return;
  }

  const playerBox = makeCollider(player);
  const platformBox = makeCollider(platform);
  const colliderOffset = getEntityColliderOffset(player);
  player.lastSafeX = Math.max(platform.x + 12, Math.min(platform.x + platform.w - player.w - 12, player.x));
  player.lastSafeY = platformBox.y - playerBox.h - colliderOffset.y;
}

function getGodModeRecoverySpot() {
  if (Number.isFinite(player?.lastSafeX) && Number.isFinite(player?.lastSafeY)) {
    return { x: player.lastSafeX, y: player.lastSafeY };
  }

  const targetX = Math.max(0, Math.min(worldWidth, cameraX + canvas.width * 0.35));
  let bestPlatform = null;
  let bestScore = Infinity;
  for (const platform of platforms) {
    if (isPlatformDisabled(platform) || platform.w < player.w + 32) {
      continue;
    }
    const platformBox = makeCollider(platform);
    const platformCenterX = platformBox.x + platformBox.w / 2;
    const score = Math.abs(platformCenterX - targetX) + Math.abs(platformBox.y - GROUND_Y) * 0.35;
    if (score < bestScore) {
      bestScore = score;
      bestPlatform = platform;
    }
  }

  if (!bestPlatform) {
    return { x: levelStartSpawn.x, y: levelStartSpawn.y };
  }

  const platformBox = makeCollider(bestPlatform);
  const playerBox = makeCollider(player);
  const colliderOffset = getEntityColliderOffset(player);
  return {
    x: Math.max(bestPlatform.x + 12, Math.min(bestPlatform.x + bestPlatform.w - player.w - 12, targetX - player.w / 2)),
    y: platformBox.y - playerBox.h - colliderOffset.y,
  };
}

function recoverPlayerToSafeSpot(options = {}) {
  const recovery = getGodModeRecoverySpot();
  player.x = Math.max(0, Math.min(worldWidth - player.w, recovery.x));
  player.y = recovery.y;
  player.prevX = player.x;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.airJumpsRemaining = player.maxAirJumps;
  player.invincibleTimer = Math.max(player.invincibleTimer, options.invincibleDuration ?? 0.6);
  cameraX = Math.max(0, Math.min(player.x - canvas.width * 0.35, worldWidth - canvas.width));
  jumpQueued = false;
  spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.75, options.color || "#74f7c4", options.count || 12);
}

function recoverGodModeFall() {
  recoverPlayerToSafeSpot({ color: "#74f7c4", count: 12, invincibleDuration: 0.6 });
}

function trySnapshotRollbackFall() {
  const rollbackCount = getUpgradeCount("snapshotRollback");
  if (rollbackCount <= 0 || traitState.snapshotRollbacksUsed >= rollbackCount || player.lives <= 1) {
    return false;
  }

  traitState.snapshotRollbacksUsed += 1;
  player.lives -= 1;
  runStats.livesBurned += 1;
  player.hurtTimer = 0.18;
  applyDamageRecoveryUpgrades();
  markDamageReset();
  recoverPlayerToSafeSpot({ color: "#ffd166", count: 16, invincibleDuration: player.invincibleDuration + 0.35 });
  addScreenShake(4, 0.1);
  syncHud();
  return true;
}

function willTouchFirewall(entity, dir, ahead = 18) {
  const box = makeCollider(entity);
  const probe = {
    x: box.x + dir * ahead,
    y: box.y + 6,
    w: box.w,
    h: box.h,
  };
  return firewallZones.some((zone) => rectsOverlap(probe, zone));
}

function pickSafeUserSpawnX(platform, variant, hazardZone) {
  const leftX = platform.x + 24;
  const rightX = platform.x + platform.w - variant.w - 24;

  if (!hazardZone) {
    return Math.random() > 0.5 ? leftX : rightX;
  }

  const leftProbe = {
    x: leftX,
    y: platform.y - variant.h,
    w: variant.w,
    h: variant.h,
    hitbox: variant.hitbox,
  };

  return rectsOverlap(leftProbe, hazardZone) ? rightX : leftX;
}

function variantHasSupportBehavior(variant) {
  return !!variant.behavior?.support?.enabled;
}

function variantCanEscortSupport(variant) {
  return !variantHasSupportBehavior(variant) && !variant.behavior?.popup?.enabled;
}

function spawnUserFromVariant(platform, variant, spawnX, enemyScaling, options = {}) {
  const scaledHp = getScaledUserHp(variant, enemyScaling);
  const user = {
    x: spawnX,
    y: platform.y - variant.h,
    prevX: spawnX,
    spawnX,
    spawnY: platform.y - variant.h,
    w: variant.w,
    h: variant.h,
    vy: 0,
    kind: variant.kind,
    hp: scaledHp,
    maxHp: scaledHp,
    jumpPower: variant.jumpPower > 0 ? variant.jumpPower + enemyScaling.jumpBonus : 0,
    armor: (variant.armor || 0) + (variant.behavior?.hpScaling === "heavy" ? enemyScaling.armorBonus : 0),
    maxDamagePerHit: variant.maxDamagePerHit || null,
    motionPhase: variant.motionPhase || 0,
    motionStyle: variant.motionStyle ? { ...variant.motionStyle } : null,
    behavior: variant.behavior ? structuredClone(variant.behavior) : null,
    jumpTimer: randomBetween(0.5, 1.4),
    shootTimer: randomBetween(1.0, 2.4),
    slipTimer: 0,
    snareTimer: 0,
    jumpDebuffTimer: 0,
    hazardCycles: {},
    shootCooldownMultiplier: enemyScaling.shootCooldownMultiplier * (currentLevelConfig.enemyShootCooldownMultiplier || 1),
    projectileSpeedMultiplier: enemyScaling.projectileSpeedMultiplier,
    tint: variant.tint,
    grounded: false,
    hitbox: variant.hitbox,
    spriteKey: pickLoadedSpriteVariant(variant.spriteKey),
    assetColliderKey: null,
    assetColliderOptions: { alignY: "bottom" },
    minX: platform.x + 12,
    maxX: platform.x + platform.w - variant.w - 12,
    speed: randomInt(currentLevelConfig.minUserSpeed, currentLevelConfig.maxUserSpeed) * variant.speedFactor * enemyScaling.speedMultiplier,
    baseSpeed: 0,
    dir: options.dir || (Math.random() > 0.5 ? 1 : -1),
    supportGroupId: options.supportGroupId || null,
  };
  user.baseSpeed = user.speed;
  resetUserBehaviorTimers(user);
  user.assetColliderKey = user.spriteKey;
  if (hasUpgrade("maintenanceWindow")) {
    user.snareTimer = Math.max(user.snareTimer, 2.0 + getUpgradeCount("maintenanceWindow") * 0.6);
  }
  if (hasUpgrade("outOfOffice") && getUserRangedBehavior(user).enabled) {
    const outOfOfficeMultiplier = 1 + getUpgradeCount("outOfOffice") * 0.22;
    user.shootCooldownMultiplier *= outOfOfficeMultiplier;
    user.shootTimer *= outOfOfficeMultiplier;
  }
  users.push(user);
  return user;
}

function spawnSupportUserGroup(platform, supportVariant, unlockedVariants, enemyScaling, hazardZone, themeTuning = getThemeTuning()) {
  const escortPool = unlockedVariants.filter(variantCanEscortSupport);
  const escortVariant = pickWeighted(escortPool.length ? escortPool : unlockedVariants, (entry) => getThemeWeightedEnemySpawnWeight(entry, themeTuning));
  const supportFirst = Math.random() > 0.5;
  const supportX = supportFirst
    ? platform.x + 28
    : platform.x + platform.w - supportVariant.w - 28;
  const escortX = supportFirst
    ? Math.min(platform.x + platform.w - escortVariant.w - 28, supportX + supportVariant.w + 64)
    : Math.max(platform.x + 28, supportX - escortVariant.w - 64);
  const supportProbe = {
    x: supportX,
    y: platform.y - supportVariant.h,
    w: supportVariant.w,
    h: supportVariant.h,
    hitbox: supportVariant.hitbox,
  };
  const safeSupportX = hazardZone && rectsOverlap(supportProbe, hazardZone)
    ? platform.x + platform.w - supportVariant.w - 28
    : supportX;
  const supportGroupId = `support-${performance.now().toFixed(1)}-${users.length}`;
  const supportUser = spawnUserFromVariant(platform, supportVariant, safeSupportX, enemyScaling, {
    dir: supportFirst ? 1 : -1,
    supportGroupId,
  });
  const escortUser = spawnUserFromVariant(platform, escortVariant, escortX, enemyScaling, {
    dir: supportFirst ? -1 : 1,
    supportGroupId,
  });
  supportUser.minX = Math.max(supportUser.minX, Math.min(supportUser.x, escortUser.x) - 70);
  supportUser.maxX = Math.min(supportUser.maxX, Math.max(supportUser.x, escortUser.x) + 90);
  escortUser.minX = Math.max(escortUser.minX, Math.min(supportUser.x, escortUser.x) - 70);
  escortUser.maxX = Math.min(escortUser.maxX, Math.max(supportUser.x, escortUser.x) + 90);
}

function userHasNearbySupportTarget(supportUser) {
  const supportBehavior = getUserSupportBehavior(supportUser);
  const range = supportBehavior.range || 220;
  return users.some((candidate) => {
    if (candidate === supportUser || candidate.defeated || getUserSupportBehavior(candidate).enabled || getUserPopupBehavior(candidate).enabled) {
      return false;
    }
    const dx = (candidate.x + candidate.w / 2) - (supportUser.x + supportUser.w / 2);
    const dy = (candidate.y + candidate.h / 2) - (supportUser.y + supportUser.h / 2);
    return Math.hypot(dx, dy) <= range * 0.72;
  });
}

function ensureSupportEnemiesHaveEscorts(enemyScaling) {
  const themeTuning = getThemeTuning(currentLevelConfig.theme);
  const unlockedVariants = USER_VARIANTS.filter((variant) => currentLevel >= (variant.behavior?.unlockLevel || 1));
  const escortPool = unlockedVariants.filter(variantCanEscortSupport);

  for (const supportUser of [...users]) {
    if (supportUser.defeated || !getUserSupportBehavior(supportUser).enabled || userHasNearbySupportTarget(supportUser)) {
      continue;
    }

    const supportPlatform = getSupportingPlatform(supportUser, 18);
    if (!supportPlatform || supportPlatform.w < 280) {
      continue;
    }

    const escortVariant = pickWeighted(escortPool.length ? escortPool : unlockedVariants, (entry) => getThemeWeightedEnemySpawnWeight(entry, themeTuning));
    if (!escortVariant) {
      continue;
    }

    const escortOnRight = supportUser.x + supportUser.w / 2 < supportPlatform.x + supportPlatform.w / 2;
    const desiredX = escortOnRight
      ? supportUser.x + supportUser.w + 54
      : supportUser.x - escortVariant.w - 54;
    const escortX = Math.max(
      supportPlatform.x + 24,
      Math.min(desiredX, supportPlatform.x + supportPlatform.w - escortVariant.w - 24),
    );
    const supportGroupId = supportUser.supportGroupId || `support-fix-${performance.now().toFixed(1)}-${users.length}`;
    supportUser.supportGroupId = supportGroupId;
    const escortUser = spawnUserFromVariant(supportPlatform, escortVariant, escortX, enemyScaling, {
      dir: escortOnRight ? -1 : 1,
      supportGroupId,
    });

    const patrolLeft = Math.max(supportPlatform.x + 12, Math.min(supportUser.x, escortUser.x) - 76);
    const patrolRight = Math.min(supportPlatform.x + supportPlatform.w - 12, Math.max(supportUser.x + supportUser.w, escortUser.x + escortUser.w) + 76);
    supportUser.minX = Math.max(supportUser.minX, patrolLeft);
    supportUser.maxX = Math.min(supportUser.maxX, patrolRight - supportUser.w);
    escortUser.minX = Math.max(escortUser.minX, patrolLeft);
    escortUser.maxX = Math.min(escortUser.maxX, patrolRight - escortUser.w);
  }
}

function getSlaDispatchVariants() {
  const unlockedVariants = USER_VARIANTS.filter((variant) => currentLevel >= (variant.behavior?.unlockLevel || 1));
  const allowedKinds = slaPriorityTier >= 3
    ? ["spamCaller", "ticketSpammer", "escalationUser", "vip", "jumper", "walker"]
    : slaPriorityTier === 2
      ? ["spamCaller", "ticketSpammer", "escalationUser", "jumper", "walker"]
      : ["spamCaller", "jumper", "walker"];
  return unlockedVariants.filter((variant) => (
    allowedKinds.includes(variant.kind) &&
    !variantHasSupportBehavior(variant) &&
    !variant.behavior?.popup?.enabled
  ));
}

function getSlaDispatchPlatform(variant) {
  const playerCenterX = player.x + player.w / 2;
  const playerPlatform = getSupportingPlatform(player, 18);
  const candidates = platforms.filter((platform) => {
    if (isPlatformDisabled(platform) || platform.w < Math.max(250, variant.w + 150)) {
      return false;
    }
    const platformBox = makeCollider(platform);
    const visibleEnough = platformBox.x + platformBox.w >= cameraX - 40 && platformBox.x <= cameraX + canvas.width + 120;
    const reachableBand = Math.abs(platformBox.y - player.y) < 260;
    return visibleEnough && reachableBand;
  });

  if (playerPlatform && candidates.includes(playerPlatform)) {
    const platformBox = makeCollider(playerPlatform);
    const roomLeft = playerCenterX - platformBox.x;
    const roomRight = platformBox.x + platformBox.w - playerCenterX;
    if (Math.max(roomLeft, roomRight) > variant.w + 170) {
      return playerPlatform;
    }
  }

  return pickWeighted(candidates, (platform) => {
    const platformCenter = platform.x + platform.w / 2;
    const distance = Math.abs(platformCenter - playerCenterX);
    const aheadBonus = platformCenter > playerCenterX ? 1.45 : 1;
    return aheadBonus / Math.max(0.6, distance / 520);
  });
}

function spawnSlaIncidentDispatch(options = {}) {
  if (slaPriorityTier <= 0 || currentLevelConfig.isBossLevel) {
    return false;
  }

  const visibleActiveUsers = users.filter((user) => !user.defeated && isEntityOnScreen(user, 140)).length;
  const maxVisibleUsers = 3 + slaPriorityTier * 2;
  if (!options.force && visibleActiveUsers >= maxVisibleUsers) {
    return false;
  }

  const variants = getSlaDispatchVariants();
  if (!variants.length) {
    return false;
  }

  const themeTuning = getThemeTuning(currentLevelConfig.theme);
  const variant = pickWeighted(variants, (entry) => getThemeWeightedEnemySpawnWeight(entry, themeTuning));
  const platform = getSlaDispatchPlatform(variant);
  if (!variant || !platform) {
    return false;
  }

  const playerCenterX = player.x + player.w / 2;
  const spawnOnRight = playerCenterX < platform.x + platform.w / 2;
  const preferredX = spawnOnRight
    ? platform.x + platform.w - variant.w - 26
    : platform.x + 26;
  const spawnX = Math.max(platform.x + 20, Math.min(preferredX, platform.x + platform.w - variant.w - 20));
  const enemyScaling = getEnemyUpgradeScaling();
  const user = spawnUserFromVariant(platform, variant, spawnX, enemyScaling, { dir: spawnOnRight ? -1 : 1 });
  user.slaDispatch = true;
  user.slaDispatchTimer = 1.0;
  user.minX = Math.max(user.minX, platform.x + 12);
  user.maxX = Math.min(user.maxX, platform.x + platform.w - user.w - 12);
  spawnSystemParticles(user.x + user.w / 2, user.y + user.h * 0.55, slaPriorityTier >= 3 ? "#ff5b6e" : "#ffd166", 12 + slaPriorityTier * 3, { speedMin: 90, speedMax: 230 });
  return true;
}

function updateSlaDispatch(dt) {
  const interval = getSlaDispatchInterval();
  if (interval <= 0 || slaStabilizedTimer > 0) {
    slaDispatchTimer = interval;
    return;
  }

  slaDispatchTimer = Math.max(0, slaDispatchTimer - dt);
  if (slaDispatchTimer > 0) {
    return;
  }

  spawnSlaIncidentDispatch({ force: true });
  slaDispatchTimer = interval;
}

function resolvePlatforms(entity, axis, previousValue, options = {}) {
  const collision = { hit: false, side: null };
  if (axis === "y") {
    entity.grounded = false;
  }

  for (const platform of platforms) {
    if (axis === "x" && options.ignoreKinds && options.ignoreKinds.has(platform.kind)) {
      continue;
    }
    if (axis === "y" && entity.vy < 0 && options.ignoreCeilingKinds && options.ignoreCeilingKinds.has(platform.kind)) {
      continue;
    }

    const entityBox = makeCollider(entity);
    const platformBox = makeCollider(platform);
    if (isPlatformDisabled(platform)) {
      continue;
    }

    if (
      entityBox.x >= platformBox.x + platformBox.w ||
      entityBox.x + entityBox.w <= platformBox.x ||
      entityBox.y >= platformBox.y + platformBox.h ||
      entityBox.y + entityBox.h <= platformBox.y
    ) {
      continue;
    }

    if (axis === "x") {
      const previousEntityBox = makeCollider({ ...entity, x: previousValue });
      const wasOnPlatformTop = previousEntityBox.y + previousEntityBox.h <= platformBox.y + 3;
      const isStillAtPlatformTop = entityBox.y + entityBox.h <= platformBox.y + 8;
      if (wasOnPlatformTop && isStillAtPlatformTop) {
        continue;
      }

      collision.hit = true;
      const colliderOffset = getEntityColliderOffset(entity);
      if (entity.vx > 0) {
        entity.x = platformBox.x - entityBox.w - colliderOffset.x;
        collision.side = "right";
      } else if (entity.vx < 0) {
        entity.x = platformBox.x + platformBox.w - colliderOffset.x;
        collision.side = "left";
      } else {
        entity.x = previousValue;
      }
      entity.vx = 0;
    }

    if (axis === "y") {
      collision.hit = true;
      const colliderOffset = getEntityColliderOffset(entity);
      if (entity.vy > 0) {
        entity.y = platformBox.y - entityBox.h - colliderOffset.y;
        entity.grounded = true;
        collision.side = "floor";
        if (typeof entity.airJumpsRemaining === "number") {
          entity.airJumpsRemaining = entity.maxAirJumps;
        }
      } else if (entity.vy < 0) {
        entity.y = platformBox.y + platformBox.h - colliderOffset.y;
        collision.side = "ceiling";
      } else {
        entity.y = previousValue;
      }
      entity.vy = 0;
    }
  }

  return collision;
}

function getBossSourceGraceDuration(source) {
  if (source === "bossMechanic") {
    return 1.9;
  }
  if (source === "bossProjectile") {
    return 1.65;
  }
  if (source === "boss") {
    return 1.5;
  }
  return 0;
}

function getBossSourceInvincibilityDuration(source) {
  if (source === "bossMechanic") {
    return 2.2;
  }
  if (source === "bossProjectile") {
    return 1.9;
  }
  if (source === "boss") {
    return 1.75;
  }
  return 0;
}

function applyDamageRecoveryUpgrades(extraReflexInvincibility = 0) {
  const quickRecoveryCount = getUpgradeCount("quickRecovery");
  if (quickRecoveryCount > 0) {
    player.quickRecoveryTimer = Math.max(player.quickRecoveryTimer, 2.0 + quickRecoveryCount * 0.5);
  }

  const vMotionReflexCount = getUpgradeCount("vMotionReflex");
  if (vMotionReflexCount > 0) {
    player.quickRecoveryTimer = Math.max(player.quickRecoveryTimer, 3.0 + vMotionReflexCount * 0.6);
    player.invincibleTimer = Math.max(player.invincibleTimer, 0.85 + vMotionReflexCount * 0.2 + extraReflexInvincibility);
  }
}

function damagePlayer(options = {}) {
  if (godModeEnabled) {
    return;
  }
  if (player.invincibleTimer > 0 || gameState !== "playing" || pendingLevelRestart) {
    return;
  }

  const source = options.source || "generic";
  const isBossSource = source === "boss" || source === "bossProjectile" || source === "bossMechanic";
  const bossGraceDuration = getBossSourceGraceDuration(source);
  const bossInvincibilityDuration = getBossSourceInvincibilityDuration(source);

  if (isBossSource && player.bossGraceTimer > 0) {
    const managerialImmunityCount = getUpgradeCount("managerialImmunity");
    if (managerialImmunityCount > 0) {
      player.invincibleTimer = Math.max(player.invincibleTimer, managerialImmunityCount * 0.45);
    }
    return;
  }

  if (hasUpgrade("escalationShield") && currentLevelConfig.isBossLevel && source === "bossProjectile" && !traitState.escalationShieldUsed) {
    traitState.escalationShieldUsed = true;
    spawnImpactParticles(player.x + player.w / 2, player.y + player.h * 0.45, "#74f7c4", 10, { speedMin: 120, speedMax: 260 });
    addScreenShake(4, 0.08);
    return;
  }

  if (!options.ignoreShield && player.snapshotShield > 0) {
    player.snapshotShield -= 1;
    runStats.shieldPops += 1;
    player.invincibleTimer = 0.8;
    spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.45, "#74f7c4", 12, { speedMin: 100, speedMax: 260 });
    syncHud();
    return;
  }

  if (hasUpgrade("drPlan") && !traitState.drPlanUsed && player.lives <= 1) {
    traitState.drPlanUsed = true;
    player.invincibleTimer = Math.max(player.invincibleTimer, player.invincibleDuration + 0.2);
    player.hurtTimer = 0.18;
    applyDamageRecoveryUpgrades();
    spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.55, "#b98cff", 16, { speedMin: 90, speedMax: 250 });
    markDamageReset();
    syncHud();
    return;
  }

  if (hasUpgrade("emergencySnapshot") && !traitState.emergencySnapshotUsed && player.lives <= 1) {
    traitState.emergencySnapshotUsed = true;
    player.snapshotShield = Math.max(player.snapshotShield, 1);
    player.invincibleTimer = Math.max(player.invincibleTimer, player.invincibleDuration + 0.4);
    applyDamageRecoveryUpgrades(0.1);
    spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.55, "#ffd166", 16, { speedMin: 90, speedMax: 250 });
    markDamageReset();
    syncHud();
    return;
  }

  player.lives -= 1;
  runStats.livesBurned += 1;
  player.invincibleTimer = isBossSource
    ? Math.max(player.invincibleDuration, bossInvincibilityDuration)
    : player.invincibleDuration;
  player.hurtTimer = 0.28;
  const managerialImmunityCount = getUpgradeCount("managerialImmunity");
  player.bossGraceTimer = isBossSource
    ? bossGraceDuration + managerialImmunityCount * 0.45
    : 0;
  spawnImpactParticles(player.x + player.w / 2, player.y + player.h * 0.45, "#ff5b6e", 10, { speedMin: 120, speedMax: 320 });
  addScreenShake(isBossSource ? 6 : 8, isBossSource ? 0.14 : 0.18);
  applyDamageRecoveryUpgrades();
  markDamageReset();
  syncHud();

  if (player.lives <= 0) {
    gameState = "lost";
    showGameOverSla();
    return;
  }

  if (currentLevelConfig.isBossLevel) {
    player.x = Math.max(70, player.x - 180);
    player.y = Math.min(player.y, 280);
    player.vx = 0;
    player.vy = 0;
    cameraX = Math.max(0, Math.min(player.x - 180, worldWidth - canvas.width));
    return;
  }

  scheduleLevelRestart(player.lives, options.cause || "damage");
}

function simulateKeyboardPathClear(originX, originY, vx, vy, targetX, facing, projectileW, projectileH) {
  let sampleX = originX - projectileW / 2;
  let sampleY = originY - projectileH / 2;
  let sampleVx = vx;
  let sampleVy = vy;
  const timeStep = 1 / 60;
  const endX = targetX + facing * 18;

  for (let i = 0; i < 80; i += 1) {
    sampleX += sampleVx * timeStep;
    sampleY += sampleVy * timeStep;
    sampleVy = Math.min(900, sampleVy + 900 * timeStep);

    const probe = { x: sampleX, y: sampleY, w: projectileW, h: projectileH };
    for (const platform of platforms) {
      if (!isPlatformDisabled(platform) && rectsOverlap(probe, platform)) {
        return false;
      }
    }

    const centerX = sampleX + projectileW / 2;
    if ((facing > 0 && centerX >= endX) || (facing < 0 && centerX <= endX)) {
      return true;
    }
  }

  return false;
}

function getAutoAimTarget(facing, originX, originY, stats) {
  const playerCenterX = player.x + player.w / 2;
  const playerCenterY = player.y + player.h * 0.45;
  const candidates = [];

  if (boss && boss.hp > 0 && isEntityOnScreen(boss)) {
    const bossCenterX = boss.x + boss.w / 2;
    const bossCenterY = boss.y + boss.h * 0.38;
    if (
      Math.sign(bossCenterX - playerCenterX) === facing &&
      Math.abs(bossCenterX - playerCenterX) < 900 &&
      Math.abs(bossCenterY - playerCenterY) < 320
    ) {
      candidates.push({ entity: boss, x: bossCenterX, y: bossCenterY, score: Math.abs(bossCenterX - playerCenterX) + Math.abs(bossCenterY - playerCenterY) * 1.1 });
    }
  }

  for (const user of users) {
    if (!isUserActiveTarget(user) || !isEntityOnScreen(user)) {
      continue;
    }
    const targetX = user.x + user.w / 2;
    const targetY = user.y + user.h * 0.42;
    if (
      Math.sign(targetX - playerCenterX) === facing &&
      Math.abs(targetX - playerCenterX) < 860 &&
      Math.abs(targetY - playerCenterY) < 300
    ) {
      candidates.push({ entity: user, x: targetX, y: targetY, score: Math.abs(targetX - playerCenterX) + Math.abs(targetY - playerCenterY) });
    }
  }

  candidates.sort((a, b) => a.score - b.score);
  for (const candidate of candidates) {
    const dx = Math.max(40, Math.abs(candidate.x - originX));
    const dy = candidate.y - originY;
    const assistAngle = Math.max(-0.52, Math.min(0.2, Math.atan2(dy, dx)));
    const vx = facing * Math.cos(assistAngle) * stats.keyboardSpeed;
    const vy = Math.sin(assistAngle) * stats.keyboardSpeed * 0.62 + stats.keyboardLift * 0.92;

    if (simulateKeyboardPathClear(originX, originY, vx, vy, candidate.x, facing, stats.keyboardSize.w, stats.keyboardSize.h)) {
      return { ...candidate, vx, vy };
    }
  }

  return null;
}

function isEntityOnScreen(entity, padding = 80) {
  if (!entity) {
    return false;
  }
  const box = makeCollider(entity);
  return box.x + box.w >= cameraX - padding && box.x <= cameraX + canvas.width + padding;
}

function isKeyboardHomingTargetValid(target) {
  if (!target) {
    return false;
  }
  if (target === boss) {
    return !!(boss && boss.hp > 0 && isEntityOnScreen(boss));
  }
  return !target.defeated && target.hp > 0 && isEntityOnScreen(target);
}

function getKeyboardHomingTarget(keyboard) {
  if (isKeyboardHomingTargetValid(keyboard.homingTarget)) {
    return keyboard.homingTarget;
  }

  const keyboardCenterX = keyboard.x + keyboard.w / 2;
  const keyboardCenterY = keyboard.y + keyboard.h / 2;
  const candidates = [];

  if (boss && boss.hp > 0 && isEntityOnScreen(boss)) {
    const bossCenterX = boss.x + boss.w / 2;
    const bossCenterY = boss.y + boss.h * 0.38;
    candidates.push({
      entity: boss,
      score: Math.hypot(bossCenterX - keyboardCenterX, bossCenterY - keyboardCenterY) * 0.9,
    });
  }

  for (const user of users) {
    if (!isUserActiveTarget(user) || !isEntityOnScreen(user)) {
      continue;
    }
    const targetX = user.x + user.w / 2;
    const targetY = user.y + user.h * 0.42;
    candidates.push({
      entity: user,
      score: Math.hypot(targetX - keyboardCenterX, targetY - keyboardCenterY),
    });
  }

  candidates.sort((a, b) => a.score - b.score);
  keyboard.homingTarget = candidates[0]?.entity || null;
  return keyboard.homingTarget;
}

function getKeyboardThrowPlan(stats = getPlayerStats()) {
  if (!player) {
    return null;
  }

  const fallbackFacing = player.facing || 1;
  const playerCenterX = player.x + player.w / 2;
  const aimFacing = fallbackFacing;
  const originX = playerCenterX + aimFacing * (player.w * 0.24);
  const originY = player.y + player.h * 0.42;
  const spawnX = originX - stats.keyboardSize.w / 2;
  const spawnY = originY - stats.keyboardSize.h / 2;
  let vx = aimFacing * stats.keyboardSpeed;
  let vy = stats.keyboardLift;
  let assisted = false;

  if (hasUpgrade("autoAim")) {
    const target = getAutoAimTarget(aimFacing, originX, originY, stats);
    if (target) {
      vx = target.vx;
      vy = target.vy;
      assisted = true;
    }
  }

  return {
    assisted,
    facing: aimFacing,
    x: spawnX,
    y: spawnY,
    w: stats.keyboardSize.w,
    h: stats.keyboardSize.h,
    vx,
    vy,
    rotation: assisted ? Math.atan2(vy, vx) * 0.12 : (aimFacing > 0 ? 0.2 : -0.2),
  };
}

function throwKeyboard() {
  if (!player || gameState !== "playing" || player.throwCooldown > 0) {
    return;
  }

  const currentStats = getPlayerStats();
  const throwPlan = getKeyboardThrowPlan(currentStats);
  if (!throwPlan) {
    return;
  }

  runStats.keyboardsThrown += 1;
  player.facing = throwPlan.facing;
  const dir = throwPlan.facing;
  const pickupDamageBonus = player.pickupDamageTimer > 0 ? 1 : 0;
  const critChance = getUpgradeCount("critIncident") * 0.1;
  const critMultiplier = Math.random() < critChance ? 2 : 1;
  const pierceRemaining = (currentStats.basePierce || 0) + getUpgradeCount("piercingKeys");
  const bouncesRemaining = (currentStats.baseBounces || 0) + getUpgradeCount("bounceKeys");
  const baseKeyboard = {
    x: throwPlan.x,
    y: throwPlan.y,
    w: throwPlan.w,
    h: throwPlan.h,
    vx: throwPlan.vx,
    vy: throwPlan.vy,
    damage: Math.max(1, (currentStats.keyboardDamage + pickupDamageBonus) * critMultiplier),
    rotation: throwPlan.rotation,
    spin: dir * 12,
    hitbox: { left: 3, right: 3, top: 2, bottom: 2 },
    assetColliderKey: "keyboard",
    assetColliderOptions: { alignY: "center", mode: "cover" },
    pierceRemaining,
    bouncesRemaining,
    canReturn: hasUpgrade("datastoreEcho"),
    returnsRemaining: getUpgradeCount("datastoreEcho"),
    hasReturned: false,
    fragmentOnHit: hasUpgrade("fragmentingKeyboard"),
    fragmentCount: getUpgradeCount("fragmentingKeyboard") * 2,
    homingEnabled: hasUpgrade("autoAim"),
    homingTarget: throwPlan.assisted ? getAutoAimTarget(dir, throwPlan.x + throwPlan.w / 2, throwPlan.y + throwPlan.h / 2, currentStats)?.entity || null : null,
    armorPierce: currentStats.armorPierce || 0,
    hitSnareDuration: currentStats.hitSnareDuration || 0,
    bossFreezeDuration: currentStats.bossFreezeDuration || 0,
    hitTargets: new Set(),
  };
  keyboards.push(baseKeyboard);
  if (hasUpgrade("replyAll")) {
    const replyOffsets = getUpgradeCount("replyAll") > 1 ? [-2, -1, 1, 2] : [-1, 1];
    replyOffsets.forEach((offset) => {
      keyboards.push({
        ...baseKeyboard,
        x: baseKeyboard.x,
        y: baseKeyboard.y + offset * 5,
        w: Math.max(18, Math.round(baseKeyboard.w * 0.76)),
        h: Math.max(10, Math.round(baseKeyboard.h * 0.76)),
        vy: baseKeyboard.vy + offset * 78,
        damage: Math.max(1, Math.ceil(baseKeyboard.damage * 0.45)),
        spin: baseKeyboard.spin * 1.1,
        bouncesRemaining: 0,
        canReturn: false,
        returnsRemaining: 0,
        fragmentOnHit: false,
        fragmentCount: 0,
        pierceRemaining: Math.max(0, baseKeyboard.pierceRemaining - 1),
        armorPierce: baseKeyboard.armorPierce,
        hitSnareDuration: Math.max(0, baseKeyboard.hitSnareDuration * 0.6),
        bossFreezeDuration: Math.max(0, baseKeyboard.bossFreezeDuration * 0.7),
        hitTargets: new Set(),
      });
    });
  }
  player.throwCooldown = currentStats.keyboardCooldown;
  player.throwPoseTimer = 0.18;
}

function getEntityCenter(entity) {
  return {
    x: entity.x + entity.w / 2,
    y: entity.y + entity.h / 2,
  };
}

function getBotEnemyTarget() {
  if (boss && boss.hp > 0 && isEntityOnScreen(boss, 220)) {
    return { entity: boss, kind: "boss", priority: 0 };
  }

  const playerCenter = getEntityCenter(player);
  const candidates = users
    .filter((user) => isUserActiveTarget(user) && isEntityOnScreen(user, 260))
    .map((user) => {
      const center = getEntityCenter(user);
      const distance = Math.hypot(center.x - playerCenter.x, center.y - playerCenter.y);
      const supportBonus = variantHasSupportBehavior(user) ? -180 : 0;
      const blockingBonus = Math.abs(center.x - playerCenter.x) < 260 ? -120 : 0;
      return { entity: user, kind: "enemy", priority: distance + supportBonus + blockingBonus };
    })
    .sort((a, b) => a.priority - b.priority);

  return candidates[0] || null;
}

function getBotCollectibleTarget() {
  const playerCenter = getEntityCenter(player);
  const pickupCandidates = pickups
    .filter((pickup) => !pickup.taken && isEntityOnScreen(pickup, 120))
    .map((pickup) => {
      const y = pickup.renderY ?? pickup.y;
      const center = { x: pickup.x + pickup.w / 2, y: y + pickup.h / 2 };
      const distance = Math.hypot(center.x - playerCenter.x, center.y - playerCenter.y);
      return { entity: { ...pickup, y }, kind: "pickup", priority: distance - 220 };
    });

  const ticketCandidates = tickets
    .filter((ticket) => !ticket.taken)
    .map((ticket) => {
      const y = ticket.renderY ?? ticket.y;
      const center = { x: ticket.x + ticket.w / 2, y: y + ticket.h / 2 };
      const distance = Math.hypot(center.x - playerCenter.x, center.y - playerCenter.y);
      const behindPenalty = center.x < playerCenter.x - 80 ? 280 : 0;
      return { entity: { ...ticket, y }, kind: "ticket", priority: distance + behindPenalty };
    })
    .sort((a, b) => a.priority - b.priority);

  return [...pickupCandidates, ...ticketCandidates].sort((a, b) => a.priority - b.priority)[0] || null;
}

function getBotObjectiveTarget() {
  const enemyTarget = getBotEnemyTarget();
  if (enemyTarget && (enemyTarget.kind === "boss" || Math.abs(getEntityCenter(enemyTarget.entity).x - getEntityCenter(player).x) < 360)) {
    return enemyTarget;
  }

  const objectiveDone = currentLevelConfig.isBossLevel ? boss && boss.hp <= 0 : player.score >= currentLevelConfig.ticketTarget;
  if (objectiveDone) {
    return { entity: finishGate, kind: "exit", priority: 0 };
  }

  return getBotCollectibleTarget() || enemyTarget || { entity: finishGate, kind: "forward", priority: 0 };
}

function isBotHazardAhead(dir) {
  const box = makeCollider(player);
  const now = performance.now();
  const probe = {
    x: dir > 0 ? box.x + box.w - 2 : box.x - 54,
    y: box.y + 10,
    w: 56,
    h: box.h + 34,
  };

  if (firewallZones.some((zone) => rectsOverlap(probe, zone))) {
    return true;
  }

  return specialHazards.some((zone) => {
    if (zone.kind === "dataLeak" || zone.kind === "vent") {
      return false;
    }
    if (zone.kind === "static" && !isStaticHazardActive(zone, now)) {
      return false;
    }
    if (zone.kind === "diskFailure" && !isDiskFailureHazardActive(zone, now)) {
      return false;
    }
    if (zone.kind === "reboot" && !isRebootHazardBurstActive(zone, now)) {
      return false;
    }
    return rectsOverlap(probe, getSpecialHazardRect(zone, now));
  });
}

function maybeBotThrowAt(targetInfo) {
  if (!targetInfo || (targetInfo.kind !== "enemy" && targetInfo.kind !== "boss") || debugBotState.throwCooldown > 0) {
    return;
  }

  const targetCenter = getEntityCenter(targetInfo.entity);
  const playerCenter = getEntityCenter(player);
  const dx = targetCenter.x - playerCenter.x;
  const dy = targetCenter.y - playerCenter.y;
  const rangeX = targetInfo.kind === "boss" ? 560 : 390;
  if (Math.abs(dx) <= rangeX && Math.abs(dy) <= 210) {
    player.facing = dx >= 0 ? 1 : -1;
    throwKeyboard();
    debugBotState.throwCooldown = targetInfo.kind === "boss" ? 0.24 : 0.32;
  }
}

function maybeBotJump(direction, targetInfo, desiredDx) {
  if (debugBotState.jumpCooldown > 0) {
    return;
  }

  const targetCenter = targetInfo ? getEntityCenter(targetInfo.entity) : null;
  const playerCenter = getEntityCenter(player);
  const targetIsAbove = targetCenter && targetCenter.y < playerCenter.y - 52 && Math.abs(desiredDx) < 260;
  const needsGapJump = direction !== 0 && (!hasGroundAhead(player, direction, 36, 50) || willTouchFirewall(player, direction, 24) || isBotHazardAhead(direction));
  const isStuck = debugBotState.stuckTimer > 0.45;

  if (player.grounded && (targetIsAbove || needsGapJump || isStuck)) {
    jumpQueued = true;
    debugBotState.jumpCooldown = isStuck ? 0.32 : 0.42;
  } else if (!player.grounded && player.airJumpsRemaining > 0 && player.vy > 140 && (needsGapJump || targetIsAbove)) {
    jumpQueued = true;
    debugBotState.jumpCooldown = 0.55;
  }
}

function getDebugBotIntent(dt) {
  debugBotState.jumpCooldown = Math.max(0, debugBotState.jumpCooldown - dt);
  debugBotState.throwCooldown = Math.max(0, debugBotState.throwCooldown - dt);
  debugBotState.stuckTimer = Math.abs(player.x - debugBotState.lastX) < 1 && player.grounded
    ? debugBotState.stuckTimer + dt
    : 0;
  debugBotState.lastX = player.x;

  const targetInfo = getBotObjectiveTarget();
  maybeBotThrowAt(targetInfo);

  const targetCenter = targetInfo ? getEntityCenter(targetInfo.entity) : { x: player.x + 220, y: player.y };
  const playerCenter = getEntityCenter(player);
  const desiredDx = targetCenter.x - playerCenter.x;
  let direction = Math.abs(desiredDx) < 18 && targetInfo?.kind !== "boss" ? 0 : Math.sign(desiredDx || debugBotState.direction || 1);

  if (player.x < 24) {
    direction = 1;
  } else if (player.x + player.w > worldWidth - 24) {
    direction = -1;
  } else if (debugBotState.stuckTimer > 0.9) {
    direction = -(debugBotState.direction || 1);
    debugBotState.stuckTimer = 0.2;
  }

  maybeBotJump(direction, targetInfo, desiredDx);
  debugBotState.direction = direction || debugBotState.direction || 1;

  return {
    moveLeft: direction < 0,
    moveRight: direction > 0,
  };
}

function getPlayerIntent(dt) {
  if (debugBotEnabled && gameState === "playing" && player) {
    return getDebugBotIntent(dt);
  }

  return {
    moveLeft: keys.has("ArrowLeft") || keys.has("a") || keys.has("A"),
    moveRight: keys.has("ArrowRight") || keys.has("d") || keys.has("D"),
  };
}

function tryCharacterJump(entity, jumpForce) {
  if (entity.grounded) {
    entity.vy = -jumpForce;
    entity.grounded = false;
    return true;
  }

  if (entity.airJumpsRemaining > 0) {
    entity.vy = -jumpForce;
    entity.airJumpsRemaining -= 1;
    return true;
  }

  return false;
}

function getUserJumpBehavior(user) {
  return user.behavior?.jump || { enabled: false };
}

function getUserRangedBehavior(user) {
  return user.behavior?.ranged || { enabled: false };
}

function getUserSupportBehavior(user) {
  return user.behavior?.support || { enabled: false };
}

function getUserBurstBehavior(user) {
  return user.behavior?.burst || { enabled: false };
}

function getUserDenialBehavior(user) {
  return user.behavior?.denial || { enabled: false };
}

function getUserPopupBehavior(user) {
  return user.behavior?.popup || { enabled: false };
}

function getUserEscalationBehavior(user) {
  return user.behavior?.escalation || { enabled: false };
}

function isUserPopupHidden(user) {
  const popupBehavior = getUserPopupBehavior(user);
  return popupBehavior.enabled && user.popupState !== "active";
}

function isUserActiveTarget(user) {
  return !!user && !user.defeated && user.hp > 0 && !isUserPopupHidden(user);
}

function getUserSupportInfluence(user) {
  const influence = {
    speedMultiplier: 1,
    shootCooldownMultiplier: 1,
    armorBonus: 0,
  };

  for (const supportUser of users) {
    if (supportUser === user || !isUserActiveTarget(supportUser)) {
      continue;
    }
    const supportBehavior = getUserSupportBehavior(supportUser);
    if (!supportBehavior.enabled) {
      continue;
    }
    const dx = (supportUser.x + supportUser.w / 2) - (user.x + user.w / 2);
    const dy = (supportUser.y + supportUser.h / 2) - (user.y + user.h / 2);
    if (Math.hypot(dx, dy) > (supportBehavior.range || 220)) {
      continue;
    }
    influence.speedMultiplier *= supportBehavior.speedMultiplier || 1;
    influence.shootCooldownMultiplier *= supportBehavior.shootCooldownMultiplier || 1;
    influence.armorBonus += supportBehavior.armorBonus || 0;
  }

  influence.speedMultiplier = Math.min(influence.speedMultiplier, 1.38);
  influence.shootCooldownMultiplier = Math.max(influence.shootCooldownMultiplier, 0.62);
  influence.armorBonus = Math.min(influence.armorBonus, 2);
  return influence;
}

function getScaledUserHp(variant, enemyScaling) {
  const hpScaling = variant.behavior?.hpScaling || "light";
  const bonus = hpScaling === "heavy" ? enemyScaling.hpBonus : Math.min(enemyScaling.hpBonus, 1);
  return variant.hp + bonus;
}

function resetUserBehaviorTimers(user) {
  const jumpBehavior = getUserJumpBehavior(user);
  const rangedBehavior = getUserRangedBehavior(user);
  if (jumpBehavior.enabled) {
    user.jumpTimer = randomBetween(jumpBehavior.cooldownMin || 0.8, jumpBehavior.cooldownMax || 1.8);
  }
  if (rangedBehavior.enabled) {
    user.shootTimer = randomBetween(rangedBehavior.cooldownMin || 1.4, rangedBehavior.cooldownMax || 2.6) * (user.shootCooldownMultiplier || 1);
  }
  const burstBehavior = getUserBurstBehavior(user);
  if (burstBehavior.enabled) {
    user.burstTimer = 0;
    user.burstWindupTimer = 0;
    user.burstCooldown = randomBetween(burstBehavior.cooldownMin || 1.4, burstBehavior.cooldownMax || 2.7);
  }
  const denialBehavior = getUserDenialBehavior(user);
  if (denialBehavior.enabled) {
    user.denialTimer = randomBetween(denialBehavior.cooldownMin || 3.2, denialBehavior.cooldownMax || 5.0);
  }
  const popupBehavior = getUserPopupBehavior(user);
  if (popupBehavior.enabled) {
    user.popupState = "hidden";
    user.popupTimer = randomBetween(popupBehavior.hiddenMin || 1.0, popupBehavior.hiddenMax || 2.4);
    user.popupProgress = 0;
    user.popupHitThisCycle = false;
    user.y = user.spawnY + user.h + 8;
    user.colliderRect = { x: user.w / 2 - 1, y: user.h - 1, w: 2, h: 2 };
    user.grounded = true;
  }
  const escalationBehavior = getUserEscalationBehavior(user);
  if (escalationBehavior.enabled) {
    user.escalationTimer = escalationBehavior.interval || 5.2;
    user.escalationStacks = 0;
  }
}

function updatePlayer(dt) {
  const { moveLeft, moveRight } = getPlayerIntent(dt);
  const currentStats = getPlayerStats();

  let moveSpeed = currentStats.speed;
  if (player.pickupSpeedTimer > 0) {
    moveSpeed *= 1.35;
  }
  if (player.quickRecoveryTimer > 0) {
    moveSpeed *= 1.22;
  }
  if (player.pressureResponseTimer > 0) {
    moveSpeed *= 1.16;
  }
  if (player.snareTimer > 0) {
    moveSpeed *= 0.58;
  }
  let desiredVx = 0;
  if (moveLeft) {
    desiredVx = -moveSpeed;
    player.facing = -1;
  }
  if (moveRight) {
    desiredVx = moveSpeed;
    player.facing = 1;
  }
  if (player.slipTimer > 0) {
    const accel = player.grounded ? 1800 : 1100;
    const decel = player.grounded ? 760 : 520;
    player.vx = desiredVx !== 0
      ? moveTowards(player.vx, desiredVx, accel * dt)
      : moveTowards(player.vx, 0, decel * dt);
  } else {
    player.vx = player.grounded
      ? desiredVx
      : moveTowards(player.vx, desiredVx, 2800 * currentStats.airControlMultiplier * dt);
  }
  if (jumpQueued) {
    const jumpForce = player.jumpDebuffTimer > 0 ? currentStats.jump * 0.68 : currentStats.jump;
    tryCharacterJump(player, jumpForce);
    jumpQueued = false;
  }

  const previousX = player.x;
  player.prevX = previousX;
  player.x += player.vx * dt;
  player.x = Math.max(0, Math.min(player.x, worldWidth - player.w));
  resolvePlatforms(player, "x", previousX);

  player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * dt);
  const previousY = player.y;
  player.y += player.vy * dt;
  resolvePlatforms(player, "y", previousY);
  rememberPlayerSafeSpot();

  if (player.y > canvas.height + 160) {
    if (godModeEnabled) {
      recoverGodModeFall();
    } else if (!trySnapshotRollbackFall()) {
      damagePlayer({ ignoreShield: true, cause: "fall" });
    }
  }

  if (player.invincibleTimer > 0) {
    player.invincibleTimer -= dt;
  }
  if (player.throwCooldown > 0) {
    player.throwCooldown -= dt;
  }
  if (player.throwPoseTimer > 0) {
    player.throwPoseTimer -= dt;
  }
  if (player.hurtTimer > 0) {
    player.hurtTimer -= dt;
  }
  if (player.pickupSpeedTimer > 0) {
    player.pickupSpeedTimer -= dt;
  }
  if (player.pickupDamageTimer > 0) {
    player.pickupDamageTimer -= dt;
  }
  if (player.quickRecoveryTimer > 0) {
    player.quickRecoveryTimer -= dt;
  }
  if (player.pressureResponseTimer > 0) {
    player.pressureResponseTimer -= dt;
  }
  if (player.bossGraceTimer > 0) {
    player.bossGraceTimer -= dt;
  }
  if (traitState.chainTimer > 0) {
    traitState.chainTimer = Math.max(0, traitState.chainTimer - dt);
    if (traitState.chainTimer === 0) {
      traitState.chainKills = 0;
    }
  }
  if (player.slipTimer > 0) {
    player.slipTimer -= dt;
  }
  if (player.snareTimer > 0) {
    player.snareTimer -= dt;
  }
  if (player.jumpDebuffTimer > 0) {
    player.jumpDebuffTimer -= dt;
  }
}

function updateUserDenialZones(dt) {
  for (const zone of userDenialZones) {
    zone.warnTime = Math.max(0, zone.warnTime - dt);
    zone.life -= dt;
    if (zone.warnTime <= 0 && !zone.triggered) {
      zone.triggered = true;
      spawnImpactParticles(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.color, 8, { speedMin: 80, speedMax: 180 });
    }
    if (zone.warnTime <= 0 && rectsOverlap(player, zone)) {
      damagePlayer({ source: "enemyProjectile" });
    }
  }

  userDenialZones = userDenialZones.filter((zone) => zone.life > 0);
}

function placeUserDenialZone(user, denialBehavior) {
  const playerCenterX = player.x + player.w / 2;
  const supportingPlatform = getSupportingPlatform(player) || getSupportingPlatform(user);
  if (!supportingPlatform) {
    return;
  }

  const zoneW = denialBehavior.w || 104;
  const zoneH = denialBehavior.h || 44;
  const zoneX = Math.max(
    supportingPlatform.x + 8,
    Math.min(playerCenterX - zoneW / 2, supportingPlatform.x + supportingPlatform.w - zoneW - 8),
  );
  userDenialZones.push({
    x: zoneX,
    y: getPlatformTop(supportingPlatform) - zoneH,
    w: zoneW,
    h: zoneH,
    color: denialBehavior.color || "#b98cff",
    label: denialBehavior.label || "CHANGE",
    warnTime: denialBehavior.warnTime || 0.75,
    life: (denialBehavior.warnTime || 0.75) + (denialBehavior.duration || 1.55),
    hitbox: { left: 4, right: 4, top: 4, bottom: 4 },
  });
}

function updatePopupUser(user, popupBehavior, dt) {
  user.popupTimer -= dt;
  user.vx = 0;
  user.vy = 0;
  user.grounded = true;

  if (user.popupTimer <= 0) {
    if (user.popupState === "hidden") {
      user.popupState = "warning";
      user.popupTimer = popupBehavior.warningTime || 0.65;
    } else if (user.popupState === "warning") {
      user.popupState = "active";
      user.popupTimer = randomBetween(popupBehavior.activeMin || 1.1, popupBehavior.activeMax || 1.9);
      user.popupHitThisCycle = false;
      spawnImpactParticles(user.x + user.w / 2, user.spawnY + user.h * 0.48, user.tint, 10, { speedMin: 90, speedMax: 220 });
    } else {
      user.popupState = "hidden";
      user.popupTimer = randomBetween(popupBehavior.hiddenMin || 1.0, popupBehavior.hiddenMax || 2.4);
    }
  }

  if (user.popupState === "active") {
    user.y = moveTowards(user.y, user.spawnY - 16, 640 * dt);
    user.popupProgress = 1;
    user.colliderRect = { x: 8, y: 8, w: user.w - 16, h: user.h - 16 };
    if (!user.popupHitThisCycle && rectsOverlap(player, user)) {
      user.popupHitThisCycle = true;
      damagePlayer({ source: "enemy" });
      user.popupState = "hidden";
      user.popupTimer = randomBetween(popupBehavior.hiddenMin || 1.0, popupBehavior.hiddenMax || 2.4);
      user.y = user.spawnY + user.h + 8;
      user.colliderRect = { x: user.w / 2 - 1, y: user.h - 1, w: 2, h: 2 };
    }
  } else if (user.popupState === "warning") {
    user.y = user.spawnY + user.h * 0.18;
    user.popupProgress = 0.5 + Math.sin(performance.now() / 60) * 0.12;
    user.popupHitThisCycle = false;
    user.colliderRect = { x: user.w / 2 - 1, y: user.h - 1, w: 2, h: 2 };
  } else {
    user.y = user.spawnY + user.h + 8;
    user.popupProgress = 0;
    user.popupHitThisCycle = false;
    user.colliderRect = { x: user.w / 2 - 1, y: user.h - 1, w: 2, h: 2 };
  }
}

function updateUsers(dt) {
  const now = performance.now();
  const slaPressure = getSlaPressure();
  updateUserDenialZones(dt);

  for (const user of users) {
    const jumpBehavior = getUserJumpBehavior(user);
    const rangedBehavior = getUserRangedBehavior(user);
    const burstBehavior = getUserBurstBehavior(user);
    const denialBehavior = getUserDenialBehavior(user);
    const popupBehavior = getUserPopupBehavior(user);
    const escalationBehavior = getUserEscalationBehavior(user);

    if (user.defeated) {
      user.deathTimer = Math.max(0, (user.deathTimer || 0) - dt);
      user.deathVy = Math.min(1000, (user.deathVy || -260) + GRAVITY * 0.85 * dt);
      user.y += (user.deathVy || 0) * dt;
      user.x += (user.deathVx || 0) * dt;
      continue;
    }

    if (user.hurtTimer > 0) {
      user.hurtTimer -= dt;
    }
    if (user.attackPoseTimer > 0) {
      user.attackPoseTimer -= dt;
    }
    if (user.slipTimer > 0) {
      user.slipTimer -= dt;
    }
    if (user.snareTimer > 0) {
      user.snareTimer -= dt;
    }
    if (user.jumpDebuffTimer > 0) {
      user.jumpDebuffTimer -= dt;
    }

    if (popupBehavior.enabled) {
      updatePopupUser(user, popupBehavior, dt);
      continue;
    }

    if (burstBehavior.enabled) {
      if (user.burstTimer > 0) {
        user.burstTimer = Math.max(0, user.burstTimer - dt);
      } else if (user.burstWindupTimer > 0) {
        user.burstWindupTimer = Math.max(0, user.burstWindupTimer - dt);
        user.dir = player.x + player.w / 2 < user.x + user.w / 2 ? -1 : 1;
        if (user.burstWindupTimer <= 0) {
          user.burstTimer = burstBehavior.duration || 0.52;
          user.burstCooldown = randomBetween(burstBehavior.cooldownMin || 1.4, burstBehavior.cooldownMax || 2.7);
          spawnImpactParticles(user.x + user.w / 2, user.y + user.h * 0.72, user.tint || "#ff8b5b", 6, { speedMin: 70, speedMax: 170, gravity: 520 });
        }
      } else {
        user.burstCooldown = Math.max(0, (user.burstCooldown || 0) - dt);
        if (user.burstCooldown <= 0) {
          user.burstWindupTimer = burstBehavior.windup || 0.24;
          user.dir = player.x + player.w / 2 < user.x + user.w / 2 ? -1 : 1;
        }
      }
    }

    if (escalationBehavior.enabled && (user.escalationStacks || 0) < (escalationBehavior.maxStacks || 3) && isEntityOnScreen(user, 0)) {
      user.escalationTimer = Math.max(0, (user.escalationTimer || escalationBehavior.interval || 4.0) - dt);
      if (user.escalationTimer <= 0) {
        user.escalationStacks = (user.escalationStacks || 0) + 1;
        user.maxHp += escalationBehavior.hpPerStack || 1;
        user.hp += escalationBehavior.hpPerStack || 1;
        user.hurtTimer = Math.max(user.hurtTimer || 0, 0.18);
        user.escalationTimer = escalationBehavior.interval || 4.0;
        spawnImpactParticles(user.x + user.w / 2, user.y + user.h * 0.45, "#ff5b6e", 7, { speedMin: 80, speedMax: 180 });
      }
    }

    if (denialBehavior.enabled) {
      const distanceX = Math.abs((player.x + player.w / 2) - (user.x + user.w / 2));
      const distanceY = Math.abs((player.y + player.h / 2) - (user.y + user.h / 2));
      if (distanceX < 380) {
        user.dir = player.x + player.w / 2 < user.x + user.w / 2 ? 1 : -1;
      }
      user.denialTimer = Math.max(0, (user.denialTimer || 0) - dt);
      if (user.denialTimer <= 0 && distanceX < (denialBehavior.range || 760) && distanceY < 260) {
        user.attackPoseTimer = Math.max(user.attackPoseTimer || 0, 0.34);
        placeUserDenialZone(user, denialBehavior);
        user.denialTimer = randomBetween(denialBehavior.cooldownMin || 3.2, denialBehavior.cooldownMax || 5.0);
      }
    }

    if (user.grounded && (!hasGroundAhead(user, user.dir, 20, 24) || willTouchFirewall(user, user.dir, 14))) {
      if (jumpBehavior.enabled && jumpBehavior.edgeJump && user.jumpTimer <= (jumpBehavior.edgeWindow ?? 0)) {
        const jumpPower = user.jumpDebuffTimer > 0 ? user.jumpPower * 0.72 : user.jumpPower;
        user.vy = -jumpPower;
        user.grounded = false;
        user.jumpTimer = randomBetween(jumpBehavior.cooldownMin || 0.8, jumpBehavior.cooldownMax || 1.8);
      } else {
        user.dir *= -1;
      }
    }

    user.jumpTimer -= dt;
    user.shootTimer -= dt;
    if (jumpBehavior.enabled && user.grounded && user.jumpTimer <= 0) {
      const jumpPower = user.jumpDebuffTimer > 0 ? user.jumpPower * 0.72 : user.jumpPower;
      user.vy = -jumpPower;
      user.grounded = false;
      user.jumpTimer = randomBetween(jumpBehavior.cooldownMin || 0.8, jumpBehavior.cooldownMax || 1.8);
    }

    const supportInfluence = getUserSupportInfluence(user);
    const escalationSpeedMultiplier = escalationBehavior.enabled
      ? 1 + (user.escalationStacks || 0) * (escalationBehavior.speedPerStack || 0.18)
      : 1;
    const burstSpeedMultiplier = burstBehavior.enabled && user.burstTimer > 0 ? burstBehavior.speedMultiplier || 2.25 : 1;
    const burstWindupMultiplier = burstBehavior.enabled && user.burstWindupTimer > 0 ? burstBehavior.windupSpeedMultiplier || 0.25 : 1;
    const holdBackMultiplier = denialBehavior.enabled && Math.abs((player.x + player.w / 2) - (user.x + user.w / 2)) < 380 ? 0.55 : 1;
    let desiredVx = user.dir * (user.baseSpeed || user.speed) * slaPressure.speedMultiplier * supportInfluence.speedMultiplier * escalationSpeedMultiplier * burstSpeedMultiplier * burstWindupMultiplier * holdBackMultiplier * (user.snareTimer > 0 ? 0.58 : 1);
    if (user.slipTimer > 0) {
      const accel = user.grounded ? 1250 : 760;
      const decel = user.grounded ? 480 : 320;
      user.vx = desiredVx !== 0
        ? moveTowards(user.vx, desiredVx, accel * dt)
        : moveTowards(user.vx, 0, decel * dt);
    } else {
      user.vx = desiredVx;
    }
    const previousUserX = user.x;
    user.prevX = previousUserX;
    user.x += user.vx * dt;
    const userXCollision = resolvePlatforms(user, "x", previousUserX);

    if (userXCollision.hit) {
      user.dir *= -1;
      user.x += user.dir * 8;
      if (jumpBehavior.enabled && jumpBehavior.blockedJump && user.grounded && user.jumpTimer <= (jumpBehavior.blockedWindow ?? 0.6)) {
        const jumpPower = user.jumpDebuffTimer > 0 ? user.jumpPower * 0.72 : user.jumpPower;
        user.vy = -jumpPower;
        user.grounded = false;
        user.jumpTimer = randomBetween(jumpBehavior.cooldownMin || 0.8, jumpBehavior.cooldownMax || 1.8);
      }
    }

    if (user.x <= user.minX) {
      user.x = user.minX;
      user.dir = 1;
    }
    if (user.x >= user.maxX) {
      user.x = user.maxX;
      user.dir = -1;
    }

    user.vy = Math.min(MAX_FALL_SPEED, user.vy + GRAVITY * dt);
    const previousUserY = user.y;
    user.y += user.vy * dt;
    resolvePlatforms(user, "y", previousUserY);
    applyHazardsToUser(user, now);

    if (user.defeated) {
      continue;
    }

    if (user.y > canvas.height + 120 || firewallZones.some((zone) => rectsOverlap(user, zone))) {
      defeatUser(user, {
        deathTimer: 0.36,
        deathVy: -randomBetween(120, 220),
        deathVx: user.vx * 0.04,
      });
      continue;
    }

    if (
      rangedBehavior.enabled &&
      user.shootTimer <= 0 &&
      Math.abs(player.x - user.x) < (rangedBehavior.engageDistanceX || 680) &&
      Math.abs(player.y - user.y) < (rangedBehavior.engageDistanceY || 180)
    ) {
      fireUserRangedAttack(user, rangedBehavior);
      const supportShotMultiplier = getUserSupportInfluence(user).shootCooldownMultiplier;
      user.shootTimer = randomBetween(rangedBehavior.cooldownMin || 1.4, rangedBehavior.cooldownMax || 2.6) * (user.shootCooldownMultiplier || 1) * supportShotMultiplier * slaPressure.shootCooldownMultiplier;
    }

    if (rectsOverlap(player, user)) {
      damagePlayer({ source: "enemy" });
    }
  }

  users = users.filter((user) => !user.defeated || (user.deathTimer > 0 && user.y < canvas.height + 220));
}

function createUserProjectile(user, rangedBehavior, dir, overrides = {}) {
  return {
    x: user.x + user.w / 2 + dir * (rangedBehavior.originOffsetX || 10),
    y: user.y + (rangedBehavior.originY || 24),
    w: rangedBehavior.projectileW || 36,
    h: rangedBehavior.projectileH || 22,
    vx: overrides.vx ?? dir * randomInt(rangedBehavior.projectileSpeedMin || 340, rangedBehavior.projectileSpeedMax || 440) * (user.projectileSpeedMultiplier || 1) * getSlaPressure().projectileSpeedMultiplier,
    vy: overrides.vy ?? randomInt(rangedBehavior.projectileVyMin || -180, rangedBehavior.projectileVyMax || -80),
    gravity: overrides.gravity ?? rangedBehavior.projectileGravity ?? 820,
    color: rangedBehavior.projectileColor || "#7cf7ff",
    label: rangedBehavior.projectileLabel || "EMAIL",
    hitbox: rangedBehavior.projectileHitbox || { left: 5, right: 5, top: 4, bottom: 4 },
    hitEffect: rangedBehavior.hitEffect || null,
  };
}

function fireUserRangedAttack(user, rangedBehavior) {
  const dir = player.x < user.x ? -1 : 1;
  const slaProjectilePressure = getSlaPressure().projectileSpeedMultiplier;
  user.dir = dir;
  user.attackPoseTimer = rangedBehavior.attackPoseTime || 0.24;

  if (rangedBehavior.pattern === "ticketBurst") {
    const count = rangedBehavior.burstCount || 3;
    const spread = rangedBehavior.burstSpread || 0.16;
    for (let index = 0; index < count; index += 1) {
      const offset = index - (count - 1) / 2;
      const speed = randomInt(rangedBehavior.projectileSpeedMin || 220, rangedBehavior.projectileSpeedMax || 310) * (1 + offset * spread) * (user.projectileSpeedMultiplier || 1) * slaProjectilePressure;
      const vy = randomInt(rangedBehavior.projectileVyMin || -230, rangedBehavior.projectileVyMax || -80) + offset * 42;
      userProjectiles.push(createUserProjectile(user, rangedBehavior, dir, { vx: dir * speed, vy }));
    }
    return;
  }

  if (rangedBehavior.pattern === "aimed") {
    const originX = user.x + user.w / 2 + dir * (rangedBehavior.originOffsetX || 10);
    const originY = user.y + (rangedBehavior.originY || 24);
    const targetX = player.x + player.w / 2;
    const targetY = player.y + player.h * 0.45;
    const speed = randomInt(rangedBehavior.projectileSpeedMin || 520, rangedBehavior.projectileSpeedMax || 640) * (user.projectileSpeedMultiplier || 1) * slaProjectilePressure;
    const vx = dir * speed;
    const travelTime = Math.max(0.18, Math.abs(targetX - originX) / Math.max(1, Math.abs(vx)));
    const gravity = rangedBehavior.projectileGravity || 160;
    const aimedVy = (targetY - originY - 0.5 * gravity * travelTime * travelTime) / travelTime;
    const vy = Math.max(rangedBehavior.projectileVyMin ?? -220, Math.min(rangedBehavior.projectileVyMax ?? 160, aimedVy));
    userProjectiles.push(createUserProjectile(user, rangedBehavior, dir, { vx, vy, gravity }));
    return;
  }

  userProjectiles.push(createUserProjectile(user, rangedBehavior, dir));
}

function updateUserProjectiles(dt) {
  for (const projectile of userProjectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.vy = Math.min(900, projectile.vy + projectile.gravity * dt);

    if (projectile.y > canvas.height + 120 || projectile.x < -100 || projectile.x > worldWidth + 100) {
      projectile.expired = true;
      continue;
    }

    for (const platform of platforms) {
      if (rectsOverlap(projectile, platform)) {
        projectile.expired = true;
        break;
      }
    }

    if (!projectile.expired && rectsOverlap(player, projectile)) {
      projectile.expired = true;
      if (projectile.hitEffect === "snare") {
        player.snareTimer = Math.max(player.snareTimer, hasUpgrade("momentumCache") ? 0.1 : 0.2);
        player.jumpDebuffTimer = Math.max(player.jumpDebuffTimer, 0.12);
        spawnImpactParticles(player.x + player.w / 2, player.y + player.h * 0.45, projectile.color, 5, { speedMin: 70, speedMax: 150 });
      } else {
        damagePlayer({ source: "enemyProjectile" });
      }
    }
  }

  userProjectiles = userProjectiles.filter((projectile) => !projectile.expired);
}

function spawnKeyboardFragments(keyboard) {
  if (!keyboard.fragmentOnHit || keyboard.fragmentSpawned) {
    return;
  }
  keyboard.fragmentSpawned = true;
  const fragmentCount = Math.max(2, keyboard.fragmentCount || 2);
  for (let i = 0; i < fragmentCount; i += 1) {
    const spreadIndex = i - (fragmentCount - 1) / 2;
    const dir = spreadIndex === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(spreadIndex);
    keyboards.push({
      x: keyboard.x,
      y: keyboard.y,
      w: Math.max(14, Math.round(keyboard.w * 0.62)),
      h: Math.max(8, Math.round(keyboard.h * 0.62)),
      vx: (keyboard.vx || 0) * 0.35 + spreadIndex * 115,
      vy: -260 + Math.abs(spreadIndex) * 34,
      damage: Math.max(1, Math.ceil(keyboard.damage * 0.45)),
      rotation: dir * 0.18,
      spin: dir * (10 + Math.abs(spreadIndex) * 1.5),
      hitbox: { left: 2, right: 2, top: 1, bottom: 1 },
      assetColliderKey: "keyboard",
      assetColliderOptions: { alignY: "center", mode: "cover" },
      pierceRemaining: 0,
      bouncesRemaining: 0,
      canReturn: false,
      hasReturned: true,
      returnsRemaining: 0,
      fragmentOnHit: false,
      hitTargets: new Set(),
    });
  }
}

function updateKeyboards(dt) {
  for (const keyboard of keyboards) {
    if (keyboard.homingEnabled) {
      const target = getKeyboardHomingTarget(keyboard);
      if (target) {
        const targetX = target.x + target.w / 2;
        const targetY = target.y + target.h * (target === boss ? 0.38 : 0.42);
        const dx = targetX - (keyboard.x + keyboard.w / 2);
        const dy = targetY - (keyboard.y + keyboard.h / 2);
        const distance = Math.max(24, Math.hypot(dx, dy));
        const currentSpeed = Math.max(420, Math.hypot(keyboard.vx, keyboard.vy));
        const desiredVx = (dx / distance) * currentSpeed;
        const desiredVy = (dy / distance) * currentSpeed;
        keyboard.vx = moveTowards(keyboard.vx, desiredVx, 3200 * dt);
        keyboard.vy = moveTowards(keyboard.vy, desiredVy, 2800 * dt);
        keyboard.rotation = Math.atan2(keyboard.vy, keyboard.vx) * 0.16;
      } else {
        keyboard.homingEnabled = false;
      }
    }

    keyboard.x += keyboard.vx * dt;
    keyboard.y += keyboard.vy * dt;
    keyboard.vy = Math.min(900, keyboard.vy + (keyboard.homingEnabled ? 180 : 900) * dt);
    if (!keyboard.homingEnabled) {
      keyboard.rotation += keyboard.spin * dt;
    }

    if (
      keyboard.y > canvas.height + 120 ||
      keyboard.x + keyboard.w < cameraX - 240 ||
      keyboard.x > cameraX + canvas.width + 240
    ) {
      if (keyboard.canReturn && (keyboard.returnsRemaining || 0) > 0) {
        keyboard.returnsRemaining -= 1;
        keyboard.hasReturned = true;
        keyboard.vx *= -0.88;
        keyboard.vy = -260;
      } else {
        keyboard.expired = true;
      }
      continue;
    }

    for (const platform of platforms) {
      if (keyboard.homingEnabled) {
        continue;
      }
      if (rectsOverlap(keyboard, platform)) {
        if (keyboard.bouncesRemaining > 0 && keyboard.vy > 20) {
          keyboard.y = getPlatformTop(platform) - keyboard.h;
          keyboard.vy = -Math.max(180, Math.abs(keyboard.vy) * 0.52);
          keyboard.vx *= 0.94;
          keyboard.bouncesRemaining -= 1;
        } else if (keyboard.canReturn && (keyboard.returnsRemaining || 0) > 0) {
          keyboard.returnsRemaining -= 1;
          keyboard.hasReturned = true;
          keyboard.vx *= -0.9;
          keyboard.vy = -220;
        } else {
          keyboard.expired = true;
        }
        break;
      }
    }

    if (keyboard.expired) {
      spawnKeyboardFragments(keyboard);
      continue;
    }

    for (const user of users) {
      if (!isUserActiveTarget(user)) {
        continue;
      }
      if (keyboard.hitTargets?.has(user)) {
        continue;
      }
      if (rectsOverlap(keyboard, user)) {
        const supportInfluence = getUserSupportInfluence(user);
        const effectiveArmor = Math.max(0, (user.armor || 0) + supportInfluence.armorBonus - (keyboard.armorPierce || 0));
        let appliedDamage = Math.max(1, keyboard.damage - effectiveArmor);
        if (user.maxDamagePerHit) {
          appliedDamage = Math.min(appliedDamage, user.maxDamagePerHit);
        }
        user.hp -= appliedDamage;
        keyboard.hitTargets?.add(user);
        user.hurtTimer = 0.22;
        if (keyboard.hitSnareDuration > 0) {
          user.snareTimer = Math.max(user.snareTimer || 0, keyboard.hitSnareDuration);
        }
        spawnImpactParticles(user.x + user.w / 2, user.y + user.h * 0.45, user.tint || "#ffb84d", user.hp <= 0 ? 10 : 6, {
          speedMin: 100,
          speedMax: user.hp <= 0 ? 300 : 220,
        });
        addScreenShake(user.hp <= 0 ? 6 : 3, user.hp <= 0 ? 0.14 : 0.08);
        if (user.hp <= 0) {
          defeatUser(user, {
            deathTimer: 0.42,
            deathVy: -randomBetween(180, 300),
            deathVx: keyboard.vx * 0.05,
          });
        }
        if (keyboard.fragmentOnHit) {
          spawnKeyboardFragments(keyboard);
        }
        if ((keyboard.pierceRemaining || 0) > 0) {
          keyboard.pierceRemaining -= 1;
        } else {
          keyboard.expired = true;
        }
        break;
      }
    }

    if (!keyboard.expired && boss && boss.hp > 0 && rectsOverlap(keyboard, boss)) {
      boss.hp -= keyboard.damage;
      boss.hurtTimer = 0.2;
      if (keyboard.bossFreezeDuration > 0) {
        boss.freezeTimer = Math.max(boss.freezeTimer || 0, keyboard.bossFreezeDuration);
      }
      const changeFreezeCount = getUpgradeCount("changeFreeze");
      if (changeFreezeCount > 0 && (boss.changeFreezeCooldown || 0) <= 0) {
        boss.freezeTimer = Math.max(boss.freezeTimer || 0, 0.45 + (changeFreezeCount - 1) * 0.14);
        boss.changeFreezeCooldown = Math.max(0.84, 1.0 - (changeFreezeCount - 1) * 0.08);
      }
      const pressureResponseCount = getUpgradeCount("pressureResponse");
      if (pressureResponseCount > 0 && !traitState.pressureResponseTriggered && boss.hp <= boss.maxHp * 0.5) {
        traitState.pressureResponseTriggered = true;
        player.pressureResponseTimer = Math.max(player.pressureResponseTimer, 6 + (pressureResponseCount - 1) * 2);
      }
      spawnImpactParticles(boss.x + boss.w / 2, boss.y + boss.h * 0.42, currentLevelConfig.theme.glow, boss.hp <= 0 ? 18 : 9, {
        speedMin: 110,
        speedMax: boss.hp <= 0 ? 360 : 260,
        sizeMin: 4,
        sizeMax: 9,
      });
      addScreenShake(boss.hp <= 0 ? 12 : 5, boss.hp <= 0 ? 0.28 : 0.12);
      if (keyboard.fragmentOnHit) {
        spawnKeyboardFragments(keyboard);
      }
      keyboard.expired = true;
      if (boss.hp <= 0 && !boss.scoreAwarded) {
        boss.scoreAwarded = true;
        boss.defeated = true;
        boss.deathTimer = 0.78;
        boss.deathVy = -320;
        boss.deathVx = keyboard.vx * 0.04;
        runStats.bossesDefeated += 1;
        runScore += 10;
      }
      syncHud();
    }
  }

  keyboards = keyboards.filter((keyboard) => !keyboard.expired);
}

function spawnBossProjectile(x, y, vx, vy, color, label, gravity = 1000, w = 42, h = 24, style = "alert", options = {}) {
  const spriteBaseKey = BOSS_PROJECTILE_SPRITES[style] || null;
  bossProjectiles.push({
    x,
    y,
    w,
    h,
    vx,
    vy,
    gravity,
    color,
    label,
    style,
    spriteKey: spriteBaseKey ? pickLoadedSpriteVariant(spriteBaseKey) : null,
    rotation: randomBetween(-0.14, 0.14),
    spin: randomBetween(-2.6, 2.6),
    hitbox: { left: 6, right: 6, top: 4, bottom: 4 },
    ...options,
  });
}

function getPlatformTop(platform) {
  const box = makeCollider(platform);
  return box.y;
}

function getBossArenaStandingPlatforms() {
  return platforms.filter((platform) => platform.w >= 180 && !isPlatformDisabled(platform));
}

function getPlatformCenterX(platform) {
  const box = makeCollider(platform);
  return box.x + box.w / 2;
}

function getPlatformHorizontalGap(a, b) {
  const aBox = makeCollider(a);
  const bBox = makeCollider(b);
  if (aBox.x + aBox.w < bBox.x) {
    return bBox.x - (aBox.x + aBox.w);
  }
  if (bBox.x + bBox.w < aBox.x) {
    return aBox.x - (bBox.x + bBox.w);
  }
  return 0;
}

function isBossPlatformTransitionReachable(fromPlatform, toPlatform) {
  if (!fromPlatform || !toPlatform || fromPlatform === toPlatform) {
    return false;
  }

  const fromBox = makeCollider(fromPlatform);
  const toBox = makeCollider(toPlatform);
  const rise = fromBox.y - toBox.y;
  const drop = toBox.y - fromBox.y;
  const gap = getPlatformHorizontalGap(fromPlatform, toPlatform);

  if (rise > 26) {
    return rise <= 220 && gap <= 320;
  }
  if (drop > 26) {
    return drop <= 300 && gap <= 260;
  }
  return gap <= 340;
}

function findBossPlatformPath(startPlatform, goalPlatform) {
  if (!startPlatform || !goalPlatform) {
    return null;
  }
  if (startPlatform === goalPlatform) {
    return [startPlatform];
  }

  const arenaPlatforms = getBossArenaStandingPlatforms();
  const queue = [startPlatform];
  const previous = new Map([[startPlatform, null]]);

  while (queue.length > 0) {
    const current = queue.shift();
    for (const nextPlatform of arenaPlatforms) {
      if (previous.has(nextPlatform)) {
        continue;
      }
      if (!isBossPlatformTransitionReachable(current, nextPlatform)) {
        continue;
      }
      previous.set(nextPlatform, current);
      if (nextPlatform === goalPlatform) {
        const path = [goalPlatform];
        let walk = current;
        while (walk) {
          path.unshift(walk);
          walk = previous.get(walk);
        }
        return path;
      }
      queue.push(nextPlatform);
    }
  }

  return null;
}

function getBossRoutePlan(bossPlatform, targetPlatform, bossCenterX) {
  if (!bossPlatform || !targetPlatform || bossPlatform === targetPlatform) {
    return null;
  }

  const path = findBossPlatformPath(bossPlatform, targetPlatform);
  if (!path || path.length < 2) {
    return null;
  }

  const nextPlatform = path[1];
  const bossBox = makeCollider(bossPlatform);
  const nextBox = makeCollider(nextPlatform);
  const nextCenterX = nextBox.x + nextBox.w / 2;
  const leftExitX = bossBox.x + 22;
  const rightExitX = bossBox.x + bossBox.w - 22;
  const leftScore = Math.abs(leftExitX - nextCenterX);
  const rightScore = Math.abs(rightExitX - nextCenterX);
  const targetX = leftScore <= rightScore ? leftExitX : rightExitX;
  const edgeDelta = targetX - bossCenterX;

  return {
    nextPlatform,
    targetCenterX: nextCenterX,
    targetX,
    edgeReached: Math.abs(edgeDelta) <= 30,
    moveDir: Math.sign(edgeDelta) || (targetX < bossCenterX ? -1 : 1),
    mode: nextBox.y > bossBox.y + 26 ? "drop" : "jump",
  };
}

function getBossMechanicRect(effect) {
  if (effect.kind === "syncBeam") {
    return {
      x: effect.x1,
      y: effect.y - effect.thickness / 2,
      w: effect.x2 - effect.x1,
      h: effect.thickness,
    };
  }
  if (effect.kind === "memoWall") {
    return { x: effect.x, y: effect.y, w: effect.w, h: effect.h };
  }
  if (effect.kind === "planLane") {
    return { x: effect.x - effect.w / 2, y: effect.y, w: effect.w, h: effect.h };
  }
  if (effect.kind === "priorityZone") {
    return { x: effect.x, y: effect.y, w: effect.w, h: effect.h };
  }
  return effect;
}

function getBossProjectileSpriteKey(profile) {
  const baseKey = BOSS_PROJECTILE_SPRITES[profile.projectileStyle];
  return baseKey ? pickLoadedSpriteVariant(baseKey) : null;
}

function bossUsesNormalProjectiles(profile) {
  return !["priorityZones", "rfcMarkers", "syncBeam", "memoWall", "planningLanes"].includes(profile.specialMechanic);
}

function getBossProjectilePressureDelay() {
  let maxDelay = 0;
  for (const effect of bossMechanics) {
    if (effect.kind === "priorityZone" || effect.kind === "syncBeam" || effect.kind === "planLane") {
      maxDelay = Math.max(maxDelay, effect.warnTime > 0 ? 0.55 : 0.82);
    } else if (effect.kind === "memoWall") {
      maxDelay = Math.max(maxDelay, 0.78);
    } else if (effect.kind === "rfcMarker") {
      maxDelay = Math.max(maxDelay, 0.46);
    }
  }
  return maxDelay;
}

function activateBossSpecial() {
  if (!boss || boss.hp <= 0) {
    return;
  }

  const { profile } = boss;
  const playerCenterX = player.x + player.w / 2;
  const arenaPlatforms = getBossArenaStandingPlatforms();
  const warnMultiplier = getBossWarningMultiplier();
  const projectileSpriteKey = getBossProjectileSpriteKey(profile);

  if (profile.specialMechanic === "priorityZones") {
    const candidates = arenaPlatforms.filter((platform) => platform.w >= 190);
    const targetPlatform = candidates.sort((a, b) => Math.abs((a.x + a.w / 2) - playerCenterX) - Math.abs((b.x + b.w / 2) - playerCenterX))[0];
    if (targetPlatform) {
      bossMechanics.push({
        kind: "priorityZone",
        x: targetPlatform.x + 16,
        y: getPlatformTop(targetPlatform) - 16,
        w: targetPlatform.w - 32,
        h: 16,
        warnTime: 1.2 * warnMultiplier,
        activeTime: 0.95,
        color: profile.projectileColor,
      });
    }
  } else if (profile.specialMechanic === "burstDash") {
    boss.aiMode = "chase";
    boss.aiTimer = 1.2;
    boss.dashBurstTimer = 0.42;
    boss.stateTimer = 0.3;
    boss.attackPoseTimer = 0.18;
  } else if (profile.specialMechanic === "rfcMarkers") {
    [-130, 0, 130].forEach((offsetX) => {
      const x = Math.max(80, Math.min(worldWidth - 80, playerCenterX + offsetX));
      bossMechanics.push({
        kind: "rfcMarker",
        x,
        y: GROUND_Y - 70,
        warnTime: 1.15 * warnMultiplier,
        color: profile.projectileColor,
      });
    });
  } else if (profile.specialMechanic === "bouncingBubble") {
    const dir = playerCenterX < boss.x + boss.w / 2 ? -1 : 1;
    spawnBossProjectile(
      boss.x + boss.w / 2 + dir * 10,
      boss.y + 36,
      dir * 300 * currentLevelConfig.bossAttackScale,
      -400,
      profile.projectileColor,
      profile.projectileLabel,
      1200,
      50,
      34,
      profile.projectileStyle,
      { bouncesRemaining: 1, burstOnStop: true },
    );
  } else if (profile.specialMechanic === "syncBeam") {
    const targetY = Math.max(170, Math.min(canvas.height - 130, player.y + player.h * 0.5));
    bossMechanics.push({
      kind: "syncBeam",
      x1: 110,
      x2: worldWidth - 110,
      y: targetY,
      thickness: 16,
      warnTime: 1.1 * warnMultiplier,
      activeTime: 0.75,
      color: profile.projectileColor,
    });
  } else if (profile.specialMechanic === "pursuitChain") {
    boss.pursuitTimer = 1.45;
    boss.aiMode = "chase";
    boss.aiTimer = 1.3;
    boss.attackPoseTimer = 0.16;
  } else if (profile.specialMechanic === "memoWall") {
    const dir = playerCenterX < boss.x + boss.w / 2 ? -1 : 1;
    bossMechanics.push({
      kind: "memoWall",
      x: boss.x + boss.w / 2 + dir * 20,
      y: GROUND_Y - 210,
      w: 54,
      h: 180,
      vx: dir * 200 * currentLevelConfig.bossAttackScale,
      color: profile.projectileColor,
      spriteKey: projectileSpriteKey || pickLoadedSpriteVariant("bossMemoProjectile"),
    });
  } else if (profile.specialMechanic === "precisionVolley") {
    const originX = boss.x + boss.w / 2;
    const originY = boss.y + 34;
    [-1, 0, 1].forEach((spread) => {
      const targetX = playerCenterX + spread * 36;
      const targetY = player.y + player.h * 0.5 + spread * 8;
      const dx = targetX - originX;
      const dy = targetY - originY;
      const distance = Math.max(60, Math.hypot(dx, dy));
      const speed = 480 * currentLevelConfig.bossAttackScale;
      spawnBossProjectile(
        originX,
        originY,
        (dx / distance) * speed,
        (dy / distance) * speed,
        profile.projectileColor,
        profile.projectileLabel,
        180,
        38,
        22,
        profile.projectileStyle,
      );
    });
  } else if (profile.specialMechanic === "planningLanes") {
    [-150, 0, 150].forEach((offsetX) => {
      const x = Math.max(70, Math.min(worldWidth - 70, playerCenterX + offsetX));
      bossMechanics.push({
        kind: "planLane",
        x,
        y: 40,
        w: 42,
        h: canvas.height - 110,
        warnTime: 1.18 * warnMultiplier,
        activeTime: 0.72,
        color: profile.projectileColor,
      });
    });
  }
}

function spawnBubbleBurst(projectile) {
  [-120, 0, 120].forEach((vy) => {
    spawnBossProjectile(
      projectile.x,
      projectile.y,
      Math.sign(projectile.vx || 1) * 220,
      vy,
      projectile.color,
      projectile.label,
      780,
      28,
      18,
      projectile.style,
    );
  });
}

function updateBossMechanics(dt) {
  const activeEffects = [];
  for (const effect of bossMechanics) {
    if (effect.kind === "priorityZone") {
      if (effect.warnTime > 0) {
        effect.warnTime -= dt;
      } else {
        effect.activeTime -= dt;
        if (rectsOverlap(player, getBossMechanicRect(effect))) {
          damagePlayer({ source: "bossMechanic" });
        }
      }
      if (effect.warnTime > 0 || effect.activeTime > 0) {
        activeEffects.push(effect);
      }
      continue;
    }

    if (effect.kind === "rfcMarker") {
      effect.warnTime -= dt;
      if (effect.warnTime <= 0 && !effect.triggered) {
        effect.triggered = true;
        spawnBossProjectile(effect.x, 32, 0, 260, boss.profile.projectileColor, "RFC", 760 * currentLevelConfig.bossAttackScale, 42, 26, "folder");
      }
      if (!effect.triggered) {
        activeEffects.push(effect);
      }
      continue;
    }

    if (effect.kind === "syncBeam") {
      if (effect.warnTime > 0) {
        effect.warnTime -= dt;
      } else {
        effect.activeTime -= dt;
        if (rectsOverlap(player, getBossMechanicRect(effect))) {
          damagePlayer({ source: "bossMechanic" });
        }
      }
      if (effect.warnTime > 0 || effect.activeTime > 0) {
        activeEffects.push(effect);
      }
      continue;
    }

    if (effect.kind === "memoWall") {
      effect.x += effect.vx * dt;
      if (rectsOverlap(player, getBossMechanicRect(effect))) {
        damagePlayer({ source: "bossMechanic" });
      }
      if (effect.x + effect.w > -140 && effect.x < worldWidth + 140) {
        activeEffects.push(effect);
      }
      continue;
    }

    if (effect.kind === "planLane") {
      if (effect.warnTime > 0) {
        effect.warnTime -= dt;
      } else {
        effect.activeTime -= dt;
        if (rectsOverlap(player, getBossMechanicRect(effect))) {
          damagePlayer({ source: "bossMechanic" });
        }
      }
      if (effect.warnTime > 0 || effect.activeTime > 0) {
        activeEffects.push(effect);
      }
    }
  }
  bossMechanics = activeEffects;
}

function snapBossToSafePlatform() {
  const bossCenterX = boss.x + boss.w / 2;
  const walkablePlatforms = platforms
    .filter((platform) => platform.w >= boss.w + 24)
    .map((platform) => {
      const platformBox = makeCollider(platform);
      return {
        platform,
        platformBox,
        score: Math.abs(platformBox.x + platformBox.w / 2 - bossCenterX) + Math.abs(platformBox.y - boss.lastSafeY) * 0.7,
      };
    })
    .sort((a, b) => a.score - b.score);

  const fallback = walkablePlatforms[0];
  if (!fallback) {
    boss.x = boss.spawnX;
    boss.y = boss.spawnY;
    boss.vx = -boss.profile.speed * currentLevelConfig.bossSpeedScale;
    boss.vy = 0;
    boss.stuckTimer = 0;
    boss.homeTimer = 0;
    return;
  }

  const { platformBox } = fallback;
  boss.x = Math.max(
    platformBox.x + 4,
    Math.min(player.x + player.w / 2 - boss.w / 2, platformBox.x + platformBox.w - boss.w - 4),
  );
  boss.y = platformBox.y - boss.h;
  boss.vx = (player.x < boss.x ? -1 : 1) * boss.profile.speed * currentLevelConfig.bossSpeedScale;
  boss.vy = 0;
  boss.grounded = true;
  boss.stuckTimer = 0;
  boss.homeTimer = 0.9;
  boss.dodgeTimer = 0.6;
  boss.lastSafeX = boss.x;
  boss.lastSafeY = boss.y;
}

function launchBossDropHop(dir, speed) {
  if (!boss || dir === 0) {
    return;
  }

  boss.x += dir * 6;
  boss.y -= 2;
  boss.vx = dir * speed;
  boss.vy = -Math.max(180, boss.jump * 0.38);
  boss.grounded = false;
}

function fireBossAttack() {
  const dir = player.x + player.w / 2 < boss.x + boss.w / 2 ? -1 : 1;
  const attackScale = currentLevelConfig.bossAttackScale;
  const { attackStyle, projectileColor, projectileLabel, projectileStyle } = boss.profile;
  const originX = boss.x + boss.w / 2 + dir * 12;
  const originY = boss.y + 34;
  boss.attackPoseTimer = 0.26;

  if (attackStyle === "triple") {
    [-220, -80, 80].forEach((vy) => spawnBossProjectile(originX, originY, dir * 390 * attackScale, vy, projectileColor, projectileLabel, 980, 44, 26, projectileStyle));
  } else if (attackStyle === "spread") {
    [-240, -150, -60, 30, 120].forEach((vy, index) => spawnBossProjectile(originX, originY, dir * (315 + index * 24) * attackScale, vy, projectileColor, projectileLabel, 920, 40, 24, projectileStyle));
  } else if (attackStyle === "rain") {
    [-140, 0, 140].forEach((offsetX) => spawnBossProjectile(player.x + player.w / 2 + offsetX, 30, dir * 40 * attackScale, 260, projectileColor, projectileLabel, 760 * attackScale, 42, 26, projectileStyle));
  } else if (attackStyle === "lob") {
    spawnBossProjectile(originX, originY, dir * 320 * attackScale, -390, projectileColor, projectileLabel, 1200, 50, 34, projectileStyle);
  } else {
    spawnBossProjectile(originX, originY, dir * 540 * attackScale, randomInt(-120, -30), projectileColor, projectileLabel, 700, 38, 22, projectileStyle);
  }
}

function updateBoss(dt) {
  if (!boss) {
    return;
  }

  if (boss.hp <= 0) {
    bossProjectiles = [];
    bossMechanics = [];
    boss.attackPoseTimer = 0;
    boss.hurtTimer = Math.max(0, (boss.hurtTimer || 0) - dt);
    boss.deathTimer = Math.max(0, (boss.deathTimer || 0) - dt);
    boss.deathVy = Math.min(1000, (boss.deathVy || -320) + GRAVITY * 0.72 * dt);
    boss.y += (boss.deathVy || 0) * dt;
    boss.x += (boss.deathVx || 0) * dt;
    return;
  }

  boss.stateTimer -= dt;
  boss.dodgeTimer -= dt;
  boss.homeTimer -= dt;
  boss.jumpTimer -= dt;
  boss.aiTimer -= dt;
  boss.specialTimer -= dt;
  boss.dashBurstTimer = Math.max(0, boss.dashBurstTimer - dt);
  boss.pursuitTimer = Math.max(0, boss.pursuitTimer - dt);
  boss.freezeTimer = Math.max(0, (boss.freezeTimer || 0) - dt);
  boss.changeFreezeCooldown = Math.max(0, (boss.changeFreezeCooldown || 0) - dt);

  const bossSpeed = boss.profile.speed * currentLevelConfig.bossSpeedScale;
  const effectiveBossSpeed = boss.freezeTimer > 0 ? bossSpeed * 0.58 : bossSpeed;
  const bossCenterX = boss.x + boss.w / 2;
  const playerIsLeft = player.x + player.w / 2 < boss.x + boss.w / 2;
  const chaseDir = playerIsLeft ? -1 : 1;
  const horizontalDistance = Math.abs((player.x + player.w / 2) - bossCenterX);
  const verticalDistance = (boss.y + boss.h) - (player.y + player.h);
  const bossPlatform = boss.grounded ? getSupportingPlatform(boss) : null;
  const playerPlatform = player.grounded ? getSupportingPlatform(player) : null;
  const routePlan = boss.grounded ? getBossRoutePlan(bossPlatform, playerPlatform, bossCenterX) : null;
  const routeToEdge = !!routePlan;

  if (boss.aiTimer <= 0) {
    boss.aiMode = pickBossMode(boss.profile);
    boss.aiTimer = randomBetween(0.7, 2.0);
    if (boss.aiMode === "patrol" && Math.random() > 0.45) {
      boss.roamDir *= -1;
    }
  }

  let moveDir = boss.roamDir;
  let speedScale = 0.75;
  if (routePlan) {
    boss.aiMode = "route";
    boss.aiTimer = 0.5;
    moveDir = routePlan.moveDir;
    speedScale = routePlan.mode === "drop" ? 0.78 : 0.9;
  } else {
    if (boss.aiMode === "chase") {
      moveDir = chaseDir;
      speedScale = 1;
    } else if (boss.aiMode === "retreat") {
      moveDir = -chaseDir;
      speedScale = horizontalDistance < 260 ? 1.1 : 0.8;
    } else if (boss.aiMode === "hold") {
      moveDir = horizontalDistance > 520 ? chaseDir : 0;
      speedScale = 0.45;
    }

    if (boss.pursuitTimer > 0) {
      moveDir = chaseDir;
      speedScale = Math.max(speedScale, 1.2);
      boss.aiMode = "chase";
    }
  }

  boss.vx = moveDir * effectiveBossSpeed * speedScale;
  if (boss.dashBurstTimer > 0) {
    boss.vx = chaseDir * effectiveBossSpeed * 2.25;
  } else if (boss.profile.moveStyle === "dash" && boss.stateTimer <= 0 && boss.aiMode === "chase") {
    boss.vx = moveDir * effectiveBossSpeed * 1.7;
    boss.stateTimer = 0.9;
  } else if (boss.profile.moveStyle === "patrol" && !routeToEdge) {
    boss.vx += Math.sin(performance.now() / 450 + boss.phaseSeed) * effectiveBossSpeed * 0.2;
  }

  const lookDir = moveDir === 0 ? chaseDir : Math.sign(moveDir);
  const noGroundAhead = boss.grounded && !hasGroundAhead(boss, lookDir, 34, 42);
  const hazardAhead = boss.grounded && willTouchFirewall(boss, lookDir, 24);
  const shouldJumpAtPlayer = !routeToEdge && boss.aiMode !== "retreat" && verticalDistance > 70 && horizontalDistance < 460;
  const shouldHopMove = boss.profile.moveStyle === "hop" && boss.stateTimer <= 0;
  const shouldAttemptJump = !routeToEdge && (hazardAhead || shouldJumpAtPlayer || shouldHopMove || noGroundAhead);
  const didDropHop = !!(routePlan && routePlan.mode === "drop" && routePlan.edgeReached && boss.jumpTimer <= 0 && boss.grounded);

  if (didDropHop) {
    launchBossDropHop(routePlan.moveDir, Math.max(140, effectiveBossSpeed * 0.95));
    boss.jumpTimer = 0.42;
    boss.stateTimer = 0.55;
  }

  if (routePlan && routePlan.mode === "jump" && routePlan.edgeReached && boss.jumpTimer <= 0 && boss.grounded) {
    if (tryCharacterJump(boss, boss.jump)) {
      const jumpDir = routePlan.targetCenterX < bossCenterX ? -1 : 1;
      boss.vx = jumpDir * effectiveBossSpeed * 1.25;
      boss.jumpTimer = 0.42;
      boss.stateTimer = 0.8;
    }
  }

  if (shouldAttemptJump && boss.jumpTimer <= 0) {
    if (tryCharacterJump(boss, shouldJumpAtPlayer ? boss.jump : boss.jump * 0.9)) {
      boss.jumpTimer = 0.42;
      if (hazardAhead) {
        boss.vx = -lookDir * effectiveBossSpeed * 1.15;
        boss.roamDir = -lookDir;
        boss.aiMode = "patrol";
        boss.aiTimer = randomBetween(0.8, 1.5);
      }
    }
    boss.stateTimer = 1.0;
  }

  const previousBossX = boss.x;
  boss.x += boss.vx * dt;
  if (boss.x <= boss.minX) {
    boss.x = boss.minX;
    boss.vx = Math.abs(boss.vx);
    boss.roamDir = 1;
    if (boss.aiMode !== "route") {
      boss.aiMode = "patrol";
      boss.aiTimer = randomBetween(0.8, 1.4);
    }
  }
  if (boss.x >= boss.maxX) {
    boss.x = boss.maxX;
    boss.vx = -Math.abs(boss.vx);
    boss.roamDir = -1;
    if (boss.aiMode !== "route") {
      boss.aiMode = "patrol";
      boss.aiTimer = randomBetween(0.8, 1.4);
    }
  }
  const bossXCollision = didDropHop
    ? { hit: false, side: null }
    : resolvePlatforms(boss, "x", previousBossX, { ignoreKinds: BOSS_SIDE_PASS_THROUGH });
  if (bossXCollision.hit && boss.dodgeTimer <= 0) {
    if (boss.aiMode === "route") {
      boss.x = previousBossX;
      if (boss.jumpTimer <= 0) {
        tryCharacterJump(boss, boss.jump * 0.95);
        boss.jumpTimer = 0.35;
      }
      boss.dodgeTimer = 0.4;
      boss.stateTimer = 0.2;
    } else {
      const reboundDir = bossXCollision.side === "right" ? -1 : 1;
      boss.x += reboundDir * 14;
      boss.vx = reboundDir * effectiveBossSpeed * 1.35;
      if (boss.jumpTimer <= 0) {
        tryCharacterJump(boss, boss.jump);
        boss.jumpTimer = 0.35;
      }
      boss.dodgeTimer = 0.65;
      boss.stateTimer = 0.45;
    }
  }

  boss.vy = Math.min(MAX_FALL_SPEED, boss.vy + GRAVITY * dt);
  const previousBossY = boss.y;
  boss.y += boss.vy * dt;
  const bossYCollision = resolvePlatforms(boss, "y", previousBossY, { ignoreCeilingKinds: BOSS_SIDE_PASS_THROUGH });
  if (bossYCollision.side === "ceiling") {
    boss.vx = chaseDir * effectiveBossSpeed * 1.25;
    boss.roamDir = chaseDir;
    if (boss.aiMode !== "route") {
      boss.aiMode = "patrol";
      boss.aiTimer = randomBetween(0.7, 1.3);
    }
    boss.dodgeTimer = Math.max(boss.dodgeTimer, 0.3);
  }

  if (boss.grounded) {
    if (Math.abs(boss.x - previousBossX) < 0.5 && Math.abs(boss.vx) > 20) {
      boss.stuckTimer += dt;
    } else {
      boss.stuckTimer = Math.max(0, boss.stuckTimer - dt * 2);
    }

    if (boss.stuckTimer > 0.28 && boss.dodgeTimer <= 0) {
      tryCharacterJump(boss, boss.jump);
      boss.vx = (routePlan?.moveDir || chaseDir) * bossSpeed * 1.4;
      boss.dodgeTimer = 0.7;
      boss.jumpTimer = 0.3;
      boss.stateTimer = 0.35;
    }

    if (boss.stuckTimer > 1.0 && boss.homeTimer <= 0) {
      snapBossToSafePlatform();
    } else {
      boss.lastSafeX = boss.x;
      boss.lastSafeY = boss.y;
    }
  } else {
    boss.stuckTimer = Math.max(0, boss.stuckTimer - dt);
  }

  if (boss.y > canvas.height + 120 || firewallZones.some((zone) => rectsOverlap(boss, zone))) {
    snapBossToSafePlatform();
  }

  if (boss.specialTimer <= 0) {
    activateBossSpecial();
    boss.shootTimer = Math.max(boss.shootTimer, 0.72);
    boss.specialTimer = Math.max(3.2, boss.profile.specialCooldown / Math.max(1, currentLevelConfig.bossAttackScale * 0.7));
  }

  if (bossUsesNormalProjectiles(boss.profile)) {
    boss.shootTimer -= dt;
    if (boss.shootTimer <= 0) {
      const pressureDelay = getBossProjectilePressureDelay();
      if (pressureDelay > 0) {
        boss.shootTimer = pressureDelay;
      } else {
        fireBossAttack();
        boss.shootTimer = Math.max(0.62, boss.profile.cooldown / Math.max(1, currentLevelConfig.bossAttackScale * 0.92));
      }
    }
  } else {
    boss.shootTimer = Math.max(boss.shootTimer, boss.profile.cooldown);
  }

  updateBossMechanics(dt);

  if (boss.hurtTimer > 0) {
    boss.hurtTimer -= dt;
  }
  if (boss.attackPoseTimer > 0) {
    boss.attackPoseTimer -= dt;
  }

  for (const projectile of bossProjectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.vy = Math.min(900, projectile.vy + projectile.gravity * dt);
    projectile.rotation += (projectile.spin || 0) * dt;

    if (projectile.y > canvas.height + 100 || projectile.x < -100 || projectile.x > worldWidth + 100) {
      projectile.expired = true;
      continue;
    }

    for (const platform of platforms) {
      if (rectsOverlap(projectile, platform)) {
        if (projectile.bouncesRemaining > 0 && projectile.vy > 40) {
          projectile.y = getPlatformTop(platform) - projectile.h;
          projectile.vy = -Math.abs(projectile.vy) * 0.58;
          projectile.vx *= 0.92;
          projectile.bouncesRemaining -= 1;
        } else if (projectile.burstOnStop) {
          spawnBubbleBurst(projectile);
          projectile.expired = true;
        } else {
          projectile.expired = true;
        }
        break;
      }
    }

    if (!projectile.expired && rectsOverlap(player, projectile)) {
      projectile.expired = true;
      damagePlayer({ source: "bossProjectile" });
    }
  }

  bossProjectiles = bossProjectiles.filter((projectile) => !projectile.expired);

  if (rectsOverlap(player, boss)) {
    damagePlayer({ source: "boss" });
  }
}

function updateImpactParticles(dt) {
  for (const particle of impactParticles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += particle.gravity * dt;
    particle.vx *= 0.985;
    particle.life -= dt;
  }

  impactParticles = impactParticles.filter((particle) => particle.life > 0);

  if (screenShakeTimer > 0) {
    screenShakeTimer = Math.max(0, screenShakeTimer - dt);
    if (screenShakeTimer === 0) {
      screenShakeStrength = 0;
    }
  }
}

function updateSpecialHazards(now) {
  if (godModeEnabled) {
    return;
  }
  for (const zone of specialHazards) {
    const activeZone = getSpecialHazardRect(zone, now);
    if (!rectsOverlap(player, activeZone)) {
      continue;
    }

    if (zone.kind === "dataLeak") {
      const leakSkatesCount = getUpgradeCount("leakSkates");
      if (leakSkatesCount > 0) {
        player.quickRecoveryTimer = Math.max(player.quickRecoveryTimer, 0.5 + (leakSkatesCount - 1) * 0.25);
      } else {
        const momentumCacheCount = getUpgradeCount("momentumCache");
        player.slipTimer = Math.max(player.slipTimer, Math.max(0.08, 0.28 - momentumCacheCount * 0.05));
      }
      continue;
    }

    if (zone.kind === "cableMess") {
      const cableManagementCount = getUpgradeCount("cableManagement");
      const momentumCacheCount = getUpgradeCount("momentumCache");
      const cablePenalty = cableManagementCount > 0
        ? Math.max(0.04, 0.24 - cableManagementCount * 0.06)
        : Math.max(0.1, 0.24 - momentumCacheCount * 0.04);
      player.snareTimer = Math.max(player.snareTimer, cablePenalty);
      player.jumpDebuffTimer = Math.max(player.jumpDebuffTimer, cablePenalty);
      continue;
    }

    if (zone.kind === "vent" && isVentHazardActive(zone, now)) {
      const ventRiderCount = getUpgradeCount("ventRider");
      player.vy = Math.min(player.vy, ventRiderCount > 0 ? -(840 + ventRiderCount * 200) : -840);
      player.grounded = false;
      if (ventRiderCount > 0) {
        player.invincibleTimer = Math.max(player.invincibleTimer, 0.25 + ventRiderCount * 0.12);
      }
      spawnImpactParticles(player.x + player.w / 2, activeZone.y + 8, zone.color, 7, { speedMin: 110, speedMax: 240, gravity: 380 });
      continue;
    }

    const config = SPECIAL_HAZARD_TYPES[zone.kind];
    const cycleIndex = config?.period ? Math.floor((now / 1000 + (zone.phaseOffset || 0)) / config.period) : 0;

    if (zone.kind === "static" && isStaticHazardActive(zone, now) && zone.lastHitCycle !== cycleIndex) {
      zone.lastHitCycle = cycleIndex;
      spawnImpactParticles(player.x + player.w / 2, player.y + player.h * 0.45, zone.color, 8, { speedMin: 120, speedMax: 260 });
      addScreenShake(5, 0.12);
      const shockInsulationCount = getUpgradeCount("shockInsulation");
      if (shockInsulationCount > 0) {
        player.invincibleTimer = Math.max(player.invincibleTimer, 0.35 + shockInsulationCount * 0.1);
      } else {
        damagePlayer({ source: "hazard" });
      }
    }

    if (zone.kind === "diskFailure" && isDiskFailureHazardActive(zone, now) && zone.lastHitCycle !== cycleIndex) {
      zone.lastHitCycle = cycleIndex;
      spawnImpactParticles(activeZone.x + activeZone.w / 2, activeZone.y + activeZone.h - 2, zone.color, 9, { speedMin: 100, speedMax: 240, gravity: 680 });
      addScreenShake(6, 0.14);
    }

    if (zone.kind === "reboot" && isRebootHazardBurstActive(zone, now) && zone.lastHitCycle !== cycleIndex) {
      zone.lastHitCycle = cycleIndex;
      player.vy = Math.min(player.vy, -620);
      player.grounded = false;
      spawnImpactParticles(player.x + player.w / 2, player.y + player.h * 0.5, zone.color, 12, { speedMin: 150, speedMax: 340, sizeMin: 4, sizeMax: 8 });
      addScreenShake(7, 0.16);
      const shockInsulationCount = getUpgradeCount("shockInsulation");
      if (shockInsulationCount > 0) {
        player.invincibleTimer = Math.max(player.invincibleTimer, 0.35 + shockInsulationCount * 0.1);
      } else {
        damagePlayer({ source: "hazard" });
      }
    }

    if (zone.kind === "backupWindow") {
      const playerBox = makeCollider(player);
      const zoneBox = makeCollider(activeZone);
      const previousPlayerBox = makeCollider({ ...player, x: player.prevX ?? player.x });
      const colliderOffset = getEntityColliderOffset(player);
      const dt = zone.lastTouchTime > 0 ? Math.min(0.05, (now - zone.lastTouchTime) / 1000) : 1 / 60;
      const pushDir = Math.sign(activeZone.vx || 0) || 1;
      const hazardRoutingMultiplier = Math.pow(0.72, getUpgradeCount("hazardRouting"));
      const pushSpeed = Math.max(190, Math.abs(activeZone.vx || 0) * 0.82) * hazardRoutingMultiplier;
      let resolveSide = pushDir > 0 ? "right" : "left";

      if (previousPlayerBox.x + previousPlayerBox.w <= zoneBox.x + 1) {
        resolveSide = "left";
      } else if (previousPlayerBox.x >= zoneBox.x + zoneBox.w - 1) {
        resolveSide = "right";
      } else {
        const leftPenetration = Math.max(0, playerBox.x + playerBox.w - zoneBox.x);
        const rightPenetration = Math.max(0, zoneBox.x + zoneBox.w - playerBox.x);
        resolveSide = leftPenetration <= rightPenetration ? "left" : "right";
        if (Math.abs(leftPenetration - rightPenetration) < 6) {
          resolveSide = pushDir > 0 ? "right" : "left";
        }
      }

      if (resolveSide === "left") {
        player.x = zoneBox.x - playerBox.w - colliderOffset.x;
      } else {
        player.x = zoneBox.x + zoneBox.w - colliderOffset.x;
      }

      player.x += pushDir * pushSpeed * dt;
      player.vx = moveTowards(player.vx, pushDir * Math.max(220, Math.abs(activeZone.vx || 0) * 0.9) * hazardRoutingMultiplier, 2200 * dt);
      player.x = Math.max(0, Math.min(worldWidth - player.w, player.x));

      zone.lastTouchTime = now;
    }
  }
}

function updateTickets(time) {
  for (const ticket of tickets) {
    if (ticket.taken) {
      continue;
    }
    ticket.renderY = ticket.y + Math.sin(time / 320 + ticket.floatOffset) * 6;
    if (hasUpgrade("ticketVacuum")) {
      applyLatchedVacuum(ticket, { renderKey: "renderY", range: getTicketVacuumRange(), minPull: 7, maxPull: 20 });
    }
    if (rectsOverlap(player, { ...ticket, y: ticket.renderY })) {
      ticket.taken = true;
      player.score += 1;
      runScore += 1;
      runStats.vmsRestored += 1;
      const bonusRecoveryCount = getUpgradeCount("bonusRecovery");
      if (bonusRecoveryCount > 0) {
        traitState.bonusRecoveryTickets += 1;
        if (traitState.bonusRecoveryTickets >= Math.max(2, 5 - bonusRecoveryCount)) {
          traitState.bonusRecoveryTickets = 0;
          player.snapshotShield = Math.min(player.snapshotShield + 1, 2);
          spawnSystemParticles(player.x + player.w / 2, player.y + player.h * 0.45, "#74f7c4", 10);
        }
      }
      syncHud();
    }
  }
}

function applyLatchedVacuum(item, options = {}) {
  const renderKey = options.renderKey || "renderY";
  const itemY = item[renderKey] ?? item.y;
  const dx = (player.x + player.w / 2) - (item.x + item.w / 2);
  const dy = (player.y + player.h / 2) - (itemY + item.h / 2);
  const distance = Math.hypot(dx, dy);
  const vacuumRange = options.range || getTicketVacuumRange();

  if (!item.vacuumLocked && distance < vacuumRange) {
    item.vacuumLocked = true;
  }
  if (!item.vacuumLocked || distance <= 1) {
    return;
  }

  const closeness = Math.max(0, 1 - Math.min(distance, vacuumRange) / vacuumRange);
  const pull = Math.min(distance, (options.minPull || 7) + closeness * (options.maxPull || 20));
  item.x += (dx / distance) * pull;
  item[renderKey] = itemY + (dy / distance) * pull;
}

function applyPickupEffect(pickup) {
  const durationMultiplier = getPickupDurationMultiplier();
  if (pickup.kind === "snapshot") {
    player.snapshotShield = Math.min(player.snapshotShield + 1, 2);
  } else if (pickup.kind === "vmotion") {
    player.pickupSpeedTimer = Math.max(player.pickupSpeedTimer, 7 * durationMultiplier);
    player.invincibleTimer = Math.max(player.invincibleTimer, 1.2);
  } else if (pickup.kind === "patch") {
    player.pickupDamageTimer = Math.max(player.pickupDamageTimer, 8 * durationMultiplier);
  } else if (pickup.kind === "ha") {
    player.lives = Math.min(player.lives + 1, getCurrentMaxLives());
  }
  spawnSystemParticles(pickup.x + pickup.w / 2, (pickup.renderY ?? pickup.y) + pickup.h / 2, pickup.color, pickup.kind === "ha" ? 16 : 12);
  runScore += 2;
  syncHud();
}

function updatePickups(time) {
  for (const pickup of pickups) {
    if (pickup.taken) {
      continue;
    }
    pickup.renderY = pickup.y + Math.sin(time / 280 + pickup.floatOffset) * 7;
    if (hasUpgrade("ticketVacuum")) {
      applyLatchedVacuum(pickup, { renderKey: "renderY", range: getTicketVacuumRange(), minPull: 6, maxPull: 18 });
    }
    if (rectsOverlap(player, { ...pickup, y: pickup.renderY })) {
      pickup.taken = true;
      runStats.pickupsCollected += 1;
      applyPickupEffect(pickup);
    }
  }
}

function checkFirewallAndExit() {
  for (const zone of firewallZones) {
    if (rectsOverlap(player, zone)) {
      damagePlayer({ source: "hazard" });
      break;
    }
  }

  updateSpecialHazards(performance.now());

  const objectiveDone = currentLevelConfig.isBossLevel ? boss && boss.hp <= 0 : player.score === currentLevelConfig.ticketTarget;
  if (objectiveDone && rectsOverlap(player, finishGate)) {
    gameState = "upgrade";
    renderUpgradeOverlay();
    upgradeOverlay.classList.remove("hidden");
  }
}

function drawRoundRect(x, y, w, h, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function drawSpriteFit(image, x, y, targetW, targetH, options = {}) {
  if (!image) {
    return;
  }

  const fitted = getSpriteFitRect(image, targetW, targetH, options);
  const drawX = x + fitted.x;
  const drawY = y + fitted.y;

  ctx.drawImage(image, drawX, drawY, fitted.w, fitted.h);
}

function drawBackground(time) {
  const theme = currentLevelConfig.theme;
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, theme.skyTop);
  bg.addColorStop(0.55, theme.skyMid);
  bg.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const orbX = 200 + Math.sin(time / 2600) * 140;
  const orbY = 120 + Math.cos(time / 3000) * 30;
  const orb = ctx.createRadialGradient(orbX, orbY, 20, orbX, orbY, 320);
  orb.addColorStop(0, theme.haze);
  orb.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const backgroundImage = theme.backgroundImage ? assets[theme.backgroundImage] : null;
  if (backgroundImage) {
    const layerY = 24;
    const targetW = canvas.width + 120;
    const targetH = canvas.height - 140;
    const scale = Math.max(targetW / backgroundImage.width, targetH / backgroundImage.height);
    const drawW = backgroundImage.width * scale;
    const drawH = backgroundImage.height * scale;
    const overflowX = Math.max(0, drawW - targetW);
    const scrollRange = Math.max(1, worldWidth - canvas.width);
    const scrollT = Math.max(0, Math.min(1, cameraX / scrollRange));
    const drawX = -60 - overflowX * scrollT * 0.55;

    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.drawImage(backgroundImage, drawX, layerY, drawW, drawH);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(-(cameraX * 0.42) % 320, 0);
  ctx.globalAlpha = 0.14;
  for (let i = -1; i < 6; i += 1) {
    const laneY = 180 + i * 46 + Math.sin(time / 900 + i) * 8;
    const packetX = ((time / 3.2) + i * 90) % 360;
    ctx.strokeStyle = theme.haze;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(i * 320, laneY);
    ctx.bezierCurveTo(i * 320 + 110, laneY - 16, i * 320 + 210, laneY + 16, i * 320 + 340, laneY);
    ctx.stroke();

    ctx.fillStyle = theme.glow;
    drawRoundRect(i * 320 + packetX, laneY - 3, 18, 6, 3);
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = theme.glow;
  ctx.lineWidth = 1;
  for (let x = -((cameraX * 0.18) % 120); x < canvas.width + 140; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 520);
    ctx.lineTo(x - 180, canvas.height);
    ctx.stroke();
  }
  for (let y = 540; y < canvas.height; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();


  ctx.fillStyle = "rgba(1, 5, 12, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlatforms() {
  const theme = currentLevelConfig.theme;
  for (const platform of platforms) {
    const platformWarningZone = specialHazards.find((zone) => zone.kind === "diskFailure" && zone.platformRef === platform && isDiskFailureHazardWarning(zone, performance.now()));
    const platformDisabled = isPlatformDisabled(platform, performance.now());
    const sx = platform.x - cameraX;
    if (sx > canvas.width + 120 || sx + platform.w < -120) {
      continue;
    }

    if (platformDisabled) {
      continue;
    }

    if (platform.kind === "floor") {
      const floorGradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.h);
      floorGradient.addColorStop(0, "#163252");
      floorGradient.addColorStop(1, "#0a1422");

      ctx.shadowBlur = 18;
      ctx.shadowColor = theme.haze;
      ctx.fillStyle = floorGradient;
      drawRoundRect(sx, platform.y, platform.w, platform.h, 12);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#203f5f";
      drawRoundRect(sx, platform.y, platform.w, 16, 12);
      ctx.fillStyle = theme.glow;
      drawRoundRect(sx, platform.y, platform.w, 4, 2);

      for (let x = sx + 24; x < sx + platform.w - 24; x += 64) {
        ctx.fillStyle = "#173656";
        drawRoundRect(x, platform.y + 24, 28, 16, 4);
      }
    } else {
      const renderConfig = getPlatformRenderConfig(platform.kind);
      const assetKey = platform.spriteKey || renderConfig?.asset;
      if (renderConfig && assets[assetKey]) {
        drawSpriteFit(assets[assetKey], sx, platform.y + renderConfig.offsetY, platform.w, renderConfig.renderH, {
          mode: getAdaptivePlatformMode(assetKey, platform.w, renderConfig.renderH, renderConfig.mode || "contain"),
        });
      }
    }

    if (platformWarningZone) {
      const blink = Math.sin(performance.now() / 90) > 0 ? 1 : 0.35;
      ctx.save();
      ctx.globalAlpha = blink;
      ctx.fillStyle = "rgba(255, 107, 129, 0.12)";
      drawRoundRect(sx, platform.y, platform.w, Math.min(platform.h, 18), 8);
      ctx.strokeStyle = "#ff6b81";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + 12, platform.y + 12);
      for (let x = sx + 12; x < sx + platform.w - 10; x += 18) {
        ctx.lineTo(x + 6, platform.y + 4 + Math.sin(x * 0.08) * 3);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawDecorations() {
  for (const decoration of decorations) {
    const sx = decoration.x - cameraX;
    if (sx > canvas.width + 120 || sx + decoration.w < -120) {
      continue;
    }

    if (decoration.kind === "terminal") {
      drawSpriteFit(assets[decoration.spriteKey] || assets.terminal, sx, decoration.y, decoration.w, decoration.h);
    } else if (decoration.kind === "antenna") {
      drawSpriteFit(assets[decoration.spriteKey] || assets.antenna, sx, decoration.y + 2, decoration.w, decoration.h);
    } else if (decoration.kind === "patchpanel") {
      drawSpriteFit(assets[decoration.spriteKey] || assets.patchpanel, sx, decoration.y + 12, decoration.w + 18, decoration.h - 18);
    } else if (decoration.kind === "winserver") {
      drawSpriteFit(assets[decoration.spriteKey] || assets.winserver, sx, decoration.y, decoration.w, decoration.h);
    }
  }
}

function drawFirewalls(time) {
  for (const zone of firewallZones) {
    const sx = zone.x - cameraX;
    if (sx > canvas.width + 80 || sx + zone.w < -80) {
      continue;
    }

    const pulse = 0.9 + Math.sin(time / 120) * 0.1;
    ctx.globalAlpha = pulse;
    drawSpriteFit(assets[zone.spriteKey] || assets.firewall, sx, zone.y - 20, zone.w, zone.h + 36, { alignY: "center" });
    ctx.globalAlpha = 1;
  }
}

function drawSpecialHazards(time) {
  for (const zone of specialHazards) {
    const activeZone = getSpecialHazardRect(zone, time);
    const sx = activeZone.x - cameraX;
    if (sx > canvas.width + 100 || sx + activeZone.w < -100) {
      continue;
    }

    if (!zone.spriteKey || !assets[zone.spriteKey]) {
      continue;
    }

    const config = SPECIAL_HAZARD_TYPES[zone.kind];
    const renderTopPad = config?.renderTopPad || 0;
    const pulse = zone.kind === "dataLeak"
      ? 0.92
      : zone.kind === "static"
        ? (isStaticHazardActive(zone, time) ? 1 : 0.55)
        : zone.kind === "vent"
          ? (isVentHazardActive(zone, time) ? 1 : 0.6)
          : zone.kind === "reboot"
            ? (isRebootHazardBurstActive(zone, time) ? 1 : 0.82)
            : 0.95;
    ctx.save();
    ctx.globalAlpha = pulse;
    drawSpriteFit(assets[zone.spriteKey], sx, activeZone.surfaceY - (activeZone.h + renderTopPad), activeZone.w, activeZone.h + renderTopPad, { alignY: "bottom", mode: "cover" });
    ctx.restore();
  }
}

function drawTickets() {
  for (const ticket of tickets) {
    if (ticket.taken) {
      continue;
    }
    const sx = ticket.x - cameraX;
    const sy = ticket.renderY ?? ticket.y;
    ctx.save();
    ctx.shadowColor = currentLevelConfig.theme.haze;
    ctx.shadowBlur = 18;
    drawSpriteFit(assets[ticket.spriteKey] || assets.ticket, sx, sy, ticket.w, ticket.h, { alignY: "center", mode: "cover" });
    ctx.restore();
  }
}

function drawPickups(time) {
  for (const pickup of pickups) {
    if (pickup.taken) {
      continue;
    }

    const sx = pickup.x - cameraX;
    const sy = pickup.renderY ?? pickup.y;
    if (sx > canvas.width + 80 || sx + pickup.w < -80) {
      continue;
    }

    ctx.save();
    ctx.shadowColor = `${pickup.color}aa`;
    ctx.shadowBlur = 18;
    if (pickup.spriteKey && assets[pickup.spriteKey]) {
      drawSpriteFit(assets[pickup.spriteKey], sx, sy, pickup.w, pickup.h, { alignY: "center", mode: "cover" });
    } else {
      ctx.fillStyle = "rgba(8, 17, 30, 0.94)";
      drawRoundRect(sx, sy, pickup.w, pickup.h, 12);
      ctx.strokeStyle = pickup.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(sx + 5, sy + 5, pickup.w - 10, pickup.h - 10);
      ctx.fillStyle = pickup.color;
      ctx.font = "800 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pickup.label, sx + pickup.w / 2, sy + 28 + Math.sin(time / 180 + pickup.floatOffset) * 1.5);
    }
    ctx.restore();
  }
}

function getCharacterMotionPose(entity, time, referenceSpeed = 360, phase = 0) {
  const motionStyle = entity.motionStyle || {};
  const grounded = !!entity.grounded;
  const horizontalSpeed = Math.abs(entity.vx || 0);
  const moveFactor = grounded ? Math.min(horizontalSpeed / referenceSpeed, 1) : 0;
  const idleFactor = grounded ? 1 - Math.min(moveFactor * 1.6, 1) : 0.15;
  const cycle = time * 0.018 + phase;
  const idleCycle = time * 0.006 + phase;
  const airFactor = grounded ? 0 : Math.min(Math.abs(entity.vy || 0) / 900, 1);
  const risingFactor = grounded || (entity.vy || 0) >= -30 ? 0 : Math.min(Math.abs(entity.vy || 0) / 800, 1);
  const fallingFactor = grounded || (entity.vy || 0) <= 30 ? 0 : Math.min((entity.vy || 0) / 900, 1);
  const throwFactor = Math.max(0, Math.min(1, (entity.throwPoseTimer || 0) / 0.18));
  const bobScale = motionStyle.bobScale ?? 1;
  const idleBobScale = motionStyle.idleBobScale ?? 1;
  const tiltScale = motionStyle.tiltScale ?? 1;
  const strideScale = motionStyle.strideScale ?? 1;
  const legTiltScale = motionStyle.legTiltScale ?? 1;
  const squashScale = motionStyle.squashScale ?? 1;
  const torsoLiftScale = motionStyle.torsoLiftScale ?? 1;
  const torsoShiftScale = motionStyle.torsoShiftScale ?? 1;
  const throwShiftScale = motionStyle.throwShiftScale ?? 1;
  const bob = grounded
    ? (Math.sin(cycle) * 1.6 * moveFactor * bobScale) + (Math.sin(idleCycle) * 0.7 * idleFactor * idleBobScale)
    : 0;
  const tilt = grounded
    ? (Math.sin(cycle) * 0.02 * moveFactor + Math.sin(idleCycle * 0.75) * 0.008 * idleFactor) * tiltScale
    : (Math.max(-0.11, Math.min(0.11, (entity.vy || 0) * 0.00022)) - risingFactor * 0.025 + fallingFactor * 0.02 + throwFactor * 0.05) * tiltScale;
  const stride = grounded ? Math.sin(cycle) * (4.6 * moveFactor) * strideScale : Math.sin(time * 0.01 + phase) * 1.2 * airFactor * strideScale;
  const legTilt = grounded ? Math.sin(cycle) * 0.07 * moveFactor * legTiltScale : 0;
  const squashX = grounded
    ? 1 + (Math.abs(Math.sin(cycle)) * 0.025 * moveFactor - Math.sin(idleCycle) * 0.008 * idleFactor) * squashScale
    : 1 - airFactor * 0.04 + fallingFactor * 0.02;
  const squashY = grounded
    ? 1 + (-Math.abs(Math.sin(cycle)) * 0.03 * moveFactor + Math.sin(idleCycle) * 0.012 * idleFactor) * squashScale
    : 1 + airFactor * 0.06 + risingFactor * 0.03;
  const upperBob = grounded
    ? bob
    : Math.max(-4, Math.min(4, -(entity.vy || 0) * 0.0045));
  const torsoLift = grounded
    ? Math.sin(cycle + Math.PI / 2) * 0.9 * moveFactor * torsoLiftScale
    : (Math.max(-6, Math.min(6, -(entity.vy || 0) * 0.0055)) - fallingFactor * 1.5) * torsoLiftScale;
  const torsoShiftX = grounded ? 0 : (risingFactor * 1.2 - fallingFactor * 0.8) * torsoShiftScale;
  const throwShiftX = throwFactor * 5 * throwShiftScale;
  return {
    bob,
    upperBob,
    tilt,
    stride,
    legTilt,
    squashX,
    squashY,
    moveFactor,
    idleFactor,
    airFactor,
    risingFactor,
    fallingFactor,
    torsoLift,
    torsoShiftX,
    throwFactor,
    throwShiftX,
  };
}

function drawAnimatedCharacterSprite(image, entity, drawW, drawH, options = {}) {
  if (!image) {
    return;
  }

  const {
    time = 0,
    phase = 0,
    facing = entity.dir || entity.facing || 1,
    alignY = "bottom",
    referenceSpeed = 360,
    shadowColor = "rgba(8, 17, 30, 0.24)",
    motionStyle = null,
  } = options;

  if (motionStyle) {
    entity.motionStyle = motionStyle;
  }
  const pose = getCharacterMotionPose(entity, time, referenceSpeed, phase);
  if (motionStyle) {
    delete entity.motionStyle;
  }
  const hurtFactor = Math.max(0, Math.min(1, (entity.hurtTimer || 0) / 0.28));
  const attackFactor = Math.max(0, Math.min(1, (entity.attackPoseTimer || 0) / 0.26));
  const deathFactor = entity.defeated ? Math.max(0, Math.min(1, (entity.deathTimer || 0) / 0.42)) : 0;
  const halfW = drawW / 2;
  const splitY = -drawH + drawH * 0.56;

  ctx.save();
  ctx.translate(entity.x - cameraX + entity.w / 2, entity.y + entity.h);
  ctx.scale(facing, 1);
  ctx.rotate(pose.tilt - hurtFactor * 0.16 + attackFactor * 0.05 - deathFactor * 0.2);
  if (deathFactor > 0) {
    ctx.globalAlpha = Math.max(0.25, 1 - deathFactor * 0.7);
  }

  if (pose.moveFactor > 0.05 || pose.idleFactor > 0.2) {
    ctx.save();
    ctx.fillStyle = shadowColor;
    ctx.globalAlpha = 0.28 + pose.moveFactor * 0.27;
    ctx.beginPath();
    ctx.ellipse(0, -2, drawW * (0.18 + pose.moveFactor * 0.04), 5 + pose.moveFactor * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(-halfW - 8, splitY, drawW + 16, -splitY + 8);
  ctx.clip();
  ctx.translate(pose.stride - hurtFactor * 3, -deathFactor * 6);
  ctx.rotate(pose.legTilt - hurtFactor * 0.05 - deathFactor * 0.08);
  ctx.scale(pose.squashX, pose.squashY);
  drawSpriteFit(image, -halfW, -drawH, drawW, drawH, { alignY });
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(-halfW - 8, -drawH - 8 + pose.upperBob, drawW + 16, drawH + splitY + 8);
  ctx.clip();
  ctx.translate(
    pose.torsoShiftX + pose.throwShiftX + attackFactor * 4 - hurtFactor * 5,
    pose.upperBob + pose.torsoLift - pose.throwFactor * 1.5 - deathFactor * 10
  );
  if (pose.throwFactor > 0) {
    ctx.rotate(-0.08 * pose.throwFactor);
  }
  if (attackFactor > 0) {
    ctx.rotate(-0.12 * attackFactor);
  }
  if (hurtFactor > 0) {
    ctx.rotate(0.14 * hurtFactor);
  }
  drawSpriteFit(image, -halfW, -drawH, drawW, drawH, { alignY });
  ctx.restore();

  ctx.restore();
}

function drawUsers() {
  for (const user of users) {
    if (user.defeated && (!user.deathTimer || user.deathTimer <= 0)) {
      continue;
    }

    const popupBehavior = getUserPopupBehavior(user);
    if (popupBehavior.enabled) {
      if (user.defeated) {
        continue;
      }
      drawRansomwarePopup(user, popupBehavior, performance.now());
      continue;
    }

    drawAnimatedCharacterSprite(assets[user.spriteKey] || assets.user, user, user.w, user.h, {
      time: performance.now(),
      referenceSpeed: 260,
      phase: user.motionPhase || 0,
      shadowColor: "rgba(8, 17, 30, 0.28)",
      motionStyle: user.motionStyle || null,
    });

    ctx.save();
    ctx.translate(user.x - cameraX + user.w / 2, user.y + user.h / 2);
    ctx.scale(user.dir, 1);
    const supportBehavior = getUserSupportBehavior(user);
    if (!user.defeated && supportBehavior.enabled) {
      ctx.save();
      ctx.globalAlpha = 0.16 + Math.sin(performance.now() / 180) * 0.04;
      ctx.strokeStyle = supportBehavior.color || user.tint;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, user.h * 0.08, Math.min(42, (supportBehavior.range || 220) * 0.18), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (!user.defeated && !supportBehavior.enabled) {
      const supportInfluence = getUserSupportInfluence(user);
      if (supportInfluence.speedMultiplier > 1.01 || supportInfluence.armorBonus > 0 || supportInfluence.shootCooldownMultiplier < 0.99) {
        ctx.save();
        ctx.globalAlpha = 0.82 + Math.sin(performance.now() / 120) * 0.12;
        ctx.fillStyle = "#d6dde6";
        drawRoundRect(-16, -user.h / 2 - 16, 32, 6, 3);
        ctx.fillStyle = "#08111f";
        ctx.font = "800 7px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BUFF", 0, -user.h / 2 - 11);
        ctx.restore();
      }
    }
    if (!user.defeated && (user.burstWindupTimer > 0 || user.burstTimer > 0)) {
      ctx.fillStyle = user.burstTimer > 0 ? "#ff8b5b" : "#ffd166";
      drawRoundRect(-18, -user.h / 2 - 16, 36, 5, 3);
      if (user.burstWindupTimer > 0) {
        ctx.fillStyle = "#08111f";
        ctx.font = "800 7px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CALL", 0, -user.h / 2 - 11);
      }
    }
    if (!user.defeated && (user.escalationStacks || 0) > 0) {
      ctx.fillStyle = "#ff5b6e";
      ctx.font = "800 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`PRIO ${Math.max(1, 4 - user.escalationStacks)}`, 0, -user.h / 2 - 12);
    }
    if (!user.defeated && popupBehavior.enabled && user.popupState === "warning") {
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(popupBehavior.label || "LOCKED", 0, -user.h / 2 - 12);
    }
    if (!user.defeated && user.maxHp > 1) {
      ctx.fillStyle = "rgba(8, 17, 30, 0.8)";
      drawRoundRect(-20, -user.h / 2 - 8, 40, 5, 3);
      ctx.fillStyle = user.tint;
      drawRoundRect(-20, -user.h / 2 - 8, 40 * (user.hp / user.maxHp), 5, 3);
    }
    ctx.restore();
  }
}

function drawRansomwarePopup(user, popupBehavior, time) {
  const sx = user.x - cameraX;
  const tabY = user.spawnY + user.h - 8;
  const pulse = 0.75 + Math.sin(time / 90) * 0.25;

  ctx.save();
  if (user.popupState === "hidden") {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = user.tint;
    drawRoundRect(sx + user.w / 2 - 12, tabY, 24, 8, 3);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 8px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", sx + user.w / 2, tabY + 7);
    ctx.restore();
    return;
  }

  if (user.popupState === "warning") {
    ctx.globalAlpha = 0.28 + pulse * 0.22;
    ctx.strokeStyle = user.tint;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(sx + 4, user.spawnY - 10, user.w - 8, user.h + 4);
    ctx.setLineDash([]);
    ctx.fillStyle = user.tint;
    drawRoundRect(sx + user.w / 2 - 16, tabY - 2, 32, 10, 3);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 8px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WARN", sx + user.w / 2, tabY + 6);
    ctx.restore();
    return;
  }

  ctx.globalAlpha = 0.92;
  ctx.shadowColor = `${user.tint}99`;
  ctx.shadowBlur = 16;
  if (assets[user.spriteKey]) {
    drawSpriteFit(assets[user.spriteKey], sx, user.y, user.w, user.h, { alignY: "center", mode: "contain" });
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#190915";
    drawRoundRect(sx + 5, user.y + user.h - 17, user.w - 10, 14, 4);
    ctx.fillStyle = "#ffd6e6";
    ctx.font = "800 8px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(popupBehavior.label || "LOCKED", sx + user.w / 2, user.y + user.h - 7);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#190915";
  drawRoundRect(sx, user.y, user.w, user.h, 6);
  ctx.shadowBlur = 0;
  ctx.fillStyle = user.tint;
  drawRoundRect(sx, user.y, user.w, 14, 6);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 8px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("RANSOM", sx + 6, user.y + 10);
  ctx.fillStyle = "#ffd6e6";
  ctx.font = "800 10px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(popupBehavior.label || "LOCKED", sx + user.w / 2, user.y + 33);
  ctx.fillStyle = "#ffffff";
  drawRoundRect(sx + user.w - 13, user.y + 4, 7, 7, 2);
  ctx.restore();
}

function drawUserDenialZones(time) {
  for (const zone of userDenialZones) {
    const sx = zone.x - cameraX;
    const warning = zone.warnTime > 0;
    const alpha = warning ? (Math.sin(time / 70) > 0 ? 0.62 : 0.22) : 0.74;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = warning ? `${zone.color}33` : `${zone.color}55`;
    drawRoundRect(sx, zone.y, zone.w, zone.h, 6);
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = warning ? 2 : 3;
    ctx.strokeRect(sx + 2, zone.y + 2, zone.w - 4, zone.h - 4);
    ctx.fillStyle = "#08111f";
    ctx.font = "800 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(zone.label || "CHANGE", sx + zone.w / 2, zone.y + zone.h / 2 + 4);
    ctx.restore();
  }
}

function drawUserProjectiles() {
  for (const projectile of userProjectiles) {
    const sx = projectile.x - cameraX;
    ctx.save();
    ctx.shadowColor = `${projectile.color}88`;
    ctx.shadowBlur = 14;
    ctx.fillStyle = projectile.color;
    drawRoundRect(sx, projectile.y, projectile.w, projectile.h, 6);
    ctx.strokeStyle = "#082033";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + 4, projectile.y + 5);
    ctx.lineTo(sx + projectile.w / 2, projectile.y + 13);
    ctx.lineTo(sx + projectile.w - 4, projectile.y + 5);
    ctx.stroke();
    ctx.fillStyle = "#082033";
    ctx.font = "700 8px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(projectile.label || "MAIL", sx + projectile.w / 2, projectile.y + Math.min(projectile.h - 4, 18));
    ctx.restore();
  }
}

function drawImpactParticles() {
  for (const particle of impactParticles) {
    const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
    const sx = particle.x - cameraX;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 8;
    drawRoundRect(sx - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size, 3);
    ctx.restore();
  }
}

function drawBossProjectile(projectile, sx) {
  if (!projectile.spriteKey || !assets[projectile.spriteKey]) {
    return;
  }

  ctx.save();
  ctx.translate(sx + projectile.w / 2, projectile.y + projectile.h / 2);
  ctx.rotate(projectile.rotation || 0);
  ctx.shadowColor = `${projectile.color}88`;
  ctx.shadowBlur = 16;
  drawSpriteFit(
    assets[projectile.spriteKey],
    -projectile.w / 2,
    -projectile.h / 2,
    projectile.w,
    projectile.h,
    { alignX: "center", alignY: "center", mode: "contain" },
  );

  ctx.restore();
}

function drawBossMechanics(time) {
  for (const effect of bossMechanics) {
    if (effect.kind === "priorityZone") {
      const sx = effect.x - cameraX;
      const alpha = effect.warnTime > 0 ? (Math.sin(time / 80) > 0 ? 0.9 : 0.28) : 0.78;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255, 91, 110, 0.22)";
      drawRoundRect(sx, effect.y, effect.w, effect.h, 8);
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(sx + 2, effect.y + 2, effect.w - 4, effect.h - 4);
      ctx.restore();
      continue;
    }

    if (effect.kind === "rfcMarker") {
      const sx = effect.x - cameraX;
      const alpha = Math.sin(time / 90) > 0 ? 0.95 : 0.36;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, effect.y, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx, effect.y - 38);
      ctx.lineTo(sx, effect.y + 8);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (effect.kind === "syncBeam") {
      const rect = getBossMechanicRect(effect);
      const sx = rect.x - cameraX;
      ctx.save();
      if (effect.warnTime > 0) {
        ctx.globalAlpha = Math.sin(time / 75) > 0 ? 0.9 : 0.22;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sx, effect.y);
        ctx.lineTo(effect.x2 - cameraX, effect.y);
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = `${effect.color}55`;
        drawRoundRect(sx, rect.y, rect.w, rect.h, 10);
      }
      ctx.restore();
      continue;
    }

    if (effect.kind === "memoWall") {
      const sx = effect.x - cameraX;
      ctx.save();
      ctx.globalAlpha = 0.92;
      if (effect.spriteKey && assets[effect.spriteKey]) {
        for (let y = effect.y; y < effect.y + effect.h; y += 44) {
          drawSpriteFit(assets[effect.spriteKey], sx, y, effect.w, 38, { alignY: "center", mode: "contain" });
        }
      } else {
        ctx.fillStyle = `${effect.color}66`;
        drawRoundRect(sx, effect.y, effect.w, effect.h, 10);
      }
      ctx.restore();
      continue;
    }

    if (effect.kind === "planLane") {
      const rect = getBossMechanicRect(effect);
      const sx = rect.x - cameraX;
      ctx.save();
      if (effect.warnTime > 0) {
        ctx.globalAlpha = Math.sin(time / 80) > 0 ? 0.88 : 0.22;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(sx, rect.y, rect.w, rect.h);
      } else {
        ctx.globalAlpha = 0.34;
        ctx.fillStyle = effect.color;
        drawRoundRect(sx, rect.y, rect.w, rect.h, 12);
      }
      ctx.restore();
    }
  }
}

function drawBoss() {
  if (!boss) {
    return;
  }

  drawBossMechanics(performance.now());
  for (const projectile of bossProjectiles) {
    const sx = projectile.x - cameraX;
    drawBossProjectile(projectile, sx);
  }

  const sx = boss.x - cameraX;
  ctx.save();
  ctx.shadowColor = boss.hurtTimer > 0 ? "#ff5b6e" : currentLevelConfig.theme.haze;
  ctx.shadowBlur = 24;

  // Boss Sprite
  let bossKey = `boss_${boss.name.toLowerCase().replace(' ', '_')}`;
  if (assets[bossKey]) {
    drawAnimatedCharacterSprite(assets[bossKey], boss, boss.w + 32, boss.h, {
      time: performance.now(),
      facing: boss.vx > 0 ? 1 : -1,
      referenceSpeed: 300,
      phase: boss.profile.motionPhase || 0.45,
      shadowColor: "rgba(8, 17, 30, 0.34)",
      motionStyle: boss.profile.motionStyle || null,
    });
  }

  if (boss.hp <= 0) {
    ctx.fillStyle = "rgba(8, 17, 30, 0.7)";
    drawRoundRect(sx + 4, boss.y + boss.h - 14, 92, 22, 6);
    ctx.fillStyle = currentLevelConfig.theme.glow;
    ctx.font = "700 11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OFFLINE", sx + 50, boss.y + boss.h + 1);
    ctx.restore();
    return;
  }

  // Name Tag
  ctx.fillStyle = "#0d1b2a";
  drawRoundRect(sx + 14, boss.y + boss.h - 14, 60, 22, 6);
  ctx.fillStyle = "#fff4f4";
  ctx.font = "700 11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(boss.name, sx + 44, boss.y + boss.h + 1);

  ctx.fillStyle = "rgba(8, 17, 30, 0.8)";
  drawRoundRect(sx - 18, boss.y - 20, 124, 10, 5);
  ctx.fillStyle = boss.hurtTimer > 0 ? "#ff5b6e" : currentLevelConfig.theme.glow;
  drawRoundRect(sx - 18, boss.y - 20, 124 * Math.max(0, boss.hp / boss.maxHp), 10, 5);
  ctx.restore();
}

function drawKeyboards() {
  for (const keyboard of keyboards) {
    ctx.save();
    ctx.translate(keyboard.x - cameraX + keyboard.w / 2, keyboard.y + keyboard.h / 2);
    if (keyboard.homingEnabled) {
      ctx.shadowColor = "#74f7c4";
      ctx.shadowBlur = 16;
      ctx.globalAlpha = 0.98;
    }
    ctx.rotate(keyboard.rotation);
    drawSpriteFit(assets.keyboard, -keyboard.w / 2, -keyboard.h / 2, keyboard.w, keyboard.h, { alignY: "center", mode: "cover" });
    ctx.restore();

    if (keyboard.homingEnabled) {
      ctx.save();
      ctx.strokeStyle = "rgba(116, 247, 196, 0.42)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(keyboard.x - cameraX - keyboard.vx * 0.02 + keyboard.w / 2, keyboard.y - keyboard.vy * 0.02 + keyboard.h / 2);
      ctx.lineTo(keyboard.x - cameraX - keyboard.vx * 0.08 + keyboard.w / 2, keyboard.y - keyboard.vy * 0.08 + keyboard.h / 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawKeyboardLockOns(time) {
  const targets = [];
  for (const keyboard of keyboards) {
    if (!keyboard.homingEnabled) {
      continue;
    }
    const target = getKeyboardHomingTarget(keyboard);
    if (!isKeyboardHomingTargetValid(target) || targets.includes(target)) {
      continue;
    }
    targets.push(target);
  }

  for (const target of targets) {
    const isBossTarget = target === boss;
    const lockX = target.x + target.w / 2 - cameraX;
    const lockY = target.y + target.h * (isBossTarget ? 0.34 : 0.28);
    const radius = isBossTarget ? 34 : 22;
    const pulse = 0.82 + Math.sin(time / 110) * 0.18;
    const gapAngle = (time / 260) % (Math.PI * 2);

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#74f7c4";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#74f7c4";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(lockX, lockY, radius, gapAngle + 0.45, gapAngle + Math.PI - 0.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(lockX, lockY, radius, gapAngle + Math.PI + 0.45, gapAngle + Math.PI * 2 - 0.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(lockX, lockY, Math.max(5, radius * 0.18), 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

function drawExit() {
  const sx = finishGate.x - cameraX;
  ctx.save();
  ctx.shadowColor = currentLevelConfig.theme.haze;
  ctx.shadowBlur = 28;
  drawSpriteFit(assets.cloud, sx, finishGate.y, finishGate.w, finishGate.h, { alignY: "bottom" });
  ctx.restore();
  ctx.font = "700 20px Inter, sans-serif";
  const objectiveDone = currentLevelConfig.isBossLevel ? boss && boss.hp <= 0 : player.score === currentLevelConfig.ticketTarget;
  ctx.fillStyle = objectiveDone ? currentLevelConfig.theme.glow : "#8ba6bd";
  ctx.textAlign = "center";
  ctx.fillText(objectiveDone ? "vMOTION" : currentLevelConfig.isBossLevel ? "ESCALATE MANAGER" : "RESTORE ALL VMs", sx + finishGate.w / 2, finishGate.y - 16);
}

function drawPlayer(time) {
  const config = playerConfigs[selectedPlayerKey];
  const alpha = player.invincibleTimer > 0 ? 0.45 + Math.sin(time / 50) * 0.35 : 1;
  ctx.save();
  ctx.shadowColor = currentLevelConfig.theme.haze;
  ctx.shadowBlur = 14;
  ctx.globalAlpha = alpha;
  drawAnimatedCharacterSprite(assets[selectedPlayerKey], player, config.width, config.height, {
    time,
    facing: player.facing,
    referenceSpeed: config.speed,
    phase: selectedPlayerKey === "gertjan" ? 0.55 : 0,
    shadowColor: "rgba(8, 17, 30, 0.28)",
  });
  ctx.restore();
}

function drawDebugOverlays() {
  if (!debugShowHitboxes && !debugShowPlatformTops) {
    return;
  }

  ctx.save();

  if (debugShowPlatformTops) {
    for (const platform of platforms) {
      const box = makeCollider(platform);
      const sx = box.x - cameraX;
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, box.y + 1);
      ctx.lineTo(sx + box.w, box.y + 1);
      ctx.stroke();
    }
  }

  if (debugShowHitboxes) {
    const drawBox = (entity, color) => {
      const box = makeCollider(entity);
      const sx = box.x - cameraX;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, box.y, box.w, box.h);
    };

    platforms.forEach((platform) => drawBox(platform, "#4dd0ff"));
    firewallZones.forEach((zone) => drawBox(zone, "#ff5b6e"));
    specialHazards.forEach((zone) => drawBox(zone, zone.kind === "dataLeak" ? "#4ed9b5" : zone.kind === "static" ? "#7cf7ff" : "#ffd166"));
    tickets.filter((ticket) => !ticket.taken).forEach((ticket) => drawBox({ ...ticket, y: ticket.renderY ?? ticket.y }, "#ffd166"));
    pickups.filter((pickup) => !pickup.taken).forEach((pickup) => drawBox({ ...pickup, y: pickup.renderY ?? pickup.y }, "#9bff8a"));
    users.filter((user) => !user.defeated).forEach((user) => drawBox(user, "#ff9ad5"));
    userDenialZones.forEach((zone) => drawBox(zone, "#b98cff"));
    keyboards.forEach((keyboard) => drawBox(keyboard, "#ffffff"));
    bossProjectiles.forEach((projectile) => drawBox(projectile, "#ff8b1f"));
    userProjectiles.forEach((projectile) => drawBox(projectile, "#7cf7ff"));
    if (boss && boss.hp > 0) {
      drawBox(boss, "#c792ff");
    }
    if (player) {
      drawBox(player, "#74f7c4");
      drawBox(finishGate, "#e6f2ff");
    }
  }

  ctx.fillStyle = "rgba(8, 17, 30, 0.82)";
  ctx.fillRect(12, 12, 260, 64);
  ctx.fillStyle = "#d9f6ff";
  ctx.font = "600 13px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`H hitboxes: ${debugShowHitboxes ? "on" : "off"}`, 22, 34);
  ctx.fillText(`J platform tops: ${debugShowPlatformTops ? "on" : "off"}`, 22, 54);
  ctx.fillText(`B bot: ${debugBotEnabled ? "on" : "off"}`, 22, 74);
  ctx.restore();
}

function drawScene(time) {
  ctx.save();
  if (screenShakeTimer > 0 && screenShakeStrength > 0) {
    const intensity = screenShakeStrength * Math.max(0.15, screenShakeTimer / 0.28);
    ctx.translate(randomBetween(-intensity, intensity), randomBetween(-intensity, intensity));
  }
  drawBackground(time);
  drawExit();
  drawPlatforms();
  drawDecorations();
  drawFirewalls(time);
  drawSpecialHazards(time);
  drawTickets();
  drawPickups(time);
  drawUserDenialZones(time);
  drawUsers();
  drawUserProjectiles();
  drawBoss();
  drawKeyboardLockOns(time);
  drawKeyboards();
  if (player) {
    drawPlayer(time);
  }
  drawImpactParticles();
  drawDebugOverlays();
  ctx.restore();

  if (pendingLevelRestart?.type === "restart") {
    const progress = Math.max(0, Math.min(1, pendingLevelRestart.elapsed / pendingLevelRestart.duration));
    const fade = Math.sin(progress * Math.PI);
    const detail = pendingLevelRestart.reason === "fall"
      ? "Host dropped out of the cluster. Rolling back to the start of the level..."
      : "Damage detected. Returning to the start of the current maintenance window...";
    ctx.save();
    ctx.fillStyle = `rgba(3, 8, 18, ${0.18 + fade * 0.34})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(116, 247, 196, ${0.7 + fade * 0.25})`;
    ctx.font = "800 28px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Rolling Back Snapshot", canvas.width / 2, 84);
    ctx.fillStyle = `rgba(232, 246, 255, ${0.72 + fade * 0.2})`;
    ctx.font = "600 16px Inter, sans-serif";
    ctx.fillText(detail, canvas.width / 2, 112);
    ctx.restore();
  }
}

function updateCamera() {
  const target = player.x + player.w / 2 - canvas.width / 2;
  cameraX += (target - cameraX) * 0.12;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
}

function gameLoop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  if (gameState === "playing") {
    updatePlayer(dt);
    updateSlaEscalation(dt);
    updateUsers(dt);
    updateUserProjectiles(dt);
    updateBoss(dt);
    updateKeyboards(dt);
    updateImpactParticles(dt);
    updateTickets(now);
    updatePickups(now);
    checkFirewallAndExit();
    updateCamera();
    flushPendingLevelRestart();
  } else if (gameState === "rewind") {
    updateImpactParticles(dt);
    updatePendingLevelRestart(dt);
  }

  if (player) {
    drawScene(now);
  } else {
    drawBackground(now);
  }

  requestAnimationFrame(gameLoop);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    const cacheSeparator = src.includes("?") ? "&" : "?";
    image.src = `${src}${cacheSeparator}v=${ASSET_CACHE_VERSION}`;
  });
}
function cacheLoadedAsset(key, image) {
  assets[key] = image;
  assetOpaqueBounds[key] = measureOpaqueBounds(image);
}

function isOptionalStartupAsset(key) {
  return key.includes("Var");
}

function loadOptionalAssets(entries) {
  entries.forEach(async ([key, src]) => {
    try {
      cacheLoadedAsset(key, await loadImage(src));
    } catch (_error) {
      console.warn(`Optional asset skipped: ${src}`);
    }
  });
}

function getVisualViewportRect() {
  const viewport = window.visualViewport;
  return {
    x: viewport?.offsetLeft || 0,
    y: viewport?.offsetTop || 0,
    w: viewport?.width || window.innerWidth,
    h: viewport?.height || window.innerHeight,
  };
}

function syncViewportSizing() {
  const viewport = getVisualViewportRect();
  document.documentElement.style.setProperty("--app-height", `${Math.floor(viewport.h)}px`);
}

function fitGameCanvasToStage() {
  if (!stageWrap) {
    return;
  }

  syncViewportSizing();

  const viewport = getVisualViewportRect();
  const stageRect = stageWrap.getBoundingClientRect();
  const visibleRight = viewport.x + viewport.w;
  const visibleBottom = viewport.y + viewport.h;
  const availableW = Math.max(0, Math.min(stageRect.width, visibleRight - stageRect.left, stageRect.right - viewport.x));
  const availableH = Math.max(0, Math.min(stageRect.height, visibleBottom - stageRect.top, stageRect.bottom - viewport.y));
  if (availableW <= 0 || availableH <= 0) {
    return;
  }

  const dpiGuard = Math.max(1, Math.ceil(window.devicePixelRatio || 1));
  const scale = Math.min(availableW / canvas.width, (availableH - dpiGuard) / canvas.height);
  const fittedW = Math.max(1, Math.floor(canvas.width * scale));
  const fittedH = Math.max(1, Math.floor(canvas.height * scale));
  canvas.style.width = `${fittedW}px`;
  canvas.style.height = `${fittedH}px`;
}

async function preloadAssets() {
  const entries = [
    ["paul", playerConfigs.paul.sprite],
    ["gertjan", playerConfigs.gertjan.sprite],
    ...Object.entries(staticSprites),
  ];
  const requiredEntries = entries.filter(([key]) => !isOptionalStartupAsset(key));
  const optionalEntries = entries.filter(([key]) => isOptionalStartupAsset(key));

  const loaded = await Promise.all(requiredEntries.map(async ([key, src]) => [key, await loadImage(src)]));

  for (const [key, image] of loaded) {
    cacheLoadedAsset(key, image);
  }

  loadOptionalAssets(optionalEntries);

  console.info("Enemy archetype sprites", {
    auditor: !!assets.auditorUser,
    spamCaller: !!assets.spamCallerUser,
    changeManager: !!assets.changeManagerUser,
    ransomwarePopup: !!assets.ransomwarePopupUser,
    escalationUser: !!assets.escalationUserSprite,
    ticketSpammer: !!assets.ticketSpammerUser,
  });
}

canvas.style.cursor = "default";

document.querySelectorAll(".character-card").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPlayerKey = button.dataset.player;
    if (!assetsReady) {
      pendingCampaignStart = true;
      showMessage("Loading Assets", "Preparing the first maintenance window...");
      return;
    }
    startCampaign();
  });
});

upgradeGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".upgrade-card");
  if (!button || gameState !== "upgrade") {
    return;
  }
  applyUpgrade(button.dataset.upgrade);
});

resetBestRunButton.addEventListener("click", resetBestRun);
pauseResetBestRunButton.addEventListener("click", resetBestRun);

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && (event.key === "g" || event.key === "G") && !event.repeat) {
    event.preventDefault();
    godModeEnabled = !godModeEnabled;
    console.info(`God mode ${godModeEnabled ? "enabled" : "disabled"}.`);
    return;
  }
  if (event.ctrlKey && event.shiftKey && (event.key === "a" || event.key === "A") && !event.repeat) {
    event.preventDefault();
    debugAutoAimEnabled = !debugAutoAimEnabled;
    console.info(`Smart Assist test ${debugAutoAimEnabled ? "enabled" : "disabled"}.`);
    if (player) {
      syncHud();
    }
    return;
  }
  if ((event.key === "h" || event.key === "H") && !event.repeat) {
    event.preventDefault();
    debugShowHitboxes = !debugShowHitboxes;
    return;
  }
  if ((event.key === "j" || event.key === "J") && !event.repeat) {
    event.preventDefault();
    debugShowPlatformTops = !debugShowPlatformTops;
    return;
  }
  if ((event.key === "b" || event.key === "B") && !event.repeat) {
    event.preventDefault();
    debugBotEnabled = !debugBotEnabled;
    jumpQueued = false;
    debugBotState.jumpCooldown = 0;
    debugBotState.throwCooldown = 0;
    debugBotState.stuckTimer = 0;
    debugBotState.lastX = player?.x || 0;
    return;
  }
  if ((event.key === "p" || event.key === "P" || event.key === "Escape") && !event.repeat) {
    event.preventDefault();
    if (gameState === "playing" || gameState === "paused") {
      togglePause();
    }
    return;
  }

  keys.add(event.key);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }
  if (JUMP_KEYS.has(event.key) && !event.repeat) {
    jumpQueued = true;
  }
  if ((event.key === "f" || event.key === "F" || event.key === "Enter") && !event.repeat) {
    event.preventDefault();
    throwKeyboard();
  }
  if (event.key === "r" || event.key === "R") {
    if (gameState === "select" || gameState === "upgrade" || gameState === "paused" || gameState === "rewind") {
      return;
    }
    if (gameState === "won") {
      startNextLevel();
    } else {
      startCampaign();
    }
  }
  if (event.key === "l" || event.key === "L") {
    if (gameState === "select" || gameState === "paused") {
      return;
    }
    const levelInput = Number.parseInt(window.prompt("Jump to which level?", String(currentLevel)) || "", 10);
    if (Number.isInteger(levelInput) && levelInput >= 1) {
      currentLevel = levelInput;
      resetRun(player ? player.lives : null);
    }
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

window.addEventListener("blur", () => {
  keys.clear();
});

window.addEventListener("resize", fitGameCanvasToStage);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", fitGameCanvasToStage);
  window.visualViewport.addEventListener("scroll", fitGameCanvasToStage);
}
if (window.ResizeObserver) {
  if (stageWrap) {
    new ResizeObserver(fitGameCanvasToStage).observe(stageWrap);
  }
  if (gameShell) {
    new ResizeObserver(fitGameCanvasToStage).observe(gameShell);
  }
}

preloadAssets()
  .then(() => {
    assetsReady = true;
    fitGameCanvasToStage();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    if (pendingCampaignStart) {
      pendingCampaignStart = false;
      startCampaign();
    }
  })
  .catch((error) => {
    console.error(error);
    showMessage("Asset Load Failed", `Startup failed: ${error.message}. If you opened the game as a local file, try a local web server and refresh.`);
  });







