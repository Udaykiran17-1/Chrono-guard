# SkillBridge

> Connecting skilled professionals with meaningful project opportunities.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Navbar, Footer, PageContainer
│   └── ui/              # Reusable UI components (Button, Input, Card, etc.)
├── lib/
│   └── supabase.js      # Supabase client with safe fallbacks
├── pages/
│   └── ComponentShowcase.jsx  # Temporary visual inspection page
├── App.jsx              # Root app with routing
├── main.jsx             # Entry point
└── index.css            # Tailwind CSS + custom styles
```

## 🛠 Tech Stack

- **React 19** + **Vite** (JavaScript)
- **Tailwind CSS v4** (utility-first CSS)
- **React Router v7** (client-side routing)
- **Lucide React** (icon library)
- **Supabase** (backend-as-a-service)

## 📚 Documentation

- [Design System](./docs/DESIGN_SYSTEM.md)
- [Development Plan](./docs/DEVELOPMENT_PLAN.md)
- [Changelog](./docs/CHANGELOG.md)
