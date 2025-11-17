# Sidebar Enhancement Plan

**Created:** November 4, 2025  
**Status:** Planned for Week 1-2 Implementation

---

## Current State vs Competitors

### Our Current Sidebar (Basic)
```
- Dashboard
- Brands  
- Projects
- [Credit Widget]
- [User Profile]
```

### Gamma's Sidebar (Rich)
```
- Gammas (Projects)
- Shared with you
- Sites
- AI Images
- Folders (+)
  - Organize by topic
  - Share with team
- Templates
- Themes
- Custom fonts
- Trash
- Settings & members
- Contact support
- Share feedback
```

### Beautiful.ai's Sidebar (Minimal but Polished)
```
- Home
- Recent
- Favorites
- Folders
- Templates
- Settings
```

---

## Enhancement Plan

### Phase 1: Core Navigation (Week 1, Day 2)
**Goal:** Match Beautiful.ai's minimal but complete navigation

**Add to Sidebar:**
1. ✅ **Dashboard** (already exists)
2. ✅ **Brands** (already exists)
3. ✅ **Projects** (already exists)
4. ⭐ **Recent Projects** (quick access)
5. ⭐ **Favorites** (starred projects)
6. ⭐ **Folders** (organize projects)

**Implementation:**
- Add "Recent" icon (Clock) with count badge
- Add "Favorites" icon (Star) with count badge
- Add "Folders" section with collapsible tree
- Use shadcn/ui Collapsible component
- Add "+ New Folder" button

---

### Phase 2: Resources Section (Week 1, Day 3)
**Goal:** Add value-add sections like Gamma

**Add to Sidebar:**
1. ⭐ **Templates** (presentation templates)
2. ⭐ **Themes** (color/font presets)
3. ⭐ **Usage History** (credit transactions)

**Implementation:**
- Add "Resources" separator
- Templates icon (LayoutTemplate)
- Themes icon (Palette)
- Usage History icon (History)
- Each opens dedicated page

---

### Phase 3: Settings & Support (Week 1, Day 4)
**Goal:** Complete the sidebar with utility sections

**Add to Sidebar:**
1. ⭐ **Settings** (account, billing, team)
2. ⭐ **Help & Support** (docs, contact)
3. ⭐ **Trash** (deleted projects)

**Implementation:**
- Add "Settings" at bottom (Settings icon)
- Add "Help" dropdown (HelpCircle icon)
  - Documentation
  - Video tutorials
  - Contact support
  - Share feedback
- Add "Trash" (Trash2 icon) with count badge

---

### Phase 4: Visual Polish (Week 1, Day 5)
**Goal:** Make sidebar feel premium

**Enhancements:**
1. ⭐ **Hover states** - Smooth transitions
2. ⭐ **Active indicators** - Clear visual feedback
3. ⭐ **Count badges** - Show item counts
4. ⭐ **Collapsible sections** - Folders, Resources
5. ⭐ **Keyboard shortcuts** - Quick navigation
6. ⭐ **Search** - Jump to any section (Cmd+K)

**Implementation:**
- Add hover effects (background color change)
- Add active state (border-left accent)
- Add count badges (small circles)
- Add collapse/expand animations
- Add keyboard shortcut hints
- Add global search with Command Palette

---

## Detailed Component Structure

### Enhanced Sidebar Layout
```tsx
<Sidebar>
  {/* Header */}
  <SidebarHeader>
    <Logo />
    <WorkspaceSwitcher />
  </SidebarHeader>

  {/* Main Navigation */}
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItem href="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </SidebarMenuItem>
        <SidebarMenuItem href="/brands" icon={Palette}>
          Brands
        </SidebarMenuItem>
        <SidebarMenuItem href="/projects" icon={FileText}>
          Projects
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>

    {/* Quick Access */}
    <SidebarGroup>
      <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItem href="/recent" icon={Clock} badge={5}>
          Recent
        </SidebarMenuItem>
        <SidebarMenuItem href="/favorites" icon={Star} badge={3}>
          Favorites
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>

    {/* Folders */}
    <SidebarGroup collapsible>
      <SidebarGroupLabel>
        Folders
        <Button size="icon" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <FolderTree folders={folders} />
      </SidebarGroupContent>
    </SidebarGroup>

    {/* Resources */}
    <SidebarGroup>
      <SidebarGroupLabel>Resources</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItem href="/templates" icon={LayoutTemplate}>
          Templates
        </SidebarMenuItem>
        <SidebarMenuItem href="/themes" icon={Palette}>
          Themes
        </SidebarMenuItem>
        <SidebarMenuItem href="/usage" icon={History}>
          Usage History
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>

  {/* Footer */}
  <SidebarFooter>
    <CreditWidget />
    <SidebarMenuItem href="/settings" icon={Settings}>
      Settings
    </SidebarMenuItem>
    <SidebarMenuItem href="/help" icon={HelpCircle}>
      Help
    </SidebarMenuItem>
    <SidebarMenuItem href="/trash" icon={Trash2} badge={2}>
      Trash
    </SidebarMenuItem>
    <UserProfile />
  </SidebarFooter>
</Sidebar>
```

