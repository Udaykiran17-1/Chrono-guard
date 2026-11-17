# SkillBridge

> Connecting skilled students with meaningful project opportunities.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (optional for local mock testing)
cp .env.example .env
# Edit .env with your Supabase credentials when ready

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧭 Application Routes

| Path | Description | Access |
|---|---|---|
| `/` | SkillBridge Landing Page (All 7 sections) | Public |
| `/login` | University member sign-in | Public |
| `/register` | Campus registration with institution selector & validation | Public |
| `/forgot-password` | Password recovery request | Public |
| `/verify-email` | Institutional email verification guidance | Public |
| `/dashboard` | Authenticated session & profile verification console | Protected |
| `/showcase` | Interactive UI component & design system showcase | Public |

---

## 📁 Project Structure

```
├── supabase/
│   ├── migrations/
│   │   └── 001_foundation_schema.sql  # PostgreSQL schema, triggers & RLS
│   └── seed.sql                       # Default university, departments & skills
├── src/
│   ├── components/
│   │   ├── layout/                    # Navbar, Footer, PageContainer, ProtectedRoute
│   │   └── ui/                        # Button, Input, Select, Card, Badge, Modal, etc.
│   ├── context/
│   │   └── AuthContext.jsx            # Authentication state & session manager
│   ├── services/
│   │   └── authService.js             # Supabase Auth client & resilient local mock fallback
│   ├── lib/
│   │   └── supabase.js                # Safe Supabase client initialization
│   ├── pages/
│   │   ├── public/                    # LandingPage, LoginPage, RegisterPage, etc.
│   │   ├── dashboard/                 # DashboardOverview (session verification)
│   │   └── ComponentShowcase.jsx      # UI component gallery
│   ├── App.jsx                        # Routing and global layout
│   └── main.jsx                       # Application mount
└── docs/
    ├── DATABASE.md                    # Relational schema & RLS specification
    ├── SECURITY.md                    # Auth & security architecture
    ├── DESIGN_SYSTEM.md               # Visual design tokens & components
    ├── DEVELOPMENT_PLAN.md            # Roadmap & milestone status
    └── CHANGELOG.md                   # Release history
```

## 🛠 Tech Stack

- **React 19** + **Vite 8** (JavaScript)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router v7**
- **Lucide React** (icons)
- **Supabase PostgreSQL** + **Supabase Auth** (with sandbox fallback)

## 📚 Documentation
- [Database Schema & Triggers](./docs/DATABASE.md)
- [Security & RLS Policies](./docs/SECURITY.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Development Plan](./docs/DEVELOPMENT_PLAN.md)
- [Changelog](./docs/CHANGELOG.md)
