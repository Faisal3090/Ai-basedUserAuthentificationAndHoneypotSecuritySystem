/**
 * ═══════════════════════════════════════════════════════════════
 *  BEHAVIORAL AUTH SYSTEM — COMPLETE MONGODB SEED
 *  Matches your exact Mongoose schema (users, sessions, baselines,
 *  honeypotlogs, securityincidents)
 * 
 *  Run:  node seed-baseline.js
 *  Req:  npm install mongodb uuid
 * ═══════════════════════════════════════════════════════════════
 */

import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";

// ─────────────────────────────────────────────────────────────
//  CONFIG — edit these two lines only
// ─────────────────────────────────────────────────────────────
const MONGO_URI = "mongodb://127.0.0.1:27017";  // or your Atlas URI
const DB_NAME   = "behavioral-auth";            // your DB name
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//  YOUR REAL DEVICE PROFILE
//  Open your app → login once → copy values from the session
//  that appears in your dashboard, then paste here.
// ─────────────────────────────────────────────────────────────
const MY_DEVICE = {
  // ── Network (get from your dashboard after one real login) ──
  ip:            "157.32.xx.xx",       // your real public IP (approx ok)
  ipOctet1:      157,                  // first octet of your real IP
  ipOctet2:      32,                   // second octet of your real IP
  geo: {
    city:        "Hubballi",
    region:      "Karnataka",
    country:     "India",
    countryCode: "IN",
    org:         "AS9829 BSNL-NIB",
    lat:         15.35,
    lng:         75.13,
  },

  // ── Browser / OS (copy exactly from your dashboard) ─────────
  browser:       "Microsoft Edge 145",
  os:            "Windows 10/11",
  device:        "Desktop",
  platform:      "Win32",
  userAgent:     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0",

  // ── Screen ───────────────────────────────────────────────────
  screenWidth:   1536,
  screenHeight:  864,
  pixelRatio:    1.25,
  colorDepth:    32,
  orientation:   "landscape-primary",

  // ── Hardware ─────────────────────────────────────────────────
  cpuCores:      12,
  deviceMemory:  "8GB",
  languages:     "en-US, en",
  touchDevice:   false,

  // ── Fingerprint — PASTE YOUR REAL ONE HERE ──────────────────
  // Find it in your app dashboard under "Canvas Fingerprint" after one login
  fingerprint:   "fp_n9zyx",           // ← replace with your real fp_xxxxx value

  // ── Timezone ─────────────────────────────────────────────────
  timezoneName:  "Asia/Calcutta",
  timezoneOffset: -330,                // IST = UTC+5:30 → JS offset = -330

  // ── Behavioral ranges (natural human variation) ──────────────
  typingSpeedRange:    [48, 85],       // chars/min  (you type between these)
  mouseMovementRange:  [90, 280],      // mousemove events before submitting
  formSubmitRange:     [3200, 7800],   // ms to fill username + password
};
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//  USERS TO SEED
// ─────────────────────────────────────────────────────────────
const USERS = [
  { username: "admin", password: "admin123", role: "admin"  },
  { username: "alice", password: "alice456", role: "user"   },
  { username: "bob",   password: "bob789",   role: "user"   },
];

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
const rand     = (min, max) => Math.random() * (max - min) + min;
const randInt  = (min, max) => Math.floor(rand(min, max));
const pick     = (arr)      => arr[Math.floor(Math.random() * arr.length)];
const jitter   = (val, pct) => val * (1 + (Math.random() - 0.5) * pct);

