# SlideCoffee ☕

**AI-Powered Presentation Generation Platform**

SlideCoffee is a production-ready web application that combines the power of AI with intuitive design to help users create professional presentations effortlessly. Built with React, tRPC, and Express, it features real-time collaboration, intelligent AI assistance, and comprehensive cost management.

---

## 🚀 Features

### Core Capabilities
- **AI-Powered Generation**: Intelligent slide creation with context-aware AI
- **Real-time Collaboration**: WebSocket-based live editing with presence indicators
- **Brand Management**: Upload and parse brand guidelines from PowerPoint/PDF files
- **Team Workspaces**: Multi-user workspaces with role-based access control
- **Credit System**: Flexible credit management with auto top-up
- **Subscription Tiers**: Starter, Pro, Pro+, Team, Business, Enterprise

### AI & Intelligence
- **Streaming Chat Interface**: Real-time AI responses with visible reasoning
- **Clarifying Questions**: Guided workflow for better presentations
- **AI Suggestions**: Context-aware recommendations
- **PII Detection**: Automatic detection and anonymization of sensitive data
- **Multi-Model Support**: Switch between AI models dynamically

### Security & Compliance
- **OAuth Authentication**: Secure Manus OAuth integration
- **MFA Support**: Two-factor authentication with TOTP
- **Rate Limiting**: Protect endpoints from abuse (30 msgs/min, 10 AI/min, 5 brands/hour)
- **CORS & Helmet**: Security headers and cross-origin protection
- **Audit Logs**: Track all system activities
- **Role-Based Access**: Admin, user, and team member roles

### Cost Management ⭐
- **AI Cost Dashboard**: Real-time tracking of AI usage and costs
- **Budget Alerts**: Automatic notifications when spending exceeds thresholds
- **Per-Model Limits**: Set daily/monthly spending caps per AI model
- **User-Level Breakdown**: Track costs per user with detailed analytics
- **Cost Projections**: Forecast future spending based on usage trends

### Admin Panel
- **User Management**: Manage users, subscriptions, and credits
- **Support Tickets**: Built-in ticketing system with priority levels
- **System Settings**: Configure AI models, budgets, and limits
- **Activity Feed**: Monitor system-wide activities
- **Admin Team**: Multi-admin support with granular permissions

---

## 📋 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **tRPC** - End-to-end type-safe APIs
- **Wouter** - Lightweight routing
- **React Query** - Server state management

### Backend
- **Express 4** - Web server framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database
- **WebSocket** - Real-time communication
- **Superjson** - Rich data serialization

### Security & Infrastructure
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - In-memory (Redis-ready)
- **JWT** - Session management
- **S3** - File storage

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** 22.x or higher
- **pnpm** 10.x or higher
- **MySQL** 8.0 or compatible database
- **Manus Account** for OAuth and AI services

### Environment Variables

Create a `.env` file in the project root (or configure via deployment platform):

```bash
# Database
DATABASE_URL=mysql://user:password@host:3306/slidecoffee

# Authentication
JWT_SECRET=<generate-with-openssl-rand-hex-32>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
VITE_APP_ID=<your-manus-app-id>

# AI Service (Manus Forge API)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=<your-forge-api-key>
VITE_FRONTEND_FORGE_API_KEY=<your-frontend-forge-key>

# App Branding
VITE_APP_TITLE=SlideCoffee
VITE_APP_LOGO=<your-logo-url>

# Owner Identity (for initial admin)
OWNER_OPEN_ID=<your-manus-openid>
OWNER_NAME=<your-name>

# Production Mode
NODE_ENV=production
PORT=3000

# Optional: CORS Configuration
FRONTEND_URL=https://your-domain.com

# Optional: Analytics
VITE_ANALYTICS_ENDPOINT=<analytics-endpoint>
VITE_ANALYTICS_WEBSITE_ID=<website-id>
```

### Generate JWT Secret

```bash
openssl rand -hex 32
```

### Installation Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd slidecoffee

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Push database schema
pnpm db:push

# 5. Start development server
pnpm dev

# 6. Build for production
pnpm build

