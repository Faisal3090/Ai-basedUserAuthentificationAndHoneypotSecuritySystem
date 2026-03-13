# ═══════════════════════════════════════════════════════════════
#  CURL ATTACK SIMULATOR — PowerShell (Windows)
#  Sends bot login directly to your Express /api/login endpoint
#  with metadata that fires ALL tripwires
# 
#  Run: .\attack-curl.ps1
# ═══════════════════════════════════════════════════════════════

$API = "http://localhost:3001"   # ← your Express backend port

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  BEHAVIORAL AUTH — ATTACK SIMULATOR"              -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red

# ── ATTACK 1: Headless bot from Germany ─────────────────────
Write-Host "`n[1/3] Headless bot — Frankfurt VPS (fires 5 tripwires)" -ForegroundColor Yellow
$a1 = @{
  username = "admin"
  password = "admin123"
  meta = @{
    ip            = "185.220.101.47"
    geo           = @{ city="Frankfurt"; region="Hesse"; country="Germany"; countryCode="DE"; org="AS24940 Hetzner"; lat=50.11; lng=8.68 }
    browser       = "python-requests/2.28.2"
    os            = "Linux x86_64"
    device        = "Unknown/Headless"
    platform      = "Linux"
    screenWidth   = 0
    screenHeight  = 0
    pixelRatio    = 1
    colorDepth    = 24
    orientation   = "unknown"
    touchDevice   = $false
    fingerprint   = "bot_a1b2c3d4e5"
    typingSpeed   = 2.1
    mouseMovements= 0
    formSubmitTime= 73          # 73ms — bot-speed (threshold 800ms)
    timezoneOffset= -60         # Europe/Berlin (vs your IST -330 = 270min diff → TIMEZONE_SHIFT fires)
    timezoneName  = "Europe/Berlin"
    cpuCores      = 1
    deviceMemory  = "unknown"
    languages     = "en"
    ipOctet1      = 185
    ipOctet2      = 220
  }
} | ConvertTo-Json -Depth 5

try {
  $r = Invoke-RestMethod -Uri "$API/api/login" -Method POST -Body $a1 -ContentType "application/json" -TimeoutSec 10
  Write-Host "  Response action : $($r.action)"      -ForegroundColor Cyan
  Write-Host "  Anomaly score   : $($r.anomalyScore)" -ForegroundColor Cyan
  Write-Host "  Tripwires fired : $($r.tripwires -join ', ')" -ForegroundColor Cyan
} catch {
  Write-Host "  HTTP Error: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "  (Check that your backend is running on $API)" -ForegroundColor DarkYellow
}

# ── ATTACK 2: Timezone mismatch from USA ────────────────────
Write-Host "`n[2/3] Timezone mismatch — New York (IST vs EST = 10.5hr)" -ForegroundColor Yellow
$a2 = @{
  username = "admin"
  password = "admin123"
  meta = @{
    ip            = "104.244.72.115"
    geo           = @{ city="New York"; region="New York"; country="United States"; countryCode="US"; org="AS36236 NetACTUATE Inc"; lat=40.71; lng=-74.00 }
    browser       = "Chrome 121"
    os            = "Windows 10/11"
    device        = "Desktop"
    platform      = "Win32"
    screenWidth   = 1920
    screenHeight  = 1080
    pixelRatio    = 1
    colorDepth    = 24
    orientation   = "landscape-primary"
    touchDevice   = $false
    fingerprint   = "fp_attacker_nyc99"   # different from your baseline fp_n9zyx
    typingSpeed   = 58
    mouseMovements= 14
    formSubmitTime= 1850
    timezoneOffset= 300        # EST = UTC-5 → JS offset = +300 (vs your -330 = 630min diff!)
    timezoneName  = "America/New_York"
    cpuCores      = 4
    deviceMemory  = "8GB"
    languages     = "en-US, en"
    ipOctet1      = 104
    ipOctet2      = 244
  }
} | ConvertTo-Json -Depth 5

try {
  $r = Invoke-RestMethod -Uri "$API/api/login" -Method POST -Body $a2 -ContentType "application/json" -TimeoutSec 10
  Write-Host "  Response action : $($r.action)"      -ForegroundColor Cyan
  Write-Host "  Anomaly score   : $($r.anomalyScore)" -ForegroundColor Cyan
  Write-Host "  Tripwires fired : $($r.tripwires -join ', ')" -ForegroundColor Cyan
} catch {
  Write-Host "  HTTP Error: $($_.Exception.Message)" -ForegroundColor Red
}

# ── ATTACK 3: Mobile device (you use desktop) ────────────────
Write-Host "`n[3/3] Device flip — Mobile phone from China" -ForegroundColor Yellow
$a3 = @{
  username = "alice"
  password = "alice456"
  meta = @{
    ip            = "45.33.32.156"
    geo           = @{ city="Beijing"; region="Beijing"; country="China"; countryCode="CN"; org="AS4134 CHINANET-BACKBONE"; lat=39.90; lng=116.40 }
    browser       = "Chrome 121 Mobile"
    os            = "Android 13"
    device        = "Mobile"
    platform      = "Android"
    screenWidth   = 390
    screenHeight  = 844
    pixelRatio    = 3
    colorDepth    = 24
    orientation   = "portrait-primary"
    touchDevice   = $true       # DEVICE_TYPE_FLIP fires (baseline is desktop/no touch)
    fingerprint   = "fp_mobile_cn_8823"
    typingSpeed   = 31
    mouseMovements= 0
    formSubmitTime= 6200
    timezoneOffset= -480        # CST = UTC+8 → offset = -480 (vs your -330 = 150min diff)
    timezoneName  = "Asia/Shanghai"
    cpuCores      = 8
    deviceMemory  = "4GB"
    languages     = "zh-CN, en"
    ipOctet1      = 45
    ipOctet2      = 33
  }
} | ConvertTo-Json -Depth 5

try {
  $r = Invoke-RestMethod -Uri "$API/api/login" -Method POST -Body $a3 -ContentType "application/json" -TimeoutSec 10
  Write-Host "  Response action : $($r.action)"      -ForegroundColor Cyan
  Write-Host "  Anomaly score   : $($r.anomalyScore)" -ForegroundColor Cyan
  Write-Host "  Tripwires fired : $($r.tripwires -join ', ')" -ForegroundColor Cyan
} catch {
  Write-Host "  HTTP Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ All attacks sent. Open your app → Honeypot tab"  -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