// 18-dimensional feature extraction — must match your frontend exactly
function extractFeatures(meta) {
  const d       = new Date(meta.timestamp || Date.now());
  const hour    = d.getHours();
  const minute  = d.getMinutes();
  const timeRad = ((hour * 60 + minute) / 1440) * 2 * Math.PI;

  return [
    /* 0  timeSin        */ (Math.sin(timeRad) + 1) / 2,
    /* 1  timeCos        */ (Math.cos(timeRad) + 1) / 2,
    /* 2  typingSpeed    */ Math.min(meta.typingSpeed || 0, 300) / 300,
    /* 3  formSubmitTime */ Math.log1p(Math.min(meta.formSubmitTime || 0, 30000)) / Math.log1p(30000),
    /* 4  mouseMovements */ Math.log1p(Math.min(meta.mouseMovements || 0, 2000)) / Math.log1p(2000),
    /* 5  screenWidth    */ (meta.screenWidth  || 0) / 3840,
    /* 6  screenHeight   */ (meta.screenHeight || 0) / 2160,
    /* 7  pixelRatio     */ Math.min(meta.pixelRatio || 1, 4) / 4,
    /* 8  touchDevice    */ meta.touchDevice ? 1 : 0,
    /* 9  tzOffset       */ ((meta.timezoneOffset || 0) + 720) / 1440,
    /* 10 ipOctet1       */ (meta.ipOctet1 || 0) / 255,
    /* 11 ipOctet2       */ (meta.ipOctet2 || 0) / 255,
    /* 12 isPublicIP     */ (meta.ipOctet1 !== 192 && meta.ipOctet1 !== 10 && meta.ipOctet1 !== 172) ? 1 : 0,
    /* 13 hasScreen      */ (meta.screenWidth > 0 && meta.screenHeight > 0) ? 1 : 0,
    /* 14 cpuCores       */ Math.min(parseInt(meta.cpuCores) || 1, 32) / 32,
    /* 15 deviceMemory   */ Math.min(parseFloat(meta.deviceMemory) || 0, 16) / 16,
    /* 16 langCount      */ Math.min((meta.languages || "").split(",").length, 5) / 5,
    /* 17 fpStability    */ 0.5,
  ];
}

// Build one realistic baseline session document
function makeSession(username, hoursAgo) {
  const ts = new Date(Date.now() - hoursAgo * 3_600_000);

  const meta = {
    // Network
    ip:             MY_DEVICE.ip,
    geo:            { ...MY_DEVICE.geo },
    ipOctet1:       MY_DEVICE.ipOctet1,
    ipOctet2:       MY_DEVICE.ipOctet2,

    // Browser
    browser:        MY_DEVICE.browser,
    os:             MY_DEVICE.os,
    device:         MY_DEVICE.device,
    platform:       MY_DEVICE.platform,
    userAgent:      MY_DEVICE.userAgent,

    // Screen
    screenWidth:    MY_DEVICE.screenWidth,
    screenHeight:   MY_DEVICE.screenHeight,
    pixelRatio:     MY_DEVICE.pixelRatio,
    colorDepth:     MY_DEVICE.colorDepth,
    orientation:    MY_DEVICE.orientation,

    // Hardware
    cpuCores:       MY_DEVICE.cpuCores,
    deviceMemory:   MY_DEVICE.deviceMemory,
    languages:      MY_DEVICE.languages,
    touchDevice:    MY_DEVICE.touchDevice,

    // Fingerprint
    fingerprint:    MY_DEVICE.fingerprint,

    // Timezone
    timezoneName:   MY_DEVICE.timezoneName,
    timezoneOffset: MY_DEVICE.timezoneOffset,

    // Behavioral — natural human jitter
    typingSpeed:    Math.round(jitter(
                      rand(MY_DEVICE.typingSpeedRange[0], MY_DEVICE.typingSpeedRange[1]),
                      0.12)),
    mouseMovements: Math.round(jitter(
                      rand(MY_DEVICE.mouseMovementRange[0], MY_DEVICE.mouseMovementRange[1]),
                      0.25)),
    formSubmitTime: Math.round(jitter(
                      rand(MY_DEVICE.formSubmitRange[0], MY_DEVICE.formSubmitRange[1]),
                      0.20)),

    timestamp:      ts.toISOString(),
    sessionStart:   ts.toISOString(),
  };

  const features = extractFeatures({ ...meta, timestamp: ts.toISOString() });
  const mlScore  = parseFloat((0.22 + Math.random() * 0.13).toFixed(3)); // normal = 0.22–0.35

  return {
    username,
    sessionId:  uuidv4(),
    meta,
    analysis: {
      score:      mlScore,
      suspicious: false,
      reason:     "Seeded baseline session — normal behavior",
    },
    isHoneypot:  false,
    isBaseline:  true,           // custom flag for easy cleanup
    _features:   features,       // stored for baseline collection
    createdAt:   ts,
    updatedAt:   ts,
  };
}

