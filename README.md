# ☕ SlideCoffee v2

> AI-Powered Presentation Builder with Human-in-the-Loop Design

SlideCoffee is a modern web application that helps you create professional presentations using AI. Chat with an AI assistant to generate slides, apply brand guidelines, and export to PowerPoint or PDF.

## ✨ Features

### Core Features
- **AI-Powered Generation**: Chat with AI to create presentations from scratch
- **Human-in-the-Loop**: Review and approve presentation plans before generation
- **Brand Management**: Create and apply brand guidelines (colors, fonts, logos)
- **Split-Screen Editor**: 30% chat interface + 70% live preview
- **Multi-Workspace**: Organize presentations across different workspaces
- **Credit System**: 3-tier subscription model (Starter/Professional/Enterprise)
- **Real-time Preview**: See slides update as you chat
- **Export**: Download as PowerPoint or PDF

### User Management
- **Authentication**: Email/password + Google OAuth
- **3-Step Onboarding**: Welcome → Workspace → Brand setup
- **User Roles**: Admin and regular users
- **Team Collaboration**: Invite team members to workspaces

### Admin Features
- **AI Provider Switching**: Choose between Manus/Claude/GPT-4
- **User Management**: View and manage all users
- **Analytics Dashboard**: Track usage and engagement
- **System Monitoring**: Database, API, and storage status

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Netlify Functions** - Serverless API
- **Supabase** - PostgreSQL database + Auth
- **Manus LLM API** - AI slide generation

### Deployment
- **Netlify** - Hosting + Functions
- **Supabase** - Database + Auth
- **GitHub** - Version control

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm 10+
- Supabase account
- Manus API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/slidecoffee-v2.git
cd slidecoffee-v2
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Set up database**
```bash
# Run the SQL schema in your Supabase SQL Editor
cat database-schema.sql
```

5. **Start development server**
```bash
pnpm dev
```

Visit `http://localhost:5173`

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Netlify:
```bash
netlify deploy --prod
```

## 📁 Project Structure

```
slidecoffee-v2/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities and configs
│   ├── pages/            # Page components
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── netlify/functions/    # Serverless functions
├── database-schema.sql   # Database schema
└── DEPLOYMENT.md         # Deployment guide
```

## 🎨 Design System

- **Primary**: Purple gradient (#7C3AED)
- **Secondary**: Mint green (#6EE7B7)
- **Typography**: Inter font family

## 💳 Credit System

- **Starter**: 75 credits/month (Free)
- **Professional**: 500 credits/month ($29/mo)
- **Enterprise**: Unlimited credits ($99/mo)

## 📄 License

MIT License

---

**Made with ☕ and AI** | Version 2.0.0

