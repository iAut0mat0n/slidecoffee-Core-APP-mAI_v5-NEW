# SlideCoffee Developer Onboarding Guide

**Welcome to the SlideCoffee development team!**

This guide will help you get up to speed with the SlideCoffee codebase, development workflow, and best practices.

**Last Updated:** November 21, 2025  
**Version:** 1.0.0

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Codebase Overview](#codebase-overview)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Common Tasks](#common-tasks)
7. [Resources](#resources)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your development machine:

**Required Software:**
- **Node.js:** Version 18 or higher (check with `node --version`)
- **pnpm:** Version 8 or higher (install with `npm install -g pnpm`)
- **Git:** Latest version (check with `git --version`)
- **Code Editor:** VS Code recommended (with extensions listed below)

**Recommended VS Code Extensions:**
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Vue Plugin (`Vue.volar`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- Path Intellisense (`christian-kohler.path-intellisense`)

### Initial Setup

Follow these steps to set up your local development environment:

**Step 1: Clone the Repository**
```bash
git clone https://github.com/ForthLogic/slidecoffee-CORE-APP.git
cd slidecoffee-CORE-APP
```

**Step 2: Install Dependencies**
```bash
pnpm install
```

This will install all dependencies listed in `package.json`. The installation should take 2-3 minutes depending on your internet connection.

**Step 3: Configure Environment Variables**

Create a `.env` file in the root directory. Contact your team lead or check the team password manager for the actual values:

```bash
# .env
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_TITLE=SlideCoffee
VITE_APP_LOGO=/logo.png
```

**Important:** Never commit the `.env` file to version control. It is already listed in `.gitignore`.

**Step 4: Set Up Database**

The application requires a Supabase database with the correct schema. You have two options:

**Option A: Use Shared Development Database**
- Ask your team lead for the development database credentials
- Update your `.env` file with the shared database URL and keys
- Skip the migration step (schema is already set up)

**Option B: Create Your Own Supabase Project**
1. Go to https://supabase.com and create a free account
2. Create a new project (choose a region close to you)
3. Wait for provisioning (~2 minutes)
4. Copy the project URL and keys to your `.env` file
5. Run migrations:
   - Open Supabase dashboard → SQL Editor
   - Copy contents of `supabase/migrations/add_system_settings.sql`
   - Paste and execute

**Step 5: Start Development Server**
```bash
pnpm dev
```

This starts two servers:
- **Frontend (Vite):** http://localhost:5173
- **Backend (Express):** http://localhost:3000

**Step 6: Verify Setup**

Open your browser and navigate to http://localhost:5173. You should see the SlideCoffee landing page. Try the following:

1. Click "Sign Up" and create a test account
2. Complete the onboarding flow
3. Create a test brand
4. Create a test project

If all steps work, your environment is set up correctly!

### Troubleshooting Setup Issues

**Issue: `pnpm: command not found`**
```bash
npm install -g pnpm
```

**Issue: Port 3000 or 5173 already in use**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Issue: Supabase connection fails**
- Verify your `.env` file has correct values
- Check Supabase project is active in dashboard
- Ensure you're using the correct keys (anon vs service role)

**Issue: TypeScript errors on startup**
- Run `pnpm install` again to ensure all dependencies are installed
- Restart your code editor
- Check Node.js version is 18+

---

## Codebase Overview

### Project Structure

Understanding the project structure is crucial for navigating the codebase efficiently. Here's a detailed breakdown:

```
slidecoffee/
├── src/                          # Frontend source code
│   ├── pages/                    # Page components (one per route)
│   │   ├── DashboardNew.tsx      # Main dashboard
│   │   ├── BrandsNew.tsx         # Brand management
│   │   ├── ProjectsNew.tsx       # Project listing
│   │   ├── AIAgentCreate.tsx     # AI creation mode
│   │   └── ... (72+ page components)
│   ├── components/               # Reusable UI components
│   │   ├── AppLogo.tsx           # Dynamic logo component
│   │   ├── BrandCreationModal.tsx
│   │   ├── ProjectCreationModal.tsx
│   │   └── ... (20+ components)
│   ├── lib/                      # Utilities and libraries
│   │   ├── api-client.ts         # Fetch wrapper for API calls
│   │   ├── queries.ts            # React Query hooks
│   │   └── utils.ts              # Helper functions
│   ├── App.tsx                   # Main routing configuration
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles (Tailwind)
├── server/                       # Backend source code
│   ├── routes/                   # Express API routes
│   │   ├── auth.ts               # Authentication endpoints
│   │   ├── brands.ts             # Brand CRUD operations
│   │   ├── projects.ts           # Project CRUD operations
│   │   ├── templates-workspaces.ts
│   │   └── system-settings.ts    # Logo upload, system config
│   ├── index.ts                  # Express server entry point
│   └── middleware/               # Custom middleware (planned)
├── supabase/                     # Database migrations
│   └── migrations/
│       └── add_system_settings.sql
├── public/                       # Static assets
│   ├── logo.png                  # Default logo
│   └── ...
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── .gitignore                    # Git ignore rules
└── README.md                     # Project README
```

### Key Files Explained

**Frontend Entry Points:**

**`src/main.tsx`** - Application entry point
- Sets up React Query provider
- Configures Supabase client
- Renders root `<App />` component
- Wraps app in necessary providers

**`src/App.tsx`** - Main routing configuration
- Defines all 93+ routes using React Router
- Maps URLs to page components
- Handles 404 not found pages
- Implements protected routes (authentication required)

**`src/lib/api-client.ts`** - API client
- Wrapper around `fetch` for API calls
- Handles authentication headers
- Provides `get`, `post`, `put`, `delete` methods
- Centralized error handling

**`src/lib/queries.ts`** - React Query hooks
- Custom hooks for data fetching
- Examples: `useBrands()`, `useProjects()`, `useCreateBrand()`
- Handles caching, refetching, and mutations
- Integrates with `api-client.ts`

**Backend Entry Points:**

**`server/index.ts`** - Express server
- Initializes Express app
- Registers API routes
- Serves static files from `dist/`
- Error handling middleware

**`server/routes/brands.ts`** - Brand API routes
- `GET /api/brands` - List all brands
- `POST /api/brands` - Create new brand
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

**`server/routes/system-settings.ts`** - System configuration
- `GET /api/system-settings/:key` - Get setting value
- `POST /api/system-settings/logo` - Upload logo

### Architecture Patterns

**Frontend Architecture:**

SlideCoffee follows a **component-based architecture** with clear separation of concerns:

**Pages vs Components:**
- **Pages** (`src/pages/`) are route-level components that represent full screens
- **Components** (`src/components/`) are reusable UI elements used across multiple pages
- Pages compose components to build complete user interfaces

**Data Fetching Pattern:**
- Use React Query hooks from `src/lib/queries.ts`
- Never use `fetch` directly in components
- Leverage automatic caching and refetching
- Handle loading and error states in UI

**Example:**
```typescript
// ❌ Bad: Direct fetch in component
function Brands() {
  const [brands, setBrands] = useState([]);
  
  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data));
  }, []);
  
  return <div>{brands.map(...)}</div>;
}

// ✅ Good: React Query hook
function Brands() {
  const { data: brands, isLoading } = useBrands();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{brands?.map(...)}</div>;
}
```

**Backend Architecture:**

SlideCoffee uses a **RESTful API architecture** with Express:

**Route Organization:**
- Each feature has its own route file (e.g., `brands.ts`, `projects.ts`)
- Routes are registered in `server/index.ts`
- Middleware is applied globally or per-route

**Database Access:**
- Use Supabase client for all database operations
- Leverage Row Level Security (RLS) for authorization
- Use service role key for admin operations

**Example:**
```typescript
// server/routes/brands.ts
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/brands
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('v2_brands')
    .select('*');
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
```

### Technology Stack Deep Dive

**React 19.2.0:**
- Latest version with concurrent features
- Automatic batching for better performance
- Improved TypeScript support

**TypeScript 5.9.3:**
- Strict mode enabled for type safety
- Path aliases configured (`@/` maps to `src/`)
- All code must be properly typed (no `any`)

**Tailwind CSS 4.1.17:**
- Utility-first CSS framework
- Custom configuration in `tailwind.config.js`
- No custom CSS files (use Tailwind utilities)

**React Query 5.90.10:**
- Server state management
- Automatic caching and refetching
- Optimistic updates for mutations

**Express 4.21.2:**
- Minimal web framework for Node.js
- RESTful API endpoints
- Middleware for authentication, CORS, etc.

**Supabase:**
- PostgreSQL database
- Built-in authentication
- S3-compatible storage
- Row Level Security (RLS)

---

## Development Workflow

### Git Workflow

SlideCoffee uses a **simplified Git workflow** with feature branches:

**Branch Strategy:**
- `main` - Production branch (auto-deploys to Render)
- `develop` - Development branch (optional, for staging)
- `feature/*` - Feature branches (e.g., `feature/add-export-pdf`)
- `bugfix/*` - Bug fix branches (e.g., `bugfix/fix-login-error`)

**Workflow Steps:**

**1. Create Feature Branch**
```bash
git checkout main
git pull origin main
git checkout -b feature/add-export-pdf
```

**2. Make Changes**
- Write code following code standards (see below)
- Test locally
- Commit frequently with clear messages

**3. Commit Changes**
```bash
git add .
git commit -m "Add PDF export functionality"
```

**Commit Message Format:**
```
<type>: <short description>

<detailed description (optional)>

<breaking changes (optional)>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build process or tooling changes

**Examples:**
```
feat: Add PDF export functionality

Implemented PDF export using jsPDF library. Users can now export presentations to PDF format with optional speaker notes.

fix: Resolve login redirect issue

Fixed bug where users were not redirected to dashboard after successful login. Issue was caused by incorrect route path in redirect logic.
```

**4. Push to GitHub**
```bash
git push origin feature/add-export-pdf
```

**5. Create Pull Request**
- Go to GitHub repository
- Click "Compare & pull request"
- Fill in PR description:
  - What changes were made
  - Why they were made
  - How to test
  - Screenshots (if UI changes)
- Request review from team member
- Address review comments

**6. Merge to Main**
- After approval, merge PR
- Delete feature branch
- Render automatically deploys to production

### Code Review Guidelines

**As a Reviewer:**
- Review within 24 hours
- Check for code quality, not just functionality
- Provide constructive feedback
- Approve only if you would be comfortable deploying the code

**What to Look For:**
- TypeScript errors or warnings
- Proper error handling
- Security vulnerabilities
- Performance issues
- Code duplication
- Missing tests (when applicable)
- Accessibility issues

**As a PR Author:**
- Keep PRs small and focused (< 500 lines changed)
- Write clear PR description
- Test thoroughly before requesting review
- Respond to feedback promptly
- Don't take feedback personally

### Local Development

**Running the Development Server:**
```bash
pnpm dev
```

This runs two servers concurrently:
- Frontend: http://localhost:5173 (Vite dev server with hot reload)
- Backend: http://localhost:3000 (Express API server)

**Hot Reload:**
- Frontend changes auto-reload in browser
- Backend changes require manual server restart (or use `nodemon`)

**Debugging:**

**Frontend Debugging:**
- Use React DevTools browser extension
- Use browser console for errors
- Add `console.log` statements (remove before committing)

**Backend Debugging:**
- Use VS Code debugger (launch configuration included)
- Add `console.log` statements
- Check Express logs in terminal

**Database Debugging:**
- Use Supabase dashboard → SQL Editor
- Test queries directly in SQL Editor
- Check RLS policies if queries fail

### Building for Production

**Build Command:**
```bash
pnpm build
```

This runs:
1. TypeScript compilation check
2. Vite build process
3. Output to `dist/` directory

**Test Production Build Locally:**
```bash
pnpm build
pnpm preview
```

This serves the production build at http://localhost:4173.

---

## Code Standards

### TypeScript Guidelines

**Type Safety:**
- Always define types for function parameters and return values
- Avoid `any` type - use `unknown` or proper types
- Use interfaces for object shapes
- Use type aliases for unions and primitives

**Example:**
```typescript
// ❌ Bad: No types
function createBrand(name, color) {
  return { name, color };
}

// ✅ Good: Proper types
interface Brand {
  id: string;
  name: string;
  primary_color: string;
}

function createBrand(name: string, color: string): Brand {
  return {
    id: crypto.randomUUID(),
    name,
    primary_color: color,
  };
}
```

**Null Safety:**
- Use optional chaining (`?.`) for potentially undefined values
- Use nullish coalescing (`??`) for default values
- Check for null/undefined before accessing properties

**Example:**
```typescript
// ❌ Bad: Potential runtime error
const brandName = user.workspace.brand.name;

// ✅ Good: Safe access
const brandName = user?.workspace?.brand?.name ?? 'Untitled';
```

### React Guidelines

**Component Structure:**
- Use functional components (no class components)
- Keep components small and focused (< 200 lines)
- Extract complex logic into custom hooks
- Use TypeScript for props

**Example:**
```typescript
interface BrandCardProps {
  brand: Brand;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function BrandCard({ brand, onEdit, onDelete }: BrandCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{brand.name}</h3>
      <button onClick={() => onEdit(brand.id)}>Edit</button>
      <button onClick={() => onDelete(brand.id)}>Delete</button>
    </div>
  );
}
```

**Hooks Rules:**
- Only call hooks at the top level (not in loops or conditions)
- Use `useState` for component state
- Use `useEffect` for side effects
- Use `useMemo` for expensive computations
- Use `useCallback` for function memoization

**State Management:**
- Use React Query for server state
- Use `useState` for local UI state
- Avoid prop drilling - use context if needed
- Keep state as close to where it's used as possible

### Styling Guidelines

**Tailwind CSS:**
- Use Tailwind utility classes (no custom CSS)
- Follow mobile-first approach
- Use responsive modifiers (`sm:`, `md:`, `lg:`)
- Extract repeated patterns into components

**Example:**
```typescript
// ✅ Good: Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
    Edit
  </button>
</div>
```

**Responsive Design:**
- Design mobile-first
- Test on multiple screen sizes
- Use Tailwind breakpoints consistently

**Accessibility:**
- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain color contrast ratios

### API Guidelines

**RESTful Conventions:**
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Use plural resource names (`/api/brands`, not `/api/brand`)
- Use HTTP status codes correctly
- Return JSON responses

**Status Codes:**
- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Handling:**
```typescript
// ✅ Good: Proper error handling
router.post('/brands', async (req, res) => {
  try {
    const { name, primary_color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const { data, error } = await supabase
      .from('v2_brands')
      .insert({ name, primary_color })
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create brand' });
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Testing Guidelines

### Current Testing Status

**Note:** SlideCoffee currently has no automated tests. Implementing tests is a high-priority task for the team.

### Recommended Testing Strategy

**Unit Tests:**
- Test utility functions in `src/lib/utils.ts`
- Test React Query hooks
- Test API route handlers

**Integration Tests:**
- Test API endpoints with database
- Test React components with React Query

**End-to-End Tests:**
- Test critical user flows (signup, login, create project)
- Test across different browsers

### Setting Up Testing

**Install Testing Libraries:**
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Configure Vitest:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**Example Unit Test:**
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-11-21');
    expect(formatDate(date)).toBe('Nov 21, 2025');
  });
});
```

**Example Component Test:**
```typescript
// src/components/BrandCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BrandCard from './BrandCard';

describe('BrandCard', () => {
  it('renders brand name', () => {
    const brand = { id: '1', name: 'Acme Corp', primary_color: '#FF0000' };
    render(<BrandCard brand={brand} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button clicked', () => {
    const brand = { id: '1', name: 'Acme Corp', primary_color: '#FF0000' };
    const onEdit = vi.fn();
    render(<BrandCard brand={brand} onEdit={onEdit} onDelete={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

---

## Common Tasks

### Adding a New Page

**Step 1: Create Page Component**
```typescript
// src/pages/MyNewPage.tsx
export default function MyNewPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">My New Page</h1>
      <p>Page content goes here...</p>
    </div>
  );
}
```

**Step 2: Add Route**
```typescript
// src/App.tsx
import MyNewPage from './pages/MyNewPage';

// Inside <Routes>
<Route path="/my-new-page" element={<MyNewPage />} />
```

**Step 3: Add Navigation Link**
```typescript
// In relevant component
<Link to="/my-new-page">Go to My New Page</Link>
```

### Adding a New API Endpoint

**Step 1: Create Route Handler**
```typescript
// server/routes/my-feature.ts
import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  // Implementation
  res.json({ message: 'Hello from my feature!' });
});

export default router;
```

**Step 2: Register Route**
```typescript
// server/index.ts
import myFeatureRouter from './routes/my-feature';

app.use('/api/my-feature', myFeatureRouter);
```

**Step 3: Create React Query Hook**
```typescript
// src/lib/queries.ts
export const useMyFeature = () => {
  return useQuery({
    queryKey: ['myFeature'],
    queryFn: () => apiClient.get('/my-feature'),
  });
};
```

**Step 4: Use in Component**
```typescript
// src/pages/MyPage.tsx
import { useMyFeature } from '@/lib/queries';

export default function MyPage() {
  const { data, isLoading } = useMyFeature();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data?.message}</div>;
}
```

### Adding a Database Table

**Step 1: Create Migration File**
```sql
-- supabase/migrations/add_my_table.sql
CREATE TABLE v2_my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE v2_my_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own records"
  ON v2_my_table FOR SELECT
  TO authenticated
  USING (true);
```

**Step 2: Run Migration**
- Open Supabase dashboard
- Go to SQL Editor
- Copy and paste migration SQL
- Click "Run"

**Step 3: Create TypeScript Type**
```typescript
// src/types/database.ts
export interface MyTable {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

### Debugging Common Issues

**Issue: React Query not refetching**
```typescript
// Force refetch
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['brands'] });
```

**Issue: Supabase RLS blocking query**
```typescript
// Check user authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Use service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS
);
```

**Issue: CORS error in development**
```typescript
// server/index.ts
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

---

## Resources

### Documentation

**Official Docs:**
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- React Query: https://tanstack.com/query/latest
- Express: https://expressjs.com
- Supabase: https://supabase.com/docs

**Internal Docs:**
- Technical Handover: `/home/ubuntu/TECHNICAL_HANDOVER.md`
- Features Documentation: `/home/ubuntu/FEATURES.md`
- Deployment Guide: `/home/ubuntu/DEPLOYMENT_GUIDE.md`

### Team Communication

**Channels:**
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Pull Requests: Code reviews and discussions

**Best Practices:**
- Ask questions early and often
- Document decisions in GitHub issues
- Share knowledge with team members
- Keep communication asynchronous-friendly

### Learning Path

**Week 1: Familiarization**
- Set up local environment
- Read all documentation
- Explore codebase
- Run application locally
- Create test account and explore features

**Week 2: Small Contributions**
- Fix a small bug
- Add a small feature (e.g., new button, tooltip)
- Submit first pull request
- Participate in code review

**Week 3: Medium Contributions**
- Add a new page
- Create new API endpoint
- Implement data fetching with React Query
- Write tests for new code

**Week 4: Full Feature Development**
- Implement complete feature (frontend + backend)
- Write comprehensive tests
- Update documentation
- Deploy to production

---

**Welcome to the team! We're excited to have you on board. If you have any questions, don't hesitate to ask.**

*Last updated: November 21, 2025*

