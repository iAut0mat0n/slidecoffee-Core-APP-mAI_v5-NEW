# SlideCoffee Render Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Created Express server with 4 API routes
- [x] Converted Netlify Functions to Express routes
- [x] Updated build scripts (frontend + tsx runtime)
- [x] Added RootRedirect component (/ → /onboarding)
- [x] Configured CORS for Netlify + Render
- [x] Tested build process (978KB bundle)
- [x] Committed changes to Git
- [x] Pushed to GitHub (main branch)

## 🔄 Render Auto-Deployment (In Progress)

Render should now be building and deploying automatically. Check:

1. **Render Dashboard**: https://dashboard.render.com
2. **Build Logs**: Look for:
   - `pnpm install` - Installing dependencies
   - `pnpm build` - Building frontend
   - `tsc -b && vite build` - TypeScript + Vite
   - `✓ built in X.XXs` - Success message
3. **Deploy Logs**: Look for:
   - `pnpm start` - Starting server
   - `tsx server/index.ts` - Running TypeScript server
   - `🚀 Server running on port XXXX` - Server started
   - `📝 Environment: production` - Production mode

## 🧪 Post-Deployment Testing

Once deployment completes, test these endpoints:

### 1. Health Check
```bash
curl https://slidecoffee-v2-new-prod.onrender.com/api/health
```
Expected: `{"status":"ok"}`

### 2. Frontend Loads
Visit: https://slidecoffee-v2-new-prod.onrender.com

Expected:
- Should redirect to `/onboarding`
- Onboarding page loads
- No console errors

### 3. Authentication
1. Click "Sign In with Google"
2. Complete OAuth flow
3. Should redirect to dashboard
4. User should be logged in

### 4. AI Chat (Non-Streaming)
1. Go to dashboard
2. Type a message in the chat
3. Should get AI response
4. Check for errors in console

### 5. AI Chat (Streaming) ⭐ KEY FEATURE
1. Go to dashboard
2. Type a message in the chat
3. Should see response appear word-by-word (streaming)
4. Check Network tab for SSE connection
5. Verify no timeout errors

### 6. Brand Creation
1. Navigate to Brands page
2. Create a new brand
3. Upload brand files (optional)
4. Should save successfully

### 7. Project Creation
1. Navigate to Projects page
2. Create a new project
3. Should save successfully

### 8. Slide Generation
1. Open a project
2. Chat with AI to generate slides
3. Approve plan
4. Should generate slides successfully

## 🔧 Troubleshooting

### Build Fails
- Check build logs for TypeScript errors
- Verify `pnpm` is being used (not `npm`)
- Check `package.json` scripts

### Server Won't Start
- Verify `tsx` is installed (should be in dependencies)
- Check environment variables in Render dashboard
- Look for port binding errors in logs

### Frontend 404
- Verify static files are in `dist/` directory
- Check Express static file serving configuration
- Verify SPA fallback is working

### API Routes 404
- Check route paths in `server/index.ts`
- Verify CORS configuration
- Check request URLs match route paths

### Streaming Not Working
- Verify Content-Type is `text/event-stream`
- Check for timeout errors in logs
- Verify SSE connection in Network tab
- Check CORS headers allow streaming

### Authentication Fails
- Verify Supabase redirect URLs include Render domain
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify OAuth callback URL

## 📋 Next Steps (After Successful Deployment)

1. **Update Netlify Landing Page**
   - Change button URLs from `/onboarding` to `https://slidecoffee-v2-new-prod.onrender.com/onboarding`
   - Deploy updated landing page
   - Test complete flow: Netlify → Render

2. **Monitor Performance**
   - Check Render metrics (CPU, memory)
   - Monitor response times
   - Watch for errors in logs

3. **Test Under Load**
   - Create multiple brands
   - Generate multiple presentations
   - Test concurrent users (if possible)

4. **Document Issues**
   - Note any bugs or errors
   - Track performance issues
   - Document workarounds

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Health check returns 200
- ✅ Frontend loads without errors
- ✅ Authentication works (Google OAuth)
- ✅ AI chat responds (non-streaming)
- ✅ **AI chat streams responses (key feature)**
- ✅ Brand creation works
- ✅ Project creation works
- ✅ Slide generation works
- ✅ No console errors
- ✅ No server errors in logs

## 🔗 Important URLs

- **Render App**: https://slidecoffee-v2-new-prod.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repo**: https://github.com/ForthLogic/slide-coffee-v2-NEW
- **Supabase**: https://oguffkeepedzwydqvqnp.supabase.co

## 📞 Support

If deployment fails:
1. Check Render build/deploy logs first
2. Review this checklist
3. Check MIGRATION_STATUS.md for details
4. Verify all environment variables are set
5. Test locally with `pnpm build && pnpm start`

---

**Current Status**: Code pushed, waiting for Render auto-deployment ⏳

