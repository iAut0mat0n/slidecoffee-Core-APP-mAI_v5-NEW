# SlideCoffee UI Implementation Plan

Based on 42 mockup files in `/home/ubuntu/slidecoffee-v2/mockups/`

## Phase 1: Core Pages (Priority 1)

### 1. Landing Page
- File: `01_landing_page.png`
- Route: `/`
- Components needed: Hero, Features, Pricing, CTA

### 2. Modern Signup/Login
- Files: `04_modern_signup.png`, `04_modern_signup_v2.png`
- Route: `/signup`, `/login`
- Full-screen design with coffee theme

### 3. Onboarding Flow (4 steps)
- Files: `07_onboarding_step1_v3.png`, `08_onboarding_step2_v3.png`, `09_onboarding_step3.png`, `21_onboarding_step4_v2.png`
- Route: `/onboarding`
- Step 1: Welcome
- Step 2: Create workspace
- Step 3: Brand setup
- Step 4: Choose creation mode

## Phase 2: Dashboard & Navigation (Priority 1)

### 4. Dashboard
- Files: `05_dashboard_empty.png`, `31_dashboard_populated_v2.png`, `32_dashboard_list_view.png`
- Route: `/dashboard`
- Empty state + populated state + list view toggle

### 5. Sidebar Navigation
- Files: `13_corrected_sidebar.png`, `19_final_sidebar.png`, `20_user_menu_expanded.png`
- Component: Persistent sidebar with:
  - Workspace switcher
  - Dashboard, Brands, Projects
  - Quick Access (Recent, Favorites)
  - Templates, Themes, Folders
  - User menu at bottom

### 6. Workspace Switcher
- File: `14_workspace_switcher.png`
- Dropdown in sidebar header

## Phase 3: Core Features (Priority 2)

### 7. Brands Page
- File: `15_brand_page.png`
- Route: `/brands`
- Brand cards with colors, fonts, logo

### 8. Projects List
- File: `16_projects_list.png`
- Route: `/projects`
- Project cards with thumbnails, status

### 9. Templates Page
- Files: `33_templates_empty.png`, `34_create_template_modal.png`
- Route: `/templates`
- Empty state + create template modal

### 10. Folders Page
- File: `35_folders_page.png`
- Route: `/folders`
- Organize projects into folders

### 11. Themes Gallery
- Files: `27_themes_gallery.png`, `28_theme_import_upload.png`, `29_theme_import_preview.png`, `30_theme_editor.png`
- Route: `/themes`
- Browse, import, edit themes

## Phase 4: Creation Modes (Priority 2)

### 12. Generate Mode
- Files: `22_generate_mode_v2.png`, `03_generation_interface.png`
- Route: `/create/generate`
- AI-powered prompt-based creation

### 13. Paste Mode
- File: `23_paste_mode_v2.png`
- Route: `/create/paste`
- Paste content and AI formats it

### 14. Import Mode
- File: `24_import_mode_upload.png`
- Route: `/create/import`
- Upload existing PowerPoint/PDF

### 15. Brewing Progress
- File: `25_brewing_progress.png`
- Modal/overlay during generation
- Coffee-themed loading animation

### 16. Success Modal
- File: `26_success_modal.png`
- Celebration after creation complete

## Phase 5: AI Agent Experience (Priority 3)

### 17. AI Agent Creation Interface
- Files: `38_ai_agent_creation_experience.png`, `39_ai_agent_research_phase.png`, `40_ai_agent_generating_slides.png`, `41_ai_agent_strategy_discussion.png`, `42_ai_agent_complete_celebration.png`
- Route: `/create/agent` or integrated into other modes
- Features:
  - Chat on left, live preview on right
  - Research phase with visible thinking
  - Real-time slide generation
  - Strategic guidance
  - Celebration on completion

### 18. Split Screen Editor
- Files: `02_split_screen_editor_v2.png`, `10_split_screen_editor.png`
- Route: `/editor/:projectId`
- Chat + live slide preview
- Real-time collaboration

## Phase 6: Settings & Admin (Priority 3)

### 19. Settings/Profile
- File: `06_settings_profile.png`
- Route: `/settings`
- User profile, preferences

### 20. Subscription Page
- File: `17_subscription_page.png`
- Route: `/subscription`
- Pricing tiers, upgrade/downgrade

### 21. Team Members
- File: `18_team_members.png`
- Route: `/team`
- Invite, manage team members

### 22. Admin Dashboard
- File: `11_admin_dashboard.png`
- Route: `/admin`
- Admin-only analytics and controls

### 23. System Settings
- File: `12_system_settings.png`
- Route: `/admin/settings`
- System-wide configuration

## Phase 7: Modals & Overlays (Priority 2)

### 24. Export Dropdown
- File: `36_export_dropdown.png`
- Component: Export menu (PDF, PPT, Google Slides)

### 25. Share Link Modal
- File: `37_share_link_modal.png`
- Component: Share presentation with permissions

## Implementation Order

1. **Week 1 (Priority 1):**
   - Landing page
   - Signup/Login
   - Onboarding flow
   - Dashboard (empty + populated)
   - Sidebar navigation

2. **Week 2 (Priority 2):**
   - Brands page
   - Projects page
   - Creation modes (Generate, Paste, Import)
   - Brewing progress + success modal
   - Export/Share modals

3. **Week 3 (Priority 3):**
   - AI Agent experience
   - Split screen editor
   - Templates page
   - Themes gallery
   - Folders page

4. **Week 4 (Priority 3):**
   - Settings pages
   - Subscription page
   - Team members
   - Admin dashboard

## Design System

All screens use:
- **Colors:** Purple (#7C3AED primary), coffee browns, gradients
- **Typography:** Modern sans-serif (Inter/SF Pro)
- **Components:** Cards, modals, sidebars, buttons
- **Animations:** Smooth transitions, coffee-themed loaders
- **Layout:** Full-screen, spacious, modern SaaS aesthetic

## Next Steps

1. Review mockups visually
2. Build component library (Button, Card, Modal, etc.)
3. Implement pages in priority order
4. Use placeholder data for now
5. Fix backend integration after UI is complete

