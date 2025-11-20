# SlideCoffee Complete Workflow & Screen Map

## User Journey Flow

### 1. AUTHENTICATION FLOW
**Screens:**
- `/signup` - Modern signup (mockup 04_modern_signup_v2.png)
- `/login` - Login page (same design as signup)

**After signup → Onboarding**

---

### 2. ONBOARDING FLOW (First-time users)
**Route:** `/onboarding`

**Step 1:** Welcome (mockup 07_onboarding_step1_v3.png)
**Step 2:** Create workspace (mockup 08_onboarding_step2_v3.png)
**Step 3:** Brand setup (mockup 09_onboarding_step3.png)
**Step 4:** Choose creation mode (mockup 21_onboarding_step4_v2.png)
- Generate with AI
- Paste content
- Import file
- Start from template

**After onboarding → Dashboard**

---

### 3. MAIN APP (Post-onboarding)

#### PERSISTENT LAYOUT
**Collapsible Sidebar** (mockup 19_final_sidebar.png)
- Coffee logo + workspace switcher (mockup 14_workspace_switcher.png)
- Navigation: Dashboard, Brews, Brands, Templates, Themes, Settings
- Quick Access: Recent, Favorites
- User profile at bottom (mockup 20_user_menu_expanded.png)
- Collapse to icon-only mode (like Manus)

---

### 4. DASHBOARD (Main hub)
**Route:** `/dashboard`
**Mockups:** 31_dashboard_populated_v2.png, 32_dashboard_list_view.png

**Features:**
- Search bar
- "Create new" button → Creation mode selector
- Filter tabs: All, Recently viewed, Created by you, Favorites
- Grid/List toggle
- Project cards with coffee thumbnails ("BREW" cards)

**Empty state:** mockup 05_dashboard_empty.png

---

### 5. CREATION WORKFLOWS

#### A. GENERATE MODE (AI-powered)
**Route:** `/create/generate`
**Mockup:** 22_generate_mode_v2.png

**Flow:**
1. User enters prompt
2. AI Agent split-screen appears (mockups 38-42)
3. Left: AI chat showing research/thinking
4. Right: Live preview of slides being built
5. Progress: "Brewing" animation (mockup 25_brewing_progress.png)
6. Complete: Success modal (mockup 26_success_modal.png)
7. Redirect to: Split-screen editor

#### B. PASTE MODE
**Route:** `/create/paste`
**Mockup:** 23_paste_mode_v2.png

**Flow:**
1. User pastes content (text, outline, notes)
2. AI formats into slides
3. Same brewing → success → editor flow

#### C. IMPORT MODE
**Route:** `/create/import`
**Mockup:** 24_import_mode_upload.png

**Flow:**
1. Upload PowerPoint/PDF
2. AI extracts and enhances
3. Same brewing → success → editor flow

#### D. TEMPLATE MODE
**Route:** `/templates` → Select template → Create
**Mockup:** 33_templates_empty.png, 34_create_template_modal.png

**Flow:**
1. Browse templates
2. Select template
3. Customize with AI
4. Same brewing → success → editor flow

---

### 6. AI AGENT EXPERIENCE (Core feature)
**Route:** `/create/agent/:projectId` or integrated into all creation modes
**Mockups:** 38-42

**Split-screen layout:**
- **Left panel:** AI chat
  - Shows thinking process
  - Research findings (mockup 39)
  - Slide generation progress (mockup 40)
  - Strategic discussion (mockup 41)
  - Celebration on complete (mockup 42)
  
- **Right panel:** Live preview
  - Current slide being worked on
  - Slide thumbnails at bottom
  - Progress indicator (Slide X of Y)

**User can:**
- Guide the agent with chat
- Watch slides being built in real-time
- Provide feedback during creation

---

### 7. SPLIT-SCREEN EDITOR (Post-creation editing)
**Route:** `/editor/:projectId`
**Mockups:** 02_split_screen_editor_v2.png, 10_split_screen_editor.png

**Layout:**
- Left: Persistent AI chat for edits
- Right: Slide editor with live preview
- Top bar: Export, Share, Settings

---

### 8. PROJECTS PAGE
**Route:** `/projects`
**Mockup:** 16_projects_list.png

**Features:**
- List of all presentations
- Filter by status, date, brand
- Search
- Grid/List view
- Actions: Edit, Duplicate, Delete, Export, Share

