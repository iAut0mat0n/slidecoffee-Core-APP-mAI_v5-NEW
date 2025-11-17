# Netlify v2 → Render Migration Status

## ✅ Completed

### 1. Express Backend Setup
- ✅ Created 4 Express routes in `server/routes/`:
  - `ai-chat.ts` - Non-streaming AI chat
  - `ai-chat-stream.ts` - Streaming AI chat with SSE
  - `generate-slides.ts` - Slide generation
  - `health.ts` - Health check endpoint
- ✅ Created `server/index.ts` - Main Express server
- ✅ Configured CORS for Netlify + Render origins
- ✅ Static file serving from `dist/` in production
- ✅ SPA fallback for React Router

### 2. Build Process
- ✅ Updated `package.json` scripts:
  - `build`: `tsc -b && vite build` (frontend only)
  - `start`: `tsx server/index.ts` (runtime TypeScript execution)
- ✅ Added `tsx` as production dependency
- ✅ Removed server TypeScript compilation (uses tsx runtime)
- ✅ Build tested successfully: 978KB bundle

### 3. Frontend Routing
- ✅ Created `RootRedirect.tsx` component
- ✅ Updated `App.tsx` to redirect `/` → `/onboarding`
- ✅ Removed landing page from Render build (stays on Netlify)

### 4. Environment Variables
- ✅ All 17 env vars already configured in Render dashboard
- ✅ Verified required vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_MANUS_API_URL`
  - `VITE_MANUS_API_KEY`
  - `NODE_ENV=production`

## ⏳ In Progress

### 5. Deployment
- ⏳ Commit and push changes to GitHub
- ⏳ Trigger Render deployment
- ⏳ Verify build succeeds
- ⏳ Test API endpoints
- ⏳ Test streaming functionality

## 📋 To Do

### 6. Netlify Landing Page Update
- [ ] Update "Get Started" button: `/onboarding` → `https://slidecoffee-v2-new-prod.onrender.com/onboarding`
- [ ] Update "Sign In" button: `/onboarding` → `https://slidecoffee-v2-new-prod.onrender.com/onboarding`
- [ ] Deploy updated landing page to Netlify
- [ ] Test complete user flow: Netlify → Render

### 7. Testing
- [ ] Test login/authentication
- [ ] Test AI chat (non-streaming)
- [ ] Test AI chat (streaming) - **KEY FEATURE**
- [ ] Test brand creation
- [ ] Test project creation
- [ ] Test slide generation
- [ ] Test all enhanced AI features (VectorMemory, RAG)

### 8. Monitoring
- [ ] Check Render logs for errors
- [ ] Monitor memory usage
- [ ] Test performance under load
- [ ] Verify streaming doesn't timeout

## 🔑 Key Changes

### Architecture Shift
```
BEFORE (Netlify):
Landing Page + App → Netlify Functions (serverless, no streaming)

AFTER (Hybrid):
Landing Page → Netlify (static)
Core App → Render (Express server, full streaming support)
```

### API Routes Conversion
```
BEFORE: netlify/functions/ai-chat-stream.ts
AFTER:  server/routes/ai-chat-stream.ts (Express route)
```

### Build Process
```
BEFORE: Vite build + Netlify Functions
AFTER:  Vite build (frontend) + tsx runtime (backend)
```

## 📊 Bundle Size Comparison

| Version | Size | Notes |
|---------|------|-------|
| Netlify v2 (with landing) | 1,035 KB | Includes LandingPage component |
| Render (no landing) | 978 KB | Landing page removed, -57 KB |

## 🚀 Next Command

```bash
cd /home/ubuntu/slidecoffee-v2
git add .
git commit -m "Migrate Netlify v2 to Render: Express backend with streaming support"
git push origin main
```

Then check Render dashboard for auto-deployment.

## 🔗 URLs

- **Render App**: https://slidecoffee-v2-new-prod.onrender.com
- **Netlify Landing**: (to be updated with Render app links)
- **Supabase**: https://oguffkeepedzwydqvqnp.supabase.co
- **Manus API**: Already configured

## 📝 Notes

- Landing page stays beautiful on Netlify (fast, free)
- Core app gets full streaming on Render ($19/month Pro plan)
- Clean separation of concerns
- User flow: Marketing → App
- All working Netlify v2 features preserved

