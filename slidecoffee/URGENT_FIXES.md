# URGENT FIXES FOR PRODUCTION LAUNCH

## Critical Backend Issues (From Logs)

### 1. ❌ Placeholder Image Errors
- **Error**: `Failed to load resource: A server with the specified hostname could not be found. (150, line 0)`
- **Root Cause**: Code is trying to load `https://via.placeholder.com/150` 
- **Impact**: Logo not showing, console errors
- **Status**: INVESTIGATING - not in source code, must be in built bundle

### 2. ❌ 401 Authentication Errors on Landing Page
- **Error**: `TRPCClientError: Please login (10001)` on `subscription.getCredits`, `workspaces.list`
- **Root Cause**: Components are making authenticated API calls BEFORE user logs in
- **Impact**: Infinite 401 errors on landing page, poor UX
- **Fix Needed**: 
  - Remove all tRPC queries from landing page (Home.tsx)
  - Only query after authentication
  - Add proper loading states

### 3. ❌ Workspace Missing Error
- **Error**: "Need workspace first" when trying to add brands
- **Root Cause**: No automatic workspace creation on signup
- **Fix Needed**:
  - Auto-create default workspace on user signup
  - Add workspace creation flow in onboarding
  - Update schema to ensure every user has a workspace

## Feature Additions Needed

### 4. ⚠️ Landing Page Redesign
- **Current**: Plain, no examples, not vibrant
- **Needed**: Match Gamma.app / Beautiful.ai quality
  - Animated slide previews
  - Interactive examples
  - Beautiful gradient backgrounds
  - Product screenshots/videos
  - Customer testimonials
  - Pricing comparison
  
### 5. ⚠️ Workspace Switcher
- **Needed**: Chatley.ai style workspace switcher
  - Dropdown in sidebar
  - Create/switch workspaces
  - Team collaboration features
  - Workspace settings

## Action Plan

### Phase 1: Fix Critical Backend Issues (1-2 hours)
1. Find and remove placeholder.com references
2. Fix 401 errors on landing page
3. Add automatic workspace creation
4. Test authentication flow

### Phase 2: Workspace Management (2-3 hours)
1. Update database schema for workspaces
2. Create workspace switcher component
3. Add workspace creation UI
4. Implement team features

### Phase 3: Landing Page Redesign (3-4 hours)
1. Study Gamma.app and Beautiful.ai
2. Create animated slide preview component
3. Add product screenshots
4. Implement scroll animations
5. Add testimonials section

### Phase 4: Testing & Deployment (1 hour)
1. Test complete user flow
2. Fix any remaining bugs
3. Deploy to production
4. Verify all features working

## Total Estimated Time: 7-10 hours

