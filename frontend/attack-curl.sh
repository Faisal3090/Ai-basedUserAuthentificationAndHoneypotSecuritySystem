#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  CURL ATTACK SIMULATOR — Linux / Mac / Git Bash (Windows)
#  Run: chmod +x attack-curl.sh && ./attack-curl.sh
# ═══════════════════════════════════════════════════════════════

API="http://localhost:3001"    # ← your Express backend port

echo "═══════════════════════════════════════════════════"
echo "  BEHAVIORAL AUTH — ATTACK SIMULATOR"
echo "═══════════════════════════════════════════════════"

# ── ATTACK 1: Headless bot ───────────────────────────────────
echo ""
echo "[1/3] Headless bot — Frankfurt VPS"
curl -s -X POST "$API/api/login" \
  -H "Content-Type: application/json" \
  -H "User-Agent: python-requests/2.28.2" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "meta": {
      "ip": "185.220.101.47",
      "geo": {"city":"Frankfurt","region":"Hesse","country":"Germany","countryCode":"DE","org":"AS24940 Hetzner","lat":50.11,"lng":8.68},
      "browser": "python-requests/2.28.2",
      "os": "Linux x86_64",
      "device": "Unknown/Headless",
      "platform": "Linux",
      "screenWidth": 0, "screenHeight": 0, "pixelRatio": 1,
      "colorDepth": 24, "orientation": "unknown",
      "touchDevice": false,
      "fingerprint": "bot_a1b2c3d4e5",
      "typingSpeed": 2.1, "mouseMovements": 0, "formSubmitTime": 73,
      "timezoneOffset": -60, "timezoneName": "Europe/Berlin",
      "cpuCores": 1, "deviceMemory": "unknown", "languages": "en",
      "ipOctet1": 185, "ipOctet2": 220
    }
  }' | python3 -m json.tool 2>/dev/null || echo "(no json response)"

echo ""
echo "───────────────────────────────────────────────────"

# ── ATTACK 2: Timezone mismatch ──────────────────────────────
echo ""
echo "[2/3] Timezone mismatch — New York (630 min from IST)"
curl -s -X POST "$API/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "meta": {
      "ip": "104.244.72.115",
      "geo": {"city":"New York","region":"New York","country":"United States","countryCode":"US","org":"AS36236 NetACTUATE","lat":40.71,"lng":-74.00},
      "browser": "Chrome 121",
      "os": "Windows 10/11",
      "device": "Desktop",
      "platform": "Win32",
      "screenWidth": 1920, "screenHeight": 1080, "pixelRatio": 1,
      "touchDevice": false,
      "fingerprint": "fp_attacker_nyc99",
      "typingSpeed": 58, "mouseMovements": 14, "formSubmitTime": 1850,
      "timezoneOffset": 300, "timezoneName": "America/New_York",
      "cpuCores": 4, "deviceMemory": "8GB", "languages": "en-US, en",
      "ipOctet1": 104, "ipOctet2": 244
    }
  }' | python3 -m json.tool 2>/dev/null || echo "(no json response)"

echo ""
echo "───────────────────────────────────────────────────"

# ── ATTACK 3: Mobile device flip ─────────────────────────────
echo ""
echo "[3/3] Device flip — Mobile from China"
curl -s -X POST "$API/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "alice456",
    "meta": {
      "ip": "45.33.32.156",
      "geo": {"city":"Beijing","country":"China","countryCode":"CN","org":"AS4134 CHINANET","lat":39.90,"lng":116.40},
      "browser": "Chrome 121 Mobile",
      "os": "Android 13",
      "device": "Mobile",
      "platform": "Android",
      "screenWidth": 390, "screenHeight": 844, "pixelRatio": 3,
      "touchDevice": true,
      "fingerprint": "fp_mobile_cn_8823",
      "typingSpeed": 31, "mouseMovements": 0, "formSubmitTime": 6200,
      "timezoneOffset": -480, "timezoneName": "Asia/Shanghai",
      "cpuCores": 8, "deviceMemory": "4GB", "languages": "zh-CN, en",
      "ipOctet1": 45, "ipOctet2": 33
    }
  }' | python3 -m json.tool 2>/dev/null || echo "(no json response)"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Done. Open your app → Honeypot tab for captures"
echo "═══════════════════════════════════════════════════"
