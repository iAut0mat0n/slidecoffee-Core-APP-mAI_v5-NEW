# SlideCoffee - Render Deployment Guide

## Overview
This guide will help you deploy SlideCoffee to Render with full streaming AI support.

## Architecture
- **Landing Page**: Netlify (static, fast, free) - `slidecoffee-v2.netlify.app`
- **App**: Render (dynamic, WebSockets, streaming) - `slidecoffee.onrender.com`

---

## Step 1: Push Code to GitHub

Make sure your latest code is pushed to your GitHub repository:
```bash
git add .
git commit -m "Prepare for Render deployment with streaming support"
git push origin main
```

---

## Step 2: Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `ForthLogic/slide-coffee-v2-NEW`
4. Configure the service:

### Basic Settings
- **Name**: `slidecoffee`
- **Region**: `Oregon (US West)` (or closest to your users)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### Plan
- **Instance Type**: `Starter` ($7/month) or `Free` (for testing)
- ⚠️ Free tier has limitations (spins down after inactivity)

---

## Step 3: Configure Environment Variables

In Render dashboard, go to **Environment** tab and add these variables:

### Required - Supabase
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

### Required - AI Provider (Manus)
```
BUILT_IN_FORGE_API_URL = https://api.manus.im
BUILT_IN_FORGE_API_KEY = your-manus-api-key
```

### Required - Security
```
JWT_SECRET = (generate a random 32+ character string)
NODE_ENV = production
```

### Optional - API Base URL
```
VITE_API_BASE_URL = (leave empty initially, add after first deploy)
```

### Optional - Alternative AI Provider (Claude)
Only if you want to use Claude instead of Manus:
```
AI_PROVIDER = claude
ANTHROPIC_API_KEY = sk-ant-your-key
VOYAGE_API_KEY = your-voyage-key
```

---

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repo
   - Install dependencies
   - Build the app
   - Start the server
3. Wait 5-10 minutes for first deployment
4. You'll get a URL like: `https://slidecoffee.onrender.com`

---

## Step 5: Update API Base URL (Important!)

After your first successful deployment:

1. Copy your Render URL (e.g., `https://slidecoffee.onrender.com`)
2. Go back to **Environment** tab in Render
3. Add/Update:
   ```
   VITE_API_BASE_URL = https://slidecoffee.onrender.com
   ```
4. Click **"Save Changes"** (this will trigger a redeploy)

---

## Step 6: Update Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Render URL to **Redirect URLs**:
   ```
   https://slidecoffee.onrender.com
   https://slidecoffee.onrender.com/auth/callback
   ```

---

## Step 7: Test Your Deployment

1. Visit your Render URL: `https://slidecoffee.onrender.com`
2. Test authentication (Google OAuth)
3. Test AI chat (should now have streaming responses!)
4. Create a brand, create a project
5. Verify everything works

---

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all environment variables are set correctly
- Make sure `pnpm` is being used (not `npm`)

### App Won't Start
- Check start command: `pnpm start`
- Verify PORT environment variable (Render sets this automatically)
- Check logs for errors

### Authentication Fails
- Verify Supabase redirect URLs include your Render domain
- Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Make sure JWT_SECRET is set

### AI Chat Not Working
- Verify BUILT_IN_FORGE_API_KEY is set
- Check API_BASE_URL matches your Render domain
- Look for errors in Render logs

### Streaming Not Working
- Verify you're using the Render URL (not Netlify)
- Check browser console for WebSocket errors
- Ensure `ai-chat-stream` function exists

---

## Performance Tips

### Free Tier
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Good for testing, not production

### Starter Tier ($7/month)
- Always running (no spin-down)
- 512MB RAM
- Good for MVP and early users

### Scaling Up
- When you get more users, upgrade to **Standard** ($25/month)
- 2GB RAM, better performance
- Auto-scaling available

---

## Monitoring

### Health Check
Your app includes a health check endpoint:
```
https://slidecoffee.onrender.com/api/health
```

### Logs
- View real-time logs in Render dashboard
- Click **"Logs"** tab to see all server output
- Look for errors, warnings, API calls

### Metrics
- Render provides basic metrics (CPU, memory, bandwidth)
- Available in **"Metrics"** tab

---

## Custom Domain (Optional)

Once everything works, you can add your custom domain:

1. Go to **Settings** → **Custom Domain**
2. Add `app.slidecoffee.ai` (or your preferred subdomain)
3. Update DNS records as instructed by Render
4. Update VITE_API_BASE_URL to use custom domain
5. Update Supabase redirect URLs

---

## Cost Breakdown

| Service | Plan | Cost | Purpose |
|---------|------|------|---------|
| Netlify | Free | $0 | Landing page |
| Render | Starter | $7/mo | App with streaming AI |
| Supabase | Free | $0 | Database + Auth |
| **Total** | | **$7/mo** | Full stack |

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Monitor logs for errors
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring/alerts
5. ✅ Plan for scaling as you grow

---

## Support

If you encounter issues:
- Check Render logs first
- Review this guide
- Check Supabase dashboard for auth issues
- Verify all environment variables are correct

---

**Ready to deploy? Follow the steps above!** 🚀

