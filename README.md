# MediScript — AI-Powered Unified Clinic Notes & Billing System

> ABC Health Clinic | Technical Assessment Submission

---

## Overview

MediScript is a full-stack web application that enables doctors to enter all clinical information (prescriptions, lab tests, diagnoses, observations) in a single unified input — by typing or speaking. Claude AI (Anthropic) parses the free-text into structured medical data, which is then reviewed, stored, and used to auto-generate printable reports and patient bills.

---

## Technology Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Backend     | Go 1.21 (Gin framework)  |
| Database    | PostgreSQL 15            |
| Frontend    | React 18 + Vite          |
| AI/NLP      | Anthropic Claude API     |
| Container   | Docker + Docker Compose  |

---

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 15+
- Anthropic API Key

### Option A — Docker (Recommended)
```bash
git clone <repo>
cd clinic-system

# Set your API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Start everything
docker-compose up --build
```

Open http://localhost:3000

### Option B — Local Development

**1. Database**
```bash
createdb clinic_db
# Tables are auto-created on server start
```

**2. Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and ANTHROPIC_API_KEY
go mod tidy
go run ./cmd/server
# Server starts on :8080
```

**3. Frontend**
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env
npm run dev
# App starts on :3000
```

---

## API Reference

| Method | Endpoint                       | Description                          |
|--------|--------------------------------|--------------------------------------|
| GET    | /api/v1/health                 | Health check                         |
| GET    | /api/v1/patients               | List all patients                    |
| POST   | /api/v1/patients               | Register new patient                 |
| GET    | /api/v1/doctors                | List doctors                         |
| POST   | /api/v1/classify               | AI classify text (no DB save)        |
| GET    | /api/v1/visits                 | List all visits                      |
| POST   | /api/v1/visits                 | Create visit + run AI                |
| GET    | /api/v1/visits/:id             | Get full visit with bill             |
| POST   | /api/v1/visits/finalize        | Save parsed data + generate bill     |
| PATCH  | /api/v1/visits/:id/bill        | Mark bill paid/pending               |
| GET    | /api/v1/catalogs               | Drug & test price catalogs           |

---

## Workflow

```
Doctor selects patient → Types/speaks clinical notes → AI parses text
→ Doctor reviews & edits → Finalize → Structured DB storage + Bill generated
→ Print Rx / Lab sheet / Bill
```

---

## AI Classification

Claude (claude-sonnet-4-20250514) is used with a carefully engineered system prompt that instructs it to:

1. Extract **prescriptions** — drug name, dosage, frequency, duration, route, notes
2. Extract **lab tests** — test name, standard code (CBC, FBS, LFT…), priority
3. Extract **clinical notes** — categorized as chief_complaint, history, examination, diagnosis, plan

The AI understands common medical abbreviations: TID, BD, OD, QID, PRN, IV, PO, IM, etc.

After parsing, prices are looked up from the `drug_catalog` and `test_catalog` tables using fuzzy name matching.

---

## Billing Logic

Bills are auto-generated on finalization:

```
Consultation Fee:  $30.00 (fixed)
+ Drug Total:      SUM(unit_price × quantity) per prescription
+ Lab Total:       SUM(price) per lab test
+ Other Charges:   $0 (configurable)
- Discount:        $0 (configurable)
─────────────────────────────────────
Subtotal
× Tax Rate:        5%
─────────────────────────────────────
TOTAL
```

Each line item is stored in `bill_items` for audit trail and printing.

---

## Database Schema

```
patients ──< visits >── doctors
               │
       ┌───────┼───────┐
       │       │       │
  prescriptions  lab_tests  clinical_notes
               │
             bills
               │
           bill_items
```

Supporting catalogs: `drug_catalog`, `test_catalog`

---

## Features

- ✅ Unified input screen (type or voice dictation)
- ✅ AI classification (drugs / lab tests / clinical notes)
- ✅ Editable AI results before saving
- ✅ Structured PostgreSQL storage
- ✅ Auto bill generation with line items
- ✅ Print: Prescription / Lab sheet / Bill
- ✅ Mark bill as paid
- ✅ Patient registry
- ✅ Visit history dashboard
- ✅ Sample notes for demo

---

## Project Structure

```
clinic-system/
├── backend/
│   ├── cmd/server/main.go        # Entry point
│   ├── internal/
│   │   ├── api/                  # HTTP handlers + router
│   │   ├── db/                   # DB connection + migrations
│   │   ├── models/               # Shared data models
│   │   └── services/             # Business logic + AI service
│   ├── migrations/001_init.sql   # Raw SQL schema
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                # Dashboard, NewVisit, VisitDetail, Patients
│   │   ├── components/           # Layout
│   │   └── utils/api.js          # Axios API client
│   ├── Dockerfile
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## Assumptions

1. Single-clinic deployment — no multi-tenancy
2. One doctor seeded by default (Dr. Sarah Chen)
3. Drug & test pricing from pre-seeded catalog; unmatched items default to $5/$20
4. Tax rate fixed at 5% (configurable in code)
5. Consultation fee fixed at $30 (configurable in code)
6. Voice input via Web Speech API — Chrome/Edge only
7. Currency is USD

---

## Advanced Features

- **Confidence score**: AI returns a 0–1 confidence value displayed to the user
- **Editable AI output**: Doctors can add/remove/edit before finalizing
- **Selective printing**: Separate print buttons for Rx, Lab sheet, and Bill
- **Catalog lookup**: Prices auto-populated from drug/test catalogs
- **Soft delete safety**: Cascade deletes maintain referential integrity
