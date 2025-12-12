# Jago Community Dashboard

[![CI](https://github.com/Linaqruf/jago-community-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Linaqruf/jago-community-dashboard/actions/workflows/ci.yml)
[![Deploy](https://github.com/Linaqruf/jago-community-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/Linaqruf/jago-community-dashboard/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Author](https://img.shields.io/badge/Author-Linaqruf-blue.svg)](https://github.com/Linaqruf)

A modern, responsive financial transaction dashboard built for **Jago Bank** users. Analyze your transactions with beautiful visualizations and insightful analytics.

<img width="2559" height="1399" alt="image" src="https://github.com/user-attachments/assets/ad499ffd-4564-4508-97b3-2e01e7ad60c6" />

---

## Features

### Dashboard
- **Summary Cards** - Total income, expenses, balance, and transaction count with animated numbers
- **Trend Chart** - Monthly income vs expenses visualization (Area/Bar chart)
- **Category Breakdown** - Pie chart showing expense distribution
- **Top Merchants** - List of highest spending merchants

### Analytics
- **Period Comparison** - Compare any two months side by side
- **Savings Rate** - Calculate your savings percentage automatically

### Tools
- **Privacy Mode** - Hide all monetary values with one click
- **Export** - Export to CSV, PDF report, or PNG image for social media
- **Custom Categories** - Create rules to auto-categorize transactions
- **Responsive Design** - Works on desktop and mobile
- **Keyboard Shortcuts** - `Ctrl+K` Search, `Ctrl+U` Upload, `Ctrl+E` Export, `Ctrl+H` Hide values

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/Linaqruf/jago-community-dashboard.git

# Navigate to the project
cd jago-community-dashboard

# Install dependencies (choose one)
bun install     # Recommended
npm install     # Alternative
```

### Development

```bash
# Start development server
bun run dev     # or: npm run dev

# Open http://localhost:5173 in your browser
```

### Build

```bash
# Build for production
bun run build   # or: npm run build

# Preview production build
bun run preview # or: npm run preview
```

---

## Usage

1. Open the dashboard in your browser
2. Upload your **Jago Bank transaction history PDF** 
3. Analyze your transactions!

<img width="2559" height="1389" alt="image" src="https://github.com/user-attachments/assets/177424c9-698f-446d-a410-d3530b615094" />

### How to Export from Jago App

1. Open the Jago app on your phone
2. Go to your account/pocket
3. Tap on "History" or "Riwayat"
4. Tap the download/export icon
5. Select "PDF" format
6. Upload the downloaded PDF to this dashboard

---

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Motion** - Animations
- **Recharts** - Charts
- **PDF.js** - PDF parsing (Jago transaction history)
- **jsPDF** - PDF report export
- **Bun** - Package manager & runtime

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Header, BottomNav
│   ├── analytics/       # PeriodComparison
│   ├── export/          # ShareableCard for PNG export
│   └── modals/          # Export, Upload, CategoryRules, etc.
├── hooks/               # Custom React hooks
├── utils/               # Data processing utilities
└── context/             # React contexts
```

---

## Scripts

```bash
bun run dev        # Start dev server
bun run build      # Build for production
bun run preview    # Preview production build
bun run lint       # Run ESLint
bun run typecheck  # Run TypeScript check
```

---

## Privacy

All data stays in your browser. No data is sent to any server.
- Transaction data is processed client-side only
- Settings are stored in localStorage
- You can clear all data anytime

---

## Deployment

This project is configured to deploy automatically to GitHub Pages on every push to `main`.

### Manual Deployment

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main` branch

Live at: https://linaqruf.github.io/jago-community-dashboard

---

## Contributing

Contributions are welcome! Please open an issue or PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Apache License 2.0 - see [LICENSE](LICENSE) file for details.