---

### 9. BRANDS PAGE
**Route:** `/brands`
**Mockup:** 15_brand_page.png

**Features:**
- Brand cards showing colors, fonts, logo
- Create new brand
- Edit brand guidelines
- Apply brand to presentations

---

### 10. TEMPLATES PAGE
**Route:** `/templates`
**Mockups:** 33_templates_empty.png, 34_create_template_modal.png

**Features:**
- Browse template library
- Upload custom templates
- Save presentations as templates
- Preview before using

---

### 11. THEMES PAGE
**Route:** `/themes`
**Mockups:** 27-30

**Features:**
- Theme gallery (mockup 27)
- Import theme from PowerPoint (mockup 28)
- Preview imported theme (mockup 29)
- Edit theme colors/fonts (mockup 30)

---

### 12. FOLDERS PAGE
**Route:** `/folders`
**Mockup:** 35_folders_page.png

**Features:**
- Organize projects into folders
- Drag and drop
- Nested folders
- Folder permissions (for teams)

---

### 13. SETTINGS
**Route:** `/settings`
**Mockup:** 06_settings_profile.png

**Tabs:**
- Profile
- Workspace settings
- Billing & subscription
- Team members
- Integrations

---

### 14. SUBSCRIPTION PAGE
**Route:** `/subscription`
**Mockup:** 17_subscription_page.png

**Features:**
- Current plan display
- Pricing tiers
- Upgrade/downgrade
- Usage stats
- Credits display

---

### 15. TEAM MEMBERS
**Route:** `/team`
**Mockup:** 18_team_members.png

**Features:**
- Invite members
- Manage roles
- Remove members
- Permissions

---

### 16. ADMIN DASHBOARD (Admin only)
**Route:** `/admin`
**Mockup:** 11_admin_dashboard.png

**Features:**
- User analytics
- System health
- Usage metrics
- Support tickets

---

### 17. SYSTEM SETTINGS (Admin only)
**Route:** `/admin/settings`
**Mockup:** 12_system_settings.png

**Features:**
- System configuration
- API settings
- Feature flags

---

## MODALS & OVERLAYS

### Export Dropdown
**Mockup:** 36_export_dropdown.png
- Export to PDF
- Export to PowerPoint
- Export to Google Slides
- Download images

### Share Link Modal
**Mockup:** 37_share_link_modal.png
- Generate share link
- Set permissions (view/edit)
- Invite via email
- Copy link

### Brewing Progress
**Mockup:** 25_brewing_progress.png
- Coffee-themed loading animation
- Progress steps
- Time estimate
- Cancel option

### Success Modal
**Mockup:** 26_success_modal.png
- Celebration animation
- "Your BREW is ready!"
- Options: View, Edit, Share
- Create another

---

## COMPLETE SCREEN LIST TO BUILD

### Priority 1 (Core Flow)
1. ✅ Signup/Login page
2. ✅ Onboarding (4 steps)
3. ✅ Dashboard (empty + populated)
4. ✅ Collapsible sidebar
5. ✅ AI Agent split-screen
6. ✅ Split-screen editor
7. ✅ Brewing progress modal
8. ✅ Success modal

### Priority 2 (Main Features)
9. Projects page
10. Brands page
11. Generate mode page
12. Paste mode page
13. Import mode page
14. Export dropdown
15. Share modal

### Priority 3 (Extended Features)
16. Templates page
17. Themes page
18. Folders page
19. Settings page
20. Subscription page
21. Team members page

### Priority 4 (Admin)
22. Admin dashboard
23. System settings

---

## ROUTING STRUCTURE

```
/signup
/login
/onboarding

/dashboard (default after login)
/projects
/brands
/templates
/themes
/folders
/settings
/subscription
/team

/create/generate
/create/paste
/create/import
/create/agent/:projectId

/editor/:projectId

/admin (admin only)
/admin/settings (admin only)
```

---

## NEXT STEPS

1. Build collapsible sidebar component (reusable across all pages)
2. Build dashboard with coffee cards
3. Build AI agent split-screen experience
4. Build creation mode pages (generate, paste, import)
5. Build split-screen editor
6. Build modals (brewing, success, export, share)
7. Build remaining pages (projects, brands, templates, themes, folders)
8. Build settings pages
9. Build admin pages
10. Connect to backend APIs

