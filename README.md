# SkillBridge

> Connecting skilled professionals with meaningful project opportunities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the component showcase.

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Navbar, Footer, PageContainer
│   └── ui/              # Button, Input, Select, Card, Badge, Modal, Spinner, EmptyState
├── lib/
│   └── supabase.js      # Supabase client with safe env fallbacks
├── pages/
│   └── ComponentShowcase.jsx
├── App.jsx
├── main.jsx
└── index.css
docs/
├── DESIGN_SYSTEM.md
├── DEVELOPMENT_PLAN.md
├── CHANGELOG.md
└── README.md
```

## 🛠 Tech Stack

- **React 19** + **Vite 8** (JavaScript)
- **Tailwind CSS v4** (utility-first styling)
- **React Router v7** (client-side routing)
- **Lucide React** (icon library)
- **Supabase** (backend-as-a-service)

## 📚 Documentation

See the [docs/](./docs/) folder for detailed documentation:
- [Design System](./docs/DESIGN_SYSTEM.md) — Colors, typography, components
- [Development Plan](./docs/DEVELOPMENT_PLAN.md) — Milestones & roadmap
- [Changelog](./docs/CHANGELOG.md) — Version history
