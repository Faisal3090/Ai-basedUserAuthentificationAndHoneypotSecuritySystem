# Hackathon Demonstration Guide

Welcome to the **Behavior DNA Authentication System** demo! Follow these exact steps to cleanly demonstrate the system to the judges.

## Prerequisites

Start both the backend and frontend servers in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🛠️ Step 1: Reset the Database (Clean Slate)
Before you start the pitch or before a new judge arrives, ensure you have a clean slate to demonstrate the progression of the anomaly model.

1. Open a new terminal.
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Run the seed script:
   ```bash
   node scripts/seedDemoData.js
   ```
4. *Expected Output:* You should see a success message indicating `admin`, `alice`, and `bob` were created and all collections cleared.

---

## 👤 Step 2: Demonstrating Normal Login
1. Go to `http://localhost:5173`.
2. Login as `alice` / `alice123`.
3. **Important:** Type the password at a normal human speed, and move the mouse naturally before clicking the **Sign In** button.
4. *Result:* The login will succeed. In the backend logs or the Security Dashboard, the score will be low (e.g., `0.3`) because the system is "Building baseline".
5. Log out and repeat this 2-3 times to allow the Machine Learning model (Isolation Forest) to establish a baseline of 3+ data points.

---

## 🍯 Step 3: Demonstrating the Honeypot (Suspicious Behavior)
1. Tell the judges: *"Now I will simulate someone guessing the password, typing differently, or partially spoofing my behavior."*
2. Login as `alice` / `alice123`, but **do something unusual**:
   - Type the credentials extremely fast. 
   - Or, resize the browser window significantly smaller before logging in.
3. *Result:* The Anomaly Engine will assign a score between **0.55 and 0.70**. The frontend will simulate a successful login, but you will be redirected to the **Honeypot Dashboard**.
4. Show the judges the underlying honeypot state (the URL or the UI indicator showing it's a trap, depending on your frontend setup).
5. Open the **Security Dashboard** in another tab to show the `HoneypotLog` entry that just appeared.

---

## 🚨 Step 4: Account Lockout (High Risk / Brute Force)
1. Tell the judges: *"We also have a hard-stop protective mechanism for obvious bot behavior and brute-force attacks."*
2. **Method A (Bot behavior):** Use a script or simply click the "Sign In" button extremely quickly right after typing. (Under 500ms submit time flags as a bot).
3. **Method B (High Frequency):** Try logging in as `alice` 5 times in less than a minute. Spam the login submit.
4. *Result:* The Anomaly Engine will return a score **>= 0.85**. 
5. The frontend will block access and show a `403 Forbidden` error with **"High risk login detected"**. The account is now locked for 10 minutes.
6. Open the **Security Dashboard** to show the `SecurityIncident` that triggered the lockout.

---

## 🔓 Step 5: Unlocking the Account
If you need to show the login again without waiting 10 minutes, you can use the built-in unlock API. You can either trigger this via Postman/curl or from your admin dashboard (if implemented).

```bash
curl -X POST http://localhost:3000/api/auth/unlock-all
```

Alternatively, just run the `node scripts/seedDemoData.js` script again! Good luck!