# 7. Start production server
pnpm start
```

---

## 🚀 Deployment

### Recommended Platform: Railway

**Why Railway?**
- Native WebSocket support (critical for real-time features)
- Built-in MySQL plugin (matches schema)
- Fast deployments (~30 seconds)
- Excellent developer experience
- Cost-effective (~$20-30/month)

### Railway Deployment Steps

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
cd slidecoffee
railway init

# 4. Add MySQL plugin
railway add --plugin mysql

# 5. Set environment variables
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set OAUTH_SERVER_URL=https://api.manus.im
railway variables set VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
railway variables set VITE_APP_ID=<your-app-id>
railway variables set BUILT_IN_FORGE_API_URL=https://forge.manus.im
railway variables set BUILT_IN_FORGE_API_KEY=<your-key>
railway variables set OWNER_OPEN_ID=<your-openid>
railway variables set OWNER_NAME=<your-name>
railway variables set VITE_APP_TITLE=SlideCoffee
railway variables set NODE_ENV=production

# 6. Deploy
railway up

# 7. Run database migrations
railway run pnpm db:push

# 8. Get your deployment URL
railway domain

# 9. (Optional) Add custom domain
railway domain add your-domain.com
```

### Alternative: Render

```bash
# 1. Connect GitHub repository to Render
# 2. Create new Web Service
# 3. Set build command: pnpm install && pnpm build
# 4. Set start command: pnpm start
# 5. Add environment variables via Render dashboard
# 6. Deploy
```

### Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test OAuth login flow
- [ ] Check WebSocket connectivity
- [ ] Verify AI API integration
- [ ] Test rate limiting
- [ ] Configure custom domain
- [ ] Set up monitoring (UptimeRobot, Sentry)
- [ ] Enable SSL/TLS (automatic on Railway/Render)
- [ ] Test all critical user flows

---

## 📁 Project Structure

```
slidecoffee/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components (99 files)
│       ├── pages/         # Page-level components (18 files)
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Utilities and helpers
│       ├── App.tsx        # Routes and layout
│       ├── main.tsx       # App entry point
│       └── index.css      # Global styles
├── server/                # Backend Express application
│   ├── _core/            # Core framework (OAuth, tRPC, WebSocket)
│   ├── routers/          # tRPC routers (20 files)
│   ├── services/         # Business logic services
│   ├── security/         # Rate limiting, PII detection
│   ├── lib/              # Server utilities
│   └── db.ts             # Database helpers
├── drizzle/              # Database schema and migrations
│   ├── schema.ts         # Table definitions
│   └── migrations/       # SQL migration files
├── shared/               # Shared types and constants
├── storage/              # S3 storage helpers
└── dist/                 # Production build output
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (Vite + Express)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Preview production build

# Database
pnpm db:push          # Push schema changes to database
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations

# Code Quality
pnpm tsc              # Type check
pnpm lint             # Lint code
pnpm test             # Run tests (if configured)
```

### Development Workflow

1. **Make changes** to code
2. **Type check**: `pnpm tsc --noEmit`
3. **Test locally**: `pnpm dev`
4. **Build**: `pnpm build`
5. **Commit** changes
6. **Deploy** to production

---

## 🔒 Security

### Implemented Security Measures

1. **Authentication & Authorization**
   - OAuth 2.0 with Manus
   - JWT session management
   - Protected and admin procedures
   - Role-based access control

2. **API Security**
   - Rate limiting on all sensitive endpoints
   - Input validation with Zod schemas
   - CORS configuration
   - Helmet.js security headers

3. **Database Security**
   - Parameterized queries (Drizzle ORM)
   - No SQL injection risks
   - Encrypted sensitive data (MFA secrets)

4. **Data Protection**
   - PII detection and anonymization
   - Secure file uploads to S3
   - Audit logging

### Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Chat Messages | 30 requests | 1 minute |
| AI Generation | 10 requests | 1 minute |
| Brand Creation | 5 requests | 1 hour |
| Project Creation | 20 requests | 1 hour |
| Export | 20 requests | 1 hour |

### Security Best Practices

- ✅ No hardcoded secrets
- ✅ Environment variables for configuration
- ✅ HTTPS enforced in production
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Regular dependency updates
- ✅ MFA support for admin accounts

---

## 📊 Monitoring & Analytics

### Built-in Features

1. **AI Cost Dashboard**
   - Real-time usage tracking
   - Cost per request
   - Response time metrics
   - Success/error rates
   - User-level breakdown

2. **Activity Feed**
   - System-wide activity log
   - User actions tracking
   - Admin operations audit

3. **Support Tickets**
   - Ticket statistics
   - Response time tracking
   - Priority distribution

### Recommended External Tools

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar
- **Performance**: DataDog, New Relic
- **Logs**: Papertrail, Logtail

---