---

## Visual Design Specifications

### Colors
- **Background:** `bg-sidebar` (from shadcn/ui)
- **Hover:** `hover:bg-sidebar-accent`
- **Active:** `bg-sidebar-accent` + `border-l-2 border-primary`
- **Text:** `text-sidebar-foreground`
- **Muted:** `text-sidebar-foreground/70`

### Typography
- **Labels:** `text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70`
- **Items:** `text-sm font-medium`
- **Badges:** `text-xs font-semibold`

### Spacing
- **Item padding:** `px-3 py-2`
- **Group spacing:** `space-y-1`
- **Section spacing:** `space-y-4`

### Icons
- **Size:** `h-4 w-4`
- **Color:** `text-sidebar-foreground/70`
- **Active:** `text-primary`

### Badges
- **Size:** `h-5 min-w-5 px-1.5`
- **Background:** `bg-primary/10`
- **Text:** `text-primary text-xs font-semibold`
- **Position:** `ml-auto`

---

## Database Schema Changes

### Add Folders Table
```sql
CREATE TABLE folders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  parentId INT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (parentId) REFERENCES folders(id)
);
```

### Add Folder Association to Projects
```sql
ALTER TABLE presentations
ADD COLUMN folderId INT NULL,
ADD FOREIGN KEY (folderId) REFERENCES folders(id);
```

### Add Trash/Deleted Flag
```sql
ALTER TABLE presentations
ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE,
ADD COLUMN deletedAt TIMESTAMP NULL;
```

---

## Implementation Checklist

### Week 1, Day 2: Core Navigation
- [ ] Add "Recent" menu item with Clock icon
- [ ] Add "Favorites" menu item with Star icon
- [ ] Add count badges to Recent and Favorites
- [ ] Create `/recent` page showing last 10 viewed projects
- [ ] Update `/favorites` page (already exists, just add to sidebar)
- [ ] Add keyboard shortcuts (Cmd+1 Dashboard, Cmd+2 Brands, etc.)

### Week 1, Day 3: Folders & Resources
- [ ] Create folders table in database
- [ ] Add folderId to presentations table
- [ ] Create Folders section in sidebar (collapsible)
- [ ] Create "+ New Folder" button
- [ ] Create FolderTree component
- [ ] Add drag-and-drop to move projects between folders
- [ ] Create `/templates` page
- [ ] Create `/themes` page
- [ ] Create `/usage` page (credit history)

### Week 1, Day 4: Settings & Support
- [ ] Create `/settings` page with tabs (Account, Billing, Team)
- [ ] Add "Settings" to sidebar footer
- [ ] Create Help dropdown menu
- [ ] Add "Documentation" link
- [ ] Add "Contact Support" link
- [ ] Add "Share Feedback" link
- [ ] Create `/trash` page showing deleted projects
- [ ] Add "Trash" to sidebar footer with count badge
- [ ] Implement soft delete (isDeleted flag)
- [ ] Add "Restore" and "Permanently Delete" actions

### Week 1, Day 5: Visual Polish
- [ ] Add smooth hover transitions (200ms)
- [ ] Add active state indicator (border-left accent)
- [ ] Add count badges to all relevant items
- [ ] Add collapse/expand animations to Folders
- [ ] Implement keyboard shortcuts (Cmd+K for search)
- [ ] Create Command Palette component
- [ ] Add search functionality to Command Palette
- [ ] Test all interactions
- [ ] Optimize performance (lazy loading, memoization)

---

## Success Metrics

### Before Enhancement
- **Sidebar items:** 3 (Dashboard, Brands, Projects)
- **Navigation depth:** 1 level
- **Quick access:** None
- **Organization:** None

### After Enhancement
- **Sidebar items:** 10+ (Dashboard, Brands, Projects, Recent, Favorites, Folders, Templates, Themes, Usage, Settings, Help, Trash)
- **Navigation depth:** 2-3 levels (Folders, Help dropdown)
- **Quick access:** Recent, Favorites
- **Organization:** Folders, Trash

### Competitor Comparison
- **Gamma:** 12 items, 2-3 levels ✅ Match
- **Beautiful.ai:** 6 items, 1-2 levels ✅ Exceed

---

## Notes

- **Priority:** High (affects perceived quality)
- **Complexity:** Medium (mostly UI work, some database changes)
- **Timeline:** Week 1, Days 2-5 (4 days)
- **Dependencies:** None (can start immediately after Day 1)
- **Risk:** Low (incremental changes, no breaking changes)

---

**Next Steps:**
1. Review this plan with stakeholders
2. Begin implementation on Week 1, Day 2
3. Test each phase thoroughly before moving to next
4. Collect user feedback after Week 1


