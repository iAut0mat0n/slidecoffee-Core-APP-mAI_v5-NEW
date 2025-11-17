# 🚀 Render Deployment Checklist

Use this checklist to deploy SlideCoffee to Render step-by-step.

---

## ✅ Pre-Deployment

- [ ] Code is pushed to GitHub (`ForthLogic/slide-coffee-v2-NEW`)
- [ ] All environment variables are documented
- [ ] Supabase project is set up and running
- [ ] You have a Render account

---

## 📝 Step 1: Create Web Service

1. - [ ] Go to https://dashboard.render.com/
2. - [ ] Click "New +" → "Web Service"
3. - [ ] Connect GitHub repo: `ForthLogic/slide-coffee-v2-NEW`
4. - [ ] Configure:
   - Name: `slidecoffee`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Runtime: `Node`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
   - Instance Type: `Starter` ($7/mo) or `Free` (testing)

---

## 🔑 Step 2: Add Environment Variables

Copy these from your current setup:

### Supabase (Required)
- [ ] `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

### AI Provider - Manus (Required)
- [ ] `BUILT_IN_FORGE_API_URL` = `https://api.manus.im`
- [ ] `BUILT_IN_FORGE_API_KEY` = `your-manus-api-key`

### Security (Required)
- [ ] `JWT_SECRET` = Generate random 32+ char string
- [ ] `NODE_ENV` = `production`

### Optional - Leave empty for now
- [ ] `VITE_API_BASE_URL` = (add after first deploy)

---

## 🎯 Step 3: Deploy

1. - [ ] Click "Create Web Service"
2. - [ ] Wait 5-10 minutes for build
3. - [ ] Check logs for errors
4. - [ ] Copy your Render URL (e.g., `https://slidecoffee.onrender.com`)

---

## 🔄 Step 4: Update API Base URL

1. - [ ] Go to Environment tab in Render
2. - [ ] Add: `VITE_API_BASE_URL` = `https://slidecoffee.onrender.com`
3. - [ ] Click "Save Changes" (triggers redeploy)
4. - [ ] Wait for redeploy to complete

---

## 🔐 Step 5: Update Supabase

1. - [ ] Go to Supabase Dashboard
2. - [ ] Select your project
3. - [ ] Go to Authentication → URL Configuration
4. - [ ] Add to Redirect URLs:
   - `https://slidecoffee.onrender.com`
   - `https://slidecoffee.onrender.com/auth/callback`
5. - [ ] Save changes

---

## ✨ Step 6: Test Everything

- [ ] Visit your Render URL
- [ ] Test Google OAuth login
- [ ] Create a brand
- [ ] Create a project
- [ ] Test AI chat (should stream!)
- [ ] Generate a presentation
- [ ] Export to PowerPoint
- [ ] Check all pages work

---

## 🎉 Step 7: Celebrate!

- [ ] Your app is live with streaming AI! 🚀
- [ ] Monitor logs for any errors
- [ ] Share with early users
- [ ] Plan next features

---

## 🆘 Troubleshooting

### Build fails?
- Check build logs in Render
- Verify all env vars are set
- Make sure pnpm is being used

### Auth doesn't work?
- Check Supabase redirect URLs
- Verify SUPABASE_URL and keys
- Check JWT_SECRET is set

### AI chat broken?
- Verify BUILT_IN_FORGE_API_KEY
- Check API_BASE_URL matches Render domain
- Look for errors in logs

### App won't start?
- Check start command: `pnpm start`
- Verify PORT env var (auto-set by Render)
- Check logs for startup errors

---

## 📊 Monitoring

After deployment:
- [ ] Set up uptime monitoring
- [ ] Check Render metrics dashboard
- [ ] Monitor error logs daily
- [ ] Track user feedback

---

**Need help?** See `RENDER_DEPLOYMENT.md` for detailed guide.