// ─────────────────────────────────────────────────────────────
//  LOGIN TIME DISTRIBUTION
//  20 sessions per user, realistic spread across 10 days.
//  Times are in hoursAgo — grouped into morning / afternoon / evening.
// ─────────────────────────────────────────────────────────────
function getTimeSlots() {
  const slots = [];
  for (let day = 1; day <= 10; day++) {
    const baseHours = day * 24;
    // Pick 2 random logins per day from 3 possible windows
    const windows = [
      baseHours + randInt(14, 16),   // morning IST 8–10am  (UTC+5:30 → 14–16h UTC ago)
      baseHours + randInt(20, 22),   // afternoon IST 2–4pm
      baseHours + randInt(2,  4),    // evening IST 8–10pm
    ];
    // Use all 3 windows for first 6 days, 2 for remaining (varied density)
    const count = day <= 6 ? 2 : 1;
    for (let i = 0; i < count; i++) slots.push(windows[i]);
  }
  return slots; // ~18–20 slots total
}

// ─────────────────────────────────────────────────────────────
//  MAIN SEED
// ─────────────────────────────────────────────────────────────
async function seed() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");
    const db = client.db(DB_NAME);

    const colUsers     = db.collection("users");
    const colSessions  = db.collection("sessions");
    const colBaselines = db.collection("baselines");
    const colHoneypot  = db.collection("honeypotlogs");
    const colIncidents = db.collection("securityincidents");

    // ── 1. CLEAR OLD SEEDED DATA ───────────────────────────────
    console.log("🧹 Clearing old seeded data...");
    await colSessions.deleteMany({ isBaseline: true });
    await colBaselines.deleteMany({});
    // Optionally clear honeypot + incidents from previous tests:
    await colHoneypot.deleteMany({});
    await colIncidents.deleteMany({});
    console.log("   ✓ Cleared sessions (baseline), baselines, honeypotlogs, securityincidents\n");

    // ── 2. UPSERT USERS ────────────────────────────────────────
    console.log("👥 Upserting users...");
    for (const u of USERS) {
      await colUsers.updateOne(
        { username: u.username },
        {
          $set: {
            username:       u.username,
            password:       u.password,
            role:           u.role,
            accountLocked:  false,
            lockReason:     null,
            lockTime:       null,
            unlockAt:       null,
            failedAttempts: 0,
            updatedAt:      new Date(),
          },
          $setOnInsert: {
            loginCount: 0,
            createdAt:  new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`   ✓ ${u.username} (${u.role})`);
    }
    console.log();

    // ── 3. SEED BASELINE SESSIONS + FEATURE VECTORS ───────────
    for (const u of USERS) {
      console.log(`📊 Seeding baseline for: ${u.username}`);
      const slots    = getTimeSlots();
      const sessions = slots.map(h => makeSession(u.username, h));

      // Insert into sessions collection (matches your Session schema)
      const sessionDocs = sessions.map(s => {
        const doc = { ...s };
        delete doc._features; // remove internal field before inserting
        return doc;
      });
      await colSessions.insertMany(sessionDocs);
      console.log(`   ✓ ${sessions.length} sessions inserted into 'sessions'`);

      // Insert one baseline doc per session into baselines collection
      // (matches your Baseline schema: { username, features: [Number] })
      const baselineDocs = sessions.map(s => ({
        username:  u.username,
        features:  s._features,
        isSeeded:  true,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
      await colBaselines.insertMany(baselineDocs);
      console.log(`   ✓ ${baselineDocs.length} feature vectors inserted into 'baselines'`);

      // Update loginCount on the user
      await colUsers.updateOne(
        { username: u.username },
        { $set: { loginCount: sessions.length, updatedAt: new Date() } }
      );
      console.log(`   ✓ loginCount set to ${sessions.length}\n`);
    }

    // ── 4. SEED ONE SAMPLE HONEYPOT LOG (for demo dashboard) ──
    console.log("🕵️  Seeding 1 sample honeypot capture for demo...");
    const sampleHoneypot = {
      sessionId:        uuidv4(),
      username:         "admin",
      ip:               "185.220.101.47",
      geo: {
        city:           "Frankfurt",
        region:         "Hesse",
        country:        "Germany",
        countryCode:    "DE",
        org:            "AS24940 Hetzner Online GmbH",
        lat:            50.11,
        lng:            8.68,
      },
      device:           "Unknown/Headless",
      browser:          "python-requests/2.28.2",
      os:               "Linux x86_64",
      fingerprint:      "bot_a1b2c3d4",
      anomalyScore:     0.891,
      pagesVisited:     ["/admin/dashboard", "/admin/database", "/admin/api-keys"],
      actionsPerformed: [
        "Visited /admin/dashboard",
        "Queried table: users",
        "Attempted to export user john.doe@corp.com",
        "Revealed API key: Production API",
      ],
      entryTime:        new Date(Date.now() - 2 * 3_600_000),
      duration:         347,
      createdAt:        new Date(Date.now() - 2 * 3_600_000),
      updatedAt:        new Date(),
    };
    await colHoneypot.insertOne(sampleHoneypot);
    console.log("   ✓ Sample honeypot log inserted\n");

    // ── 5. SEED ONE SAMPLE SECURITY INCIDENT ──────────────────
    console.log("🚨 Seeding 1 sample security incident...");
    const sampleIncident = {
      username:     "admin",
      ip:           "185.220.101.47",
      country:      "Germany",
      city:         "Frankfurt",
      asn:          "AS24940",
      isp:          "Hetzner Online GmbH",
      lat:          50.11,
      lng:          8.68,
      browser:      "python-requests/2.28.2",
      os:           "Linux x86_64",
      device:       "Unknown/Headless",
      fingerprint:  "bot_a1b2c3d4",
      anomalyScore: 0.891,
      reason:       "HEADLESS_BROWSER + BOT_SPEED_SUBMIT + FINGERPRINT_MISMATCH",
      timestamp:    new Date(Date.now() - 2 * 3_600_000),
    };
    await colIncidents.insertOne(sampleIncident);
    console.log("   ✓ Sample security incident inserted\n");

    // ── 6. FINAL COUNTS ────────────────────────────────────────
    const counts = {
      users:     await colUsers.countDocuments({}),
      sessions:  await colSessions.countDocuments({ isBaseline: true }),
      baselines: await colBaselines.countDocuments({}),
      honeypot:  await colHoneypot.countDocuments({}),
      incidents: await colIncidents.countDocuments({}),
    };

    console.log("═══════════════════════════════════════════════════");
    console.log("✅  SEED COMPLETE — Collection Counts:");
    console.log(`    users             : ${counts.users}`);
    console.log(`    sessions (seeded) : ${counts.sessions}`);
    console.log(`    baselines         : ${counts.baselines}`);
    console.log(`    honeypotlogs      : ${counts.honeypot}`);
    console.log(`    securityincidents : ${counts.incidents}`);
    console.log("═══════════════════════════════════════════════════");
    console.log("");
    console.log("⚠️  NEXT STEP — Before testing attacks:");
    console.log("   1. Open your app at http://localhost:5173");
    console.log("   2. Login once normally as admin");
    console.log("   3. In the dashboard, find your real canvas fingerprint");
    console.log("      (looks like fp_xxxxxx)");
    console.log("   4. Edit MY_DEVICE.fingerprint in this file");
    console.log("   5. Re-run: node seed-baseline.js");
    console.log("");
    console.log("   Then run attacks:");
    console.log("   Windows: .\\attack-curl.ps1");
    console.log("   Node:    node attack-headless.js");

  } catch (err) {
    console.error("\n❌ Seed failed:", err.message);
    console.error(err.stack);
  } finally {
    await client.close();
  }
}

seed();
