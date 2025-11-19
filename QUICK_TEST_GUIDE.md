# Quick Testing Guide - After Render Deployment

## 🎯 What to Test (In Order)

### 1. Health Check (30 seconds)
```bash
curl https://slidecoffee-v2-new-prod.onrender.com/api/health
```

**Expected**: `{"status":"ok"}`

**If fails**: Check Render logs for server startup errors

---

### 2. Frontend Loads (1 minute)

**Visit**: https://slidecoffee-v2-new-prod.onrender.com

**Expected**:
- Redirects to `/onboarding`
- Page loads without errors
- See onboarding chat interface

**Check**:
- Open browser DevTools → Console
- Should see no errors
- Network tab should show successful requests

**If fails**: 
- Check for 404 errors (static files not served)
- Check for CORS errors
- Check Render logs

---

### 3. AI Chat Response (2 minutes)

**On onboarding page**:
1. Type a message in the chat: "Hello"
2. Press Enter or click Send

**Expected**:
- AI responds with a greeting
- Response appears (may be instant or streaming)
- No errors in console

**If fails**:
- Check console for API errors
- Check Network tab for failed `/api/ai-chat` request
- Verify Manus API credentials are correct
- Check Render logs for API errors

---

### 4. Streaming AI Chat ⭐ (3 minutes)

**KEY FEATURE - This is why we moved to Render!**

**On onboarding page**:
1. Type a longer message: "Tell me about SlideCoffee and how it can help me create presentations"
2. Watch the response

**Expected**:
- Response appears **word-by-word** (streaming)
- Smooth, ChatGPT-like experience
- No delays or timeouts

**Check Network Tab**:
- Look for `/api/ai-chat-stream` request
- Should show `EventStream` type
- Should have `text/event-stream` content type
- Should show continuous data flow

**If fails**:
- Check for timeout errors
- Verify SSE connection established
- Check CORS headers
- Check Render logs for streaming errors

---

### 5. Authentication (3 minutes)

**Test Google OAuth**:
1. Click "Sign In with Google" (if available)
2. Complete OAuth flow
3. Should redirect back to app

**Expected**:
- OAuth completes successfully
- Redirects to `/dashboard`
- User is logged in

**If fails**:
- Check Supabase redirect URLs include Render domain
- Verify Supabase credentials
- Check browser console for auth errors

---

### 6. Full User Flow (5 minutes)

**After authentication**:

1. **Dashboard**
   - Should load user dashboard
   - See "Create Brand" or "Create Project" options
   - No errors

2. **Create Brand**
   - Navigate to Brands page
   - Create a new brand
   - Should save successfully

3. **Create Project**
   - Navigate to Projects page
   - Create a new project
   - Should save successfully

4. **AI Chat in Project**
   - Open the project
   - Chat with AI about slides
   - Should get streaming responses ⭐

---

## 🚨 Common Issues & Fixes

### Issue: Health check fails
**Fix**: Server didn't start. Check Render logs for:
- Port binding errors
- Missing dependencies
- Environment variable errors

### Issue: Frontend shows blank page
**Fix**: Static files not served. Check:
- `dist/` directory exists after build
- Express static middleware configured
- SPA fallback route exists

### Issue: AI chat returns 500 error
**Fix**: Manus API issue. Check:
- `VITE_MANUS_API_KEY` is correct
- `VITE_MANUS_API_URL` is `https://api.manus.im`
- API key has credits/is active

### Issue: Streaming doesn't work
**Fix**: SSE connection issue. Check:
- CORS headers allow streaming
- No reverse proxy timeout
- Response headers include `text/event-stream`

### Issue: Authentication fails
**Fix**: Supabase configuration. Check:
- Supabase redirect URLs include Render domain
- `VITE_SUPABASE_URL` is correct
- `VITE_SUPABASE_ANON_KEY` is correct

---

## 📊 Success Checklist

- [ ] Health check returns 200 OK
- [ ] Frontend loads at root URL
- [ ] Redirects to `/onboarding` work
- [ ] AI chat responds (non-streaming)
- [ ] **AI chat streams responses** ⭐
- [ ] Authentication works (if testing)
- [ ] Dashboard loads (if authenticated)
- [ ] Can create brands (if authenticated)
- [ ] Can create projects (if authenticated)
- [ ] No console errors
- [ ] No server errors in Render logs

---

## 🔍 Where to Look

### Render Dashboard
- **Logs Tab**: Real-time server logs
- **Events Tab**: Deployment history
- **Metrics Tab**: CPU, memory usage

### Browser DevTools
- **Console Tab**: JavaScript errors
- **Network Tab**: API requests, SSE connections
- **Application Tab**: Local storage, cookies

### Key Log Messages to Look For

**Good Signs** ✅:
```
🚀 Server running on port 10000
📝 Environment: production
✓ built in 6.08s
```

**Bad Signs** ❌:
```
Error: listen EADDRINUSE
ECONNREFUSED
API key not configured
Missing environment variable
```

---

## ⏱️ Expected Timeline

- **Build**: 2-3 minutes
- **Deploy**: 1-2 minutes
- **Total**: ~5 minutes from code push

---

## 🎯 Priority Tests

If you're short on time, test these in order:

1. ✅ Health check (proves server is running)
2. ✅ Frontend loads (proves build worked)
3. ✅ **Streaming AI chat** (proves migration succeeded)

Everything else can be tested later!

---

**Current Status**: Render is deploying with Manus API credentials ⏳

**Next**: Wait for deployment to complete, then run tests above!

