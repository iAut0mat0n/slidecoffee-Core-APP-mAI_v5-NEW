# SlideCoffee ☕

AI-first presentation platform that brews perfect slides.

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** Express 4 + Node.js
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **AI:** Manus AI API

## Development

```bash
# Install dependencies
pnpm install

# Run dev server (frontend + backend)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

All environment variables are managed through the Manus platform. See `.env.example` for reference.

## Deployment

Deployed on Render: https://slidecoffee-v2-new-prod.onrender.com

Build command: `pnpm install && pnpm build`
Start command: `pnpm start`

## Features

- ✨ AI-powered presentation generation
- 🎨 Brand management with themes
- 📊 Live preview and editing
- 💬 AI chat assistant
- 📤 Export to PowerPoint, PDF, Google Slides
- 👥 Collaboration and sharing

## Project Structure

```
├── src/                  # Frontend React app
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   └── lib/             # Utilities
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   └── routes/          # API routes
├── mockups/             # UI design mockups
└── public/              # Static assets
```

## License

Proprietary - ForthLogic
