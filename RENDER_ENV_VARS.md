# Required Environment Variables for Render

## ⚠️ CRITICAL - Add These to Render Dashboard

You currently only have Supabase variables. **The app will not work without the Manus API credentials.**

Go to: **Render Dashboard → Your Service → Environment Tab**

## Required Variables

### 1. Supabase (Already Added ✅)
```
VITE_SUPABASE_URL = https://oguffkeepedzwydqvqnp.supabase.co
VITE_SUPABASE_ANON_KEY = (your Supabase anon key)
```

### 2. Manus API (MISSING - ADD NOW ⚠️)
```
VITE_MANUS_API_URL = https://api.manus.im
VITE_MANUS_API_KEY = sk-bldcgj5tKuk1leCce2s79fb6m63KJ33Re04tg04XNn9LsCLy1b4YO7bflCCqKI1azHIKUYvH5Qhwj4mK
```

**Without these, AI chat will not work!**

### 3. App Configuration (Optional but Recommended)
```
NODE_ENV = production
VITE_APP_URL = https://slidecoffee-v2-new-prod.onrender.com
```

### 4. API Base URL (Optional)
```
VITE_API_BASE_URL = https://slidecoffee-v2-new-prod.onrender.com
```

## How to Add in Render

1. Go to https://dashboard.render.com
2. Click on your service: `slidecoffee-v2-new-prod`
3. Click **"Environment"** tab in the left sidebar
4. Click **"Add Environment Variable"** button
5. For each variable above:
   - Enter **Key** (e.g., `VITE_MANUS_API_URL`)
   - Enter **Value** (e.g., `https://api.manus.im`)
   - Click **"Add"**
6. After adding all variables, click **"Save Changes"**
7. Render will automatically redeploy with new variables

## Verification

After adding variables and redeploying, check:

1. **Build Logs** - Should see environment variables being used
2. **Runtime Logs** - Should see server start without errors
3. **Test AI Chat** - Should get responses from Manus API

## What Each Variable Does

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key for auth | ✅ Yes |
| `VITE_MANUS_API_URL` | Manus AI API endpoint | ✅ Yes |
| `VITE_MANUS_API_KEY` | Manus API authentication | ✅ Yes |
| `NODE_ENV` | Enables production mode | Recommended |
| `VITE_APP_URL` | App URL for redirects | Optional |
| `VITE_API_BASE_URL` | API base URL | Optional |

## Priority Order

**Add these FIRST (critical):**
1. ✅ `VITE_SUPABASE_URL` (already added)
2. ✅ `VITE_SUPABASE_ANON_KEY` (already added)
3. ⚠️ `VITE_MANUS_API_URL` (ADD NOW)
4. ⚠️ `VITE_MANUS_API_KEY` (ADD NOW)

**Add these SECOND (recommended):**
5. `NODE_ENV=production`
6. `VITE_APP_URL=https://slidecoffee-v2-new-prod.onrender.com`

## Common Issues

### AI Chat Returns Errors
- **Cause**: Missing `VITE_MANUS_API_KEY`
- **Fix**: Add Manus API credentials

### "API URL not configured" Error
- **Cause**: Missing `VITE_MANUS_API_URL`
- **Fix**: Add `https://api.manus.im`

### Authentication Fails
- **Cause**: Wrong Supabase credentials
- **Fix**: Verify Supabase URL and key

### Server Won't Start
- **Cause**: Missing environment variables
- **Fix**: Add all required variables above

## Quick Copy-Paste

For easy copy-paste into Render:

```
VITE_MANUS_API_URL
https://api.manus.im

VITE_MANUS_API_KEY
sk-bldcgj5tKuk1leCce2s79fb6m63KJ33Re04tg04XNn9LsCLy1b4YO7bflCCqKI1azHIKUYvH5Qhwj4mK

NODE_ENV
production

VITE_APP_URL
https://slidecoffee-v2-new-prod.onrender.com
```

---

**Next Step**: Add the Manus API variables to Render, then check the deployment logs!