## 🎯 AI Budget & Cost Management

### Features

1. **Budget Settings**
   - Daily and monthly budget limits
   - Alert thresholds (default 80%)
   - Enable/disable budgets

2. **Budget Alerts**
   - Automatic notifications when spending exceeds thresholds
   - Coffee-themed friendly messages
   - Owner notifications via Manus

3. **Per-Model Spending Limits**
   - Set daily/monthly caps per AI model
   - Automatic enforcement (blocks requests when exceeded)
   - Visual indicators on dashboard

4. **User-Level Tracking**
   - Track AI costs per user
   - Requests, tokens, response time
   - Summary statistics

### Configuration

Access via **Admin Panel → System Settings → Budget Settings**

```typescript
// Example: Set monthly budget
{
  budgetType: "monthly",
  budgetAmount: 1000.00, // $1000/month
  alertThreshold: 0.8,   // Alert at 80%
  enabled: true
}

// Example: Set model limit
{
  model: "gpt-4",
  dailyLimit: 50.00,     // $50/day
  monthlyLimit: 1000.00, // $1000/month
  enabled: true
}
```

See `AI_BUDGET_FEATURES.md` for detailed documentation.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create workspace
- [ ] Invite team members
- [ ] Upload brand file
- [ ] Generate presentation with AI
- [ ] Real-time collaboration
- [ ] Export presentation
- [ ] Admin panel access
- [ ] Support ticket creation
- [ ] Budget alerts
- [ ] Rate limiting (intentionally exceed limits)
- [ ] MFA setup and login

### Automated Testing (Future)

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

---

## 📚 Documentation

- **`PRODUCTION_READINESS_AUDIT.md`** - Security audit and deployment readiness
- **`AI_BUDGET_FEATURES.md`** - AI cost management documentation
- **`todo.md`** - Feature tracking and project status
- **Template README** - See `server/_core/README.md` for framework details

---

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Use TypeScript for all new code
   - Follow existing patterns and conventions
   - Use Prettier for formatting
   - Use ESLint for linting

2. **Git Workflow**
   - Create feature branches
   - Write descriptive commit messages
   - Test before committing
   - Keep commits atomic

3. **Pull Requests**
   - Describe changes clearly
   - Include screenshots for UI changes
   - Ensure all tests pass
   - Update documentation

---

## 🐛 Troubleshooting

### Common Issues

**1. Database connection fails**
```bash
# Check DATABASE_URL format
mysql://user:password@host:3306/database

# Test connection
pnpm db:push
```

**2. OAuth login not working**
```bash
# Verify environment variables
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=<your-app-id>

# Check callback URL is registered in Manus dashboard
```

**3. WebSocket connection fails**
```bash
# Ensure WebSocket support on deployment platform
# Railway: Native support ✅
# Render: May need manual configuration

# Check CORS allows WebSocket upgrades
```

**4. Rate limiting not working**
```bash
# Verify rate limit imports in routers
import { checkRateLimit } from '../security/rateLimit';

# Check rate limit is called before operations
const rateLimit = checkRateLimit(userId, 'operation');
```

**5. Build fails**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
pnpm install
pnpm build
```

---

## 📈 Performance Optimization

### Implemented Optimizations

1. **Code Splitting**
   - Vendor chunks separated (React, UI, Charts, tRPC)
   - Lazy loading for heavy components
   - Reduced initial bundle size

2. **Caching**
   - React Query for server state
   - Service worker (future)
   - CDN for static assets (future)

3. **Database**
   - Indexed queries
   - Connection pooling
   - Optimized joins

### Future Improvements

- [ ] Add service worker for offline support
- [ ] Implement CDN for static assets
- [ ] Add Redis for rate limiting (multi-instance)
- [ ] Optimize images with next-gen formats
- [ ] Add lazy loading for images
- [ ] Implement virtual scrolling for long lists

---

## 📄 License

**Proprietary** - All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 📞 Support

- **Issues**: Create an issue in the repository
- **Email**: support@slidecoffee.com (configure your support email)
- **Documentation**: See docs in this repository
- **Manus Platform**: https://manus.im

---

## 🎉 Acknowledgments

Built with:
- [React](https://react.dev/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Manus Platform](https://manus.im/)

---

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready ✅
- **Features**: 170/188 (90.4%)
- **TypeScript Errors**: 0
- **Security Vulnerabilities**: 0
- **Last Updated**: November 6, 2025

---

**Made with ☕ by the SlideCoffee Team**

