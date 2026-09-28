# CleanTrack Nashik — Unified Civic Issue Reporting & Tracking Portal
> **"Report. Track. Improve Nashik."** | **"तक्रार नोंदवा. पाठपुरावा करा. नाशिक सुधारा."**

An enterprise-grade, accessible, and bilingual (Marathi + English) civic problem reporting and grievance tracking web application built for the citizens and municipal administrators of Nashik, Maharashtra.

🌐 **Live Production URL**: [https://cleantrack-nashik.vercel.app](https://cleantrack-nashik.vercel.app)  
📦 **GitHub Repository**: [https://github.com/Rohityadavxcode/cleantrack-nashik](https://github.com/Rohityadavxcode/cleantrack-nashik)

---

## 🏛️ Vision & Architecture

**CleanTrack Nashik** eliminates municipal grievance fragmentation by providing a single, unified civic portal for the entire Nashik Municipal Corporation (NMC) geographic area. Citizens do not need separate websites for potholes, garbage collection, water leakages, drainage overflows, or broken streetlights.

### Key Pillars:
1. **Unified Civic Coverage**: 12+ categories spanning Solid Waste Management, Roads, Water Supply, Drainage, Electrical/Lighting, Public Health, and Garden/Tree hazards.
2. **Accountable 6-Step Reporting**:
   - Step 1: Category & Subcategory Selection
   - Step 2: Camera Capture / Image Evidence with client-side canvas compression
   - Step 3: Title, Description (min 15 chars), Duration, Urgency, Traffic/Health impact
   - Step 4: Browser GPS Geolocation + Interactive Leaflet Map Picker + Nominatim Reverse Geocoding + Nashik Zone Bounding Check
   - Step 5: Duplicate Issue Detection (Haversine formula checking active complaints within 100 meters)
   - Step 6: Citizen Details (with strict privacy protection & auto-saved details) & Confirmation
   - Local Auto-Save & Recovery: Automatic form draft persistence preventing data loss on accidental refresh
3. **Public Tracking with PII Privacy Guard**: Citizens track tickets using format `CTN-YYYY-XXXXXX` (e.g. `CTN-2026-000101`). Full audit timeline, before/after resolution proof photos, and SLA deadlines are shown without leaking private citizen phone numbers or full names.
4. **Citizen Resolution Confirmation**: When marked `RESOLVED`, the citizen confirms: *"Has this problem actually been resolved?"* (Yes, Resolved / Not Fully / No, Problem Still Exists). Reopening a ticket preserves full immutable audit trails.
5. **Divisional Admin & Officer Console (`/admin` and `/admin/login`)**:
   - Dedicated administrative authentication with role checks (`ADMIN`, `OFFICER`, `SUPER_ADMIN`)
   - Strict status transition state machine preventing arbitrary lifecycle jumps
   - Nashik geospatial map view with pins and cluster overlays
   - SLA escalation background scanner and immutable administrative audit logging


---

## 🗺️ Nashik Administrative Divisions Supported

CleanTrack Nashik maps all coordinates and ward grievances across the 6 official municipal divisions:
1. **Panchavati Zone** (पंचवटी विभाग) - Ramkund, Tapovan, Dindori Road, Makhmalabad, Mhasrul.
2. **Nashik West Zone** (नाशिक पश्चिम विभाग) - College Road, Gangapur Road, Mahatma Nagar, Thatte Nagar.
3. **Nashik East Zone** (नाशिक पूर्व विभाग) - Dwarka Circle, Mumbai Naka, Shalimar, Bytco Point.
4. **CIDCO / New Nashik Zone** (सिडको / नवीन नाशिक) - Untwadi, Trimurti Chowk, Pawan Nagar, Ambad Link.
5. **Satpur Zone** (सातपूर विभाग) - Satpur MIDC, Ashoknagar, Trimbak Road, Shramik Nagar.
6. **Nashik Road Zone** (नाशिक रोड विभाग) - Railway Station Area, Jail Road, Deolali Gaon, Bytco Hospital.

---

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions & REST API)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS with custom Indian Civic & Tiranga accents
- **Database & ORM**: Prisma ORM with SQLite (portable zero-config) / PostgreSQL (production PostGIS ready)
- **Maps & Geolocation**: Leaflet & OpenStreetMap (No proprietary API key required)
- **Icons**: Lucide React
- **Validation**: Zod schema validation (server-side & client-side)
- **Testing**: Node.js Native Test Runner (`node --test`)
- **i18n**: First-class bilingual Marathi (`mr`) and English (`en`) support

---

## 📁 Clean Folder Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── complaints/              # GET (filter & search), POST (new complaint)
│   │   │   ├── [id]/                # GET detail (sanitized public or unmasked admin)
│   │   │   │   ├── status/          # POST status updates + audit log
│   │   │   │   ├── assign/          # POST department & officer assignment
│   │   │   │   └── feedback/        # POST citizen resolution confirmation
│   │   │   └── check-duplicate/     # GET Haversine duplicate check (<100m)
│   │   ├── stats/                   # GET live database metrics (Total, Under Review, Resolved)
│   │   ├── analytics/               # GET category, zone, and trend breakdowns
│   │   ├── reminders/run/           # POST SLA background escalation scan
│   │   ├── categories/              # GET categories & subcategories
│   │   ├── departments/             # GET municipal departments
│   │   ├── areas/                   # GET Nashik administrative zones
│   │   ├── notifications/           # GET citizen SMS/in-app notifications
│   │   └── audit-logs/              # GET immutable administrative audit trail
│   ├── report/page.tsx              # 6-Step Multi-Stage Reporting Wizard
│   ├── track/page.tsx               # Public Tracking & Resolution Verification
│   ├── dashboard/page.tsx           # Citizen Portal (My Complaints & Alerts)
│   ├── admin/
│   │   ├── page.tsx                 # Admin Overview Console & Live Nashik Map
│   │   ├── complaints/page.tsx      # Advanced Complaints Management & CSV Export
│   │   ├── complaints/[id]/page.tsx # Officer Dispatch, Status Transition, Proof Upload
│   │   ├── analytics/page.tsx       # City Trends & Volume Distribution
│   │   ├── map/page.tsx             # Fullscreen Geospatial Intelligence Map
│   │   ├── departments/page.tsx     # Department & Category Mapping Matrix
│   │   └── audit-logs/page.tsx      # Immutable Administrative Audit Ledger
│   ├── how-it-works/page.tsx        # Citizen Guide & SLA Targets
│   ├── help/page.tsx                # Bilingual FAQ & Nashik Emergency Helpline Directory
│   ├── login/page.tsx               # Auth with 1-Click Demo Personas
│   └── page.tsx                     # Dynamic Homepage with Live DB Stats
├── components/
│   ├── layout/                      # Header (Bilingual & Persona switcher), Footer
│   ├── maps/                        # LocationPickerMap, ComplaintDisplayMap, AdminNashikMap
│   └── ui/                          # StatusBadge, CategoryIcon
├── features/auth/                   # AuthContext with persistent personas
├── i18n/                            # LanguageContext & Translations (English / मराठी)
├── lib/                             # Prisma singleton, Nashik Constants & Geodata
├── services/
│   ├── duplicate.service.ts         # Haversine distance duplicate calculation
│   ├── notification.service.ts      # Multi-channel notification engine (In-app, SMS, Email)
│   ├── reminder.service.ts          # Automated SLA breach & reminder scheduler
│   ├── audit.service.ts             # Immutable audit logger
│   └── government-integration.service.ts # Extensible NMC API integration interface
├── types/                           # Domain TypeScript definitions
└── validations/                     # Zod validation schemas
tests/
└── system.test.mjs                  # Comprehensive unit & system test suite
scripts/
└── seed.mjs                         # Database seed script for Nashik master data
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed Master Data
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Run Unit & System Tests
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Test Personas (Available with 1-Click in Header)

| Persona | Role | Mobile / Email | Division |
| :--- | :--- | :--- | :--- |
| **Ramesh Patil** | Citizen | `9876543210` | Panchavati Zone |
| **Sunil Jadhav** | Field Officer | `9822113344` | Sanitation Inspector |
| **Suhas Kulkarni** | Administrator | `admin@cleantrack.nashik.in` | City Headquarters |

---

## 🔒 Security & Privacy Features

- **Strict PII Masking**: Citizen phone numbers (`9876543210` → `******3210`) and names (`Ramesh Patil` → `R**** P****`) are shielded from public tracking.
- **Client-Side Image Compression**: Heavy images are compressed on HTML5 Canvas prior to upload, preventing server memory bloat.
- **Server-Side Input Validation**: All payloads validated with strict Zod constraints.
- **Immutable Audit Trail**: Status changes, department dispatches, and citizen reopenings are recorded permanently in `AdminActionLog`.
- **Haversine Duplicate Detection**: Prevents duplicate spam while empowering citizens to review existing issues before submitting.

---

## 📜 Public Notice & Transparency Disclaimer
*CleanTrack Nashik is an independent civic engagement portal built for the residents of Nashik to document, report, and monitor civic issues. It does not replace emergency 112 services. It provides a clean architecture ready for official municipal integration when authorized.*
