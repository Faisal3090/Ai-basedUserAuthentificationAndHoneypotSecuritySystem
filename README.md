# AI-based User Authentication and Honeypot Security System

A behavioral authentication system with honeypot security that uses machine learning (Isolation Forest) to detect anomalous login behavior and redirect suspicious users to a honeypot environment.

## Features

- **Behavioral Authentication**: Uses keystroke dynamics and mouse dynamics to build user behavioral baselines
- **ML-based Anomaly Detection**: Isolation Forest algorithm detects anomalous login behavior
- **Honeypot Security**: Suspicious users are redirected to a honeypot dashboard (decoy environment)
- **Account Lockout**: High-risk logins trigger account lockout (10 minutes)
- **Security Dashboard**: Real-time monitoring of login analytics, honeypot logs, and security incidents
- **Honeypot Dashboard**: Decoy hospital management system to trap attackers

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React 19, Vite, React Router, Tailwind CSS, Recharts, Leaflet
- **ML**: Python (Isolation Forest) via `ml/isolationForest.py`
- **Database**: MongoDB

## Project Structure

```
Ai-basedUserAuthentificationAndHoneypotSecuritySystem/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── models/                # Mongoose models (User, Session, SecurityIncident, HoneypotLog, Baseline)
│   ├── routes/                # API routes (auth, sessions, honeypot, security, analytics, ipinfo)
│   ├── services/              # Business logic (anomalyEngine, ipResolver)
│   ├── scripts/               # Seed scripts (seedDemoData.js)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components (Dashboard, Login, Honeypot, Hospital, etc.)
│   │   ├── services/          # API, behaviorCollector, deviceFingerprint
│   │   └── main.jsx           # React entry point
│   ├── package.json
│   └── vite.config.js
└── ml/
    └── isolationForest.py     # Isolation Forest ML model
```

## Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017 (or set `MONGO_URI` in `.env`)
- Python 3.x with scikit-learn (for ML model)

## Getting Started

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on `mongodb://127.0.0.1:27017` or set `MONGO_URI` in `backend/.env`

### 3. Start the Backend

```bash
cd backend
npm start
```
Server runs on `http://localhost:3000`

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### 5. Seed Demo Data (Optional)

For a clean demo with pre-seeded users and baselines:

```bash
cd backend
node scripts/seedDemoData.js
```

This creates users: `admin`/`admin123`, `alice`/`alice123`, `bob`/`bob123`

## Demo Flow

See [DEMO_GUIDE.md](DEMO_GUIDE.md) for the complete hackathon demonstration guide.

### Quick Demo Steps:

1. **Start both servers** (backend on :3000, frontend on :5173)
2. **Seed demo data**: `cd backend && node scripts/seedDemoData.js`
3. **Normal login**: Login as `alice`/`alice123` normally 2-3 times to build baseline
4. **Honeypot demo**: Login as `alice` but type extremely fast or resize window → redirected to honeypot
5. **Lockout demo**: Spam login 5+ times quickly → account locked for 10 minutes
6. **Unlock**: `curl -X POST http://localhost:3000/api/auth/unlock-all` or re-run seed script

## API Endpoints

### Auth
- `POST /api/auth/login` - Login with behavioral analysis
- `POST /api/auth/register` - Register new user
- `POST /api/auth/unlock-all` - Unlock all locked accounts (admin)

### Sessions
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/:id` - Get session details

### Honeypot
- `GET /api/honeypot/logs` - Get honeypot logs
- `GET /api/honeypot/patients` - Get honeypot patients (decoy data)
- `GET /api/honeypot/appointments` - Get honeypot appointments
- `GET /api/honeypot/billing` - Get honeypot billing
- `GET /api/honeypot/admin` - Get honeypot admin data

### Security
- `GET /api/security/incidents` - Get security incidents
- `GET /api/security/baselines` - Get user baselines

### Analytics
- `GET /api/login-analytics` - Get login analytics

### IP Info
- `GET /api/ip/:ip` - Get IP geolocation info

## Default Users

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | admin |
| alice    | alice123 | user  |
| bob      | bob123   | user  |

## ML Model (Isolation Forest)

The ML model (`ml/isolationForest.py`) uses scikit-learn's Isolation Forest to detect anomalous login behavior based on:
- Keystroke timing (dwell time, flight time)
- Mouse dynamics (movement patterns, click timing)
- Device fingerprinting
- Login velocity

Run the model manually:
```bash
cd ml
python isolationForest.py
```

## Environment Variables

Create `backend/.env`:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/behavioral-auth
```

## License

ISC