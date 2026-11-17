# SkillBridge Design System

## Brand Identity

SkillBridge uses a LinkedIn-inspired professional design language — clean, trustworthy, and accessible.

---

## Colors

### Primary Palette

| Token             | Hex       | Usage                        |
|--------------------|-----------|------------------------------|
| Deep Indigo        | `#3730A3` | Primary actions, brand       |
| Cobalt Blue        | `#2563EB` | Links, secondary actions     |
| Teal               | `#0D9488` | Availability, verified       |

### Neutral Palette

| Token             | Hex                    | Usage                        |
|--------------------|------------------------|------------------------------|
| Canvas             | `#F3F2EF`              | Page background              |
| Card White         | `#FFFFFF`              | Card backgrounds             |
| Card Border        | `rgba(15,23,42,0.08)`  | Subtle card borders          |
| Text Primary       | `#1E293B`              | Headings, body text          |
| Text Secondary     | `#64748B`              | Descriptions, helper text    |
| Text Muted         | `#94A3B8`              | Captions, placeholders       |

### Semantic Colors

| Variant  | Background  | Text        | Usage              |
|----------|-------------|-------------|---------------------|
| Indigo   | `#EEF2FF`   | `#3730A3`   | Premium, featured   |
| Teal     | `#F0FDFA`   | `#0D9488`   | Available, verified |
| Amber    | `#FFFBEB`   | `#B45309`   | Warning, pending    |
| Red      | `#FEF2F2`   | `#DC2626`   | Error, danger       |

---

## Typography

**Font Family:** Inter (Google Fonts)

| Element      | Weight   | Size   | Line Height |
|--------------|----------|--------|-------------|
| H1           | 700 Bold | 30px   | 1.2         |
| H2           | 600 Semi | 24px   | 1.3         |
| H3           | 600 Semi | 20px   | 1.4         |
| Body         | 400 Reg  | 16px   | 1.5         |
| Small        | 400 Reg  | 14px   | 1.5         |
| Caption      | 400 Reg  | 12px   | 1.5         |

---

## Spacing & Layout

- **Navbar height:** 56px (sticky)
- **Max content width:** 1280px (`max-w-7xl`)
- **Card border-radius:** 8px
- **Card shadow:** `0 1px 3px rgba(15,23,42,0.04)`
- **Card hover shadow:** `0 4px 12px rgba(15,23,42,0.08)`
- **Page padding:** 16px mobile / 32px desktop

---

## Component Library

### Buttons
- Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
- Sizes: `sm`, `md`, `lg`
- States: `loading`, `disabled`

### Form Controls
- `Input` — with label, helper text, error state
- `Select` — with label, helper text, error state

### Cards
- `Card`, `CardHeader`, `CardBody`, `CardFooter`
- Optional hover elevation

### Badges
- Variants: `neutral`, `indigo`, `teal`, `amber`, `red`
- Supports leading icon

### Modal
- Keyboard Escape close
- Backdrop click dismiss
- Focus trapping
- Scroll lock

### Feedback
- `Spinner` (sm/md/lg/xl sizes)
- `EmptyState` (icon + title + description + optional action)

---

## Accessibility

- All interactive elements have visible focus rings (`:focus-visible`)
- Form inputs connected to labels via `htmlFor`/`id`
- Error states use `role="alert"` and `aria-invalid`
- Modal uses `role="dialog"`, `aria-modal`, focus trap
- Color contrast meets WCAG AA
