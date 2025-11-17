# Project Card Design Mockup

**Version:** 2.0 (Enhanced with Thumbnails)  
**Date:** November 3, 2025  
**Status:** Design Proposal

---

## Current Design vs. New Design

### BEFORE (Current SlideCoffee)

```
┌─────────────────────────────────────────────┐
│ Product Strategy - Security                 │
│                                             │
│ Working on a new security product offering  │
│ strategy for our MSP brand                  │
│                                             │
│ XTIUM • 10/27/2025 • draft                 │
│                                             │
│ [⭐ Star icon]                              │
└─────────────────────────────────────────────┘
```

**Issues:**
- ❌ No visual preview
- ❌ Looks like a text document, not a presentation
- ❌ Hard to distinguish between projects at a glance
- ❌ Status is just text, not prominent
- ❌ No brand visual identity

---

### AFTER (New Design - Gamma-inspired)

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │     [THUMBNAIL IMAGE 16:9]              │ │
│ │     First slide preview                 │ │
│ │     or gradient placeholder             │ │
│ │                                         │ │
│ │  [draft]                          [⭐]  │ │
│ │  ▂▂▂▂ (brand color accent bar)         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Product Strategy - Security            [⋮]  │
│ Working on a new security product...        │
│                                             │
│ [👤 Avatar] Created by you                  │
│ Last viewed 2 days ago                      │
└─────────────────────────────────────────────┘
```

**Improvements:**
- ✅ Large thumbnail preview (16:9 aspect ratio)
- ✅ Status badge in top-left corner
- ✅ Favorite star in top-right corner
- ✅ Brand color accent bar at bottom of thumbnail
- ✅ User avatar with "Created by you"
- ✅ "Last viewed X ago" timestamp
- ✅ Three-dot menu for actions
- ✅ Hover state with border highlight

---

## Detailed Component Breakdown

### 1. Thumbnail Area (Top Section)

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ [Status Badge]              [Star Icon] │ │
│ │                                         │ │
│ │                                         │ │
│ │        THUMBNAIL IMAGE                  │ │
│ │        (16:9 ratio)                     │ │
│ │        or                               │ │
│ │        Gradient Placeholder             │ │
│ │        with FileText icon               │ │
│ │                                         │ │
│ │ ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ │ │
│ │ (Brand Color Accent - 4px height)       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Aspect Ratio:** 16:9 (matches presentation format)
- **Height:** ~180px (scales with card width)
- **Background:** Gradient from `brand.primaryColor/10` to `brand.primaryColor/5`
- **Placeholder:** Large FileText icon (48px) centered when no thumbnail
- **Border Radius:** 8px (top corners only)
- **Accent Bar:** 4px solid bar in `brand.primaryColor`

**Status Badge:**
- **Position:** Absolute, top-2 left-2
- **Variants:**
  - `draft` - Gray background
  - `planning` - Blue background
  - `outline_ready` - Purple background
  - `generating` - Orange background with spinner
  - `completed` - Green background
  - `failed` - Red background
- **Style:** Small badge with icon + text

**Star Icon:**
- **Position:** Absolute, top-2 right-2
- **States:**
  - Unfilled: Outline only, gray
  - Filled: Solid yellow (#FBBF24)
- **Hover:** Scale to 110%
- **Click:** Toggle favorite with optimistic update

---

### 2. Content Area (Middle Section)

```
┌─────────────────────────────────────────────┐
│ Product Strategy - Security            [⋮]  │
│ ────────────────────────────────────────    │
│ Working on a new security product offering  │
│ strategy for our MSP brand                  │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Title:** 
  - Font: Bold, 18px
  - Color: Foreground
  - Max lines: 1 (truncate with ellipsis)
- **Description:**
  - Font: Regular, 14px
  - Color: Muted foreground
  - Max lines: 2 (truncate with ellipsis)
- **Three-dot Menu:**
  - Position: Top-right of content area
  - Appears on hover
  - Actions: Edit, Duplicate, Export, Delete

---

### 3. Footer Area (Bottom Section)

```
┌─────────────────────────────────────────────┐
│ ┌───┐                                       │
│ │ J │ Created by you    Last viewed 2d ago  │
│ └───┘                                       │
└─────────────────────────────────────────────┘
```

**Specifications:**
- **Avatar:**
  - Size: 24px × 24px
  - Fallback: User initials
  - Border: 1px solid border color
- **Created By:**
  - Font: Regular, 13px
  - Color: Muted foreground
  - Text: "Created by you" or "Created by [Name]"
- **Last Viewed:**
  - Font: Regular, 13px
  - Color: Muted foreground
  - Format: "Last viewed 2d ago" (use `date-fns` formatDistanceToNow)

---

## Grid View Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Your Projects (4)                                    [Grid] [List]  [Sort]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  [Thumbnail] │  │  [Thumbnail] │  │  [Thumbnail] │  │  [Thumbnail] │   │
│  │              │  │              │  │              │  │              │   │
│  │  Title       │  │  Title       │  │  Title       │  │  Title       │   │
│  │  Desc...     │  │  Desc...     │  │  Desc...     │  │  Desc...     │   │
│  │  👤 2d ago   │  │  👤 5d ago   │  │  👤 1w ago   │  │  👤 2w ago   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐                                        │
│  │  [Thumbnail] │  │  [Thumbnail] │                                        │
│  │              │  │              │                                        │
│  │  Title       │  │  Title       │                                        │
│  │  Desc...     │  │  Desc...     │                                        │
│  │  👤 3w ago   │  │  👤 1mo ago  │                                        │
│  └──────────────┘  └──────────────┘                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Grid Specifications:**
- **Columns:** 
  - Desktop (>1280px): 4 columns
  - Laptop (>1024px): 3 columns
  - Tablet (>768px): 2 columns
  - Mobile (<768px): 1 column
- **Gap:** 24px between cards
- **Card Width:** Fluid (fills column)
- **Card Height:** Auto (based on content)

---

## List View Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Your Projects (4)                                    [Grid] [List]  [Sort]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────┬──────────────────────────────────────────────────────────────────┐  │
│  │[T] │ Product Strategy - Security                    [draft]  [⋮]  [⭐]│  │
│  │[H] │ Working on a new security product offering...                   │  │
│  │[U] │ 👤 Created by you • Last viewed 2 days ago • XTIUM             │  │
│  │[M] │                                                                 │  │
│  └────┴──────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────┬──────────────────────────────────────────────────────────────────┐  │
│  │[T] │ Board Deck Nov                                [completed] [⋮] [⭐]│  │
│  │[H] │ Board Deck.                                                     │  │
│  │[U] │ 👤 Created by you • Last viewed 5 days ago • XTIUM             │  │
│  │[M] │                                                                 │  │
│  └────┴──────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**List Specifications:**
- **Thumbnail:** Small square (80px × 80px) on left
- **Content:** Flows horizontally, fills remaining space
- **Height:** Fixed ~100px per row
- **Hover:** Entire row highlights
- **Metadata:** Inline with bullet separators

---

## View Toggle Component

```
┌─────────────────────────────────────────────┐
│ Your Projects (4)                           │
│                                             │
│ [🔍 Search...]              [⭐] [❓]       │
│                                             │
│ ┌─────────┬──────────┐  ┌────────┐         │
│ │  Grid   │   List   │  │  Sort  │         │
│ │  [✓]    │          │  │   ↕    │         │
│ └─────────┴──────────┘  └────────┘         │
└─────────────────────────────────────────────┘
```

**Toggle Specifications:**
- **Position:** Top-right of Projects page
- **Buttons:**
  - Grid: Grid3x3 icon
  - List: List icon
- **Active State:** Primary background color
- **Inactive State:** Outline variant
- **Storage:** Save preference to localStorage

---

## Status Badge Variants

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  draft   │  │ planning │  │ outline  │  │generating│
│          │  │          │  │  ready   │  │    ⟳     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
   Gray          Blue         Purple        Orange

┌──────────┐  ┌──────────┐
│completed │  │  failed  │
│    ✓     │  │    ✗     │
└──────────┘  └──────────┘
   Green          Red
```

**Badge Specifications:**
- **Size:** Small (px-2 py-1)
- **Font:** 11px, medium weight
- **Border Radius:** 4px
- **Icons:** 
  - `generating`: Spinner icon (animated)
  - `completed`: Check icon
  - `failed`: X icon
- **Colors:** Use shadcn badge variants

---

## Hover & Interaction States

### Card Hover
```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │     [THUMBNAIL - Slightly scaled]       │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Title                                  [⋮]  │ ← Menu appears
│ Description...                              │
│                                             │
│ 👤 Created by you • 2d ago                  │
└─────────────────────────────────────────────┘
   ↑ Border changes to primary/20
```

**Hover Effects:**
- Border: Changes to `border-primary/20`
- Thumbnail: Scale to 102% (subtle zoom)
- Three-dot menu: Fades in
- Cursor: Pointer
- Transition: All 200ms ease

### Star Hover
```
☆  →  ⭐  →  ★
Gray   Hover   Active
```

**Star Effects:**
- Hover: Scale to 110%, color to yellow/50
- Click: Optimistic update, scale animation
- Transition: Transform 150ms ease

---

## Responsive Breakpoints

### Desktop (>1280px)
- 4 columns grid
- Large thumbnails (300px width)
- Full metadata visible

### Laptop (1024px - 1280px)
- 3 columns grid
- Medium thumbnails (250px width)
- Full metadata visible

### Tablet (768px - 1024px)
- 2 columns grid
- Medium thumbnails (250px width)
- Abbreviated metadata

### Mobile (<768px)
- 1 column grid
- Full-width thumbnails
- Stacked metadata
- Larger touch targets

---

## Color Palette (Based on SlideCoffee Brand)

```
Primary:     #3B82F6 (Blue)
Secondary:   #8B5CF6 (Purple)
Success:     #10B981 (Green)
Warning:     #F59E0B (Orange)
Error:       #EF4444 (Red)
Muted:       #6B7280 (Gray)

Gradients:
- Thumbnail BG: from-primary/10 to-primary/5
- Hover: from-primary/5 to-transparent
```

---

## Implementation Checklist

### Phase 1: Basic Structure
- [ ] Update project card component structure
- [ ] Add thumbnail container with 16:9 aspect ratio
- [ ] Add placeholder gradient background
- [ ] Add FileText icon for projects without thumbnails

### Phase 2: Status & Favorites
- [ ] Create status badge component with variants
- [ ] Add star icon with toggle functionality
- [ ] Implement optimistic updates for favorites
- [ ] Add brand color accent bar

### Phase 3: Metadata
- [ ] Add user avatar component
- [ ] Add "Created by you" text
- [ ] Add "Last viewed X ago" with date-fns
- [ ] Add three-dot menu with actions

### Phase 4: View Toggle
- [ ] Create grid/list toggle component
- [ ] Implement grid layout (default)
- [ ] Implement list layout (compact)
- [ ] Save view preference to localStorage

### Phase 5: Interactions
- [ ] Add hover effects (border, scale, menu)
- [ ] Add click handlers (card, star, menu)
- [ ] Add keyboard navigation
- [ ] Add loading skeletons

### Phase 6: Thumbnails (Future)
- [ ] Generate thumbnail from first slide
- [ ] Store thumbnail URL in database
- [ ] Implement lazy loading
- [ ] Add fallback handling

---

## Code Example

```tsx
<Card 
  className="group hover:border-primary/20 transition-all cursor-pointer"
  onClick={() => navigate(`/project/${project.id}`)}
>
  {/* Thumbnail */}
  <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden rounded-t-lg">
    {project.thumbnailUrl ? (
      <img 
        src={project.thumbnailUrl} 
        alt={project.title}
        className="object-cover w-full h-full group-hover:scale-102 transition-transform"
      />
    ) : (
      <div className="flex items-center justify-center h-full">
        <FileText className="w-12 h-12 text-muted-foreground" />
      </div>
    )}
    
    {/* Status Badge */}
    <div className="absolute top-2 left-2">
      <Badge variant={getStatusVariant(project.status)}>
        {project.status === 'generating' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        {project.status}
      </Badge>
    </div>
    
    {/* Favorite Star */}
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 hover:scale-110 transition-transform"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite.mutate({ id: project.id, isFavorite: !project.isFavorite });
      }}
    >
      <Star 
        className={`w-4 h-4 ${project.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
      />
    </Button>
    
    {/* Brand Color Accent */}
    {brand && (
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: brand.primaryColor }}
      />
    )}
  </div>
  
  {/* Content */}
  <CardHeader>
    <div className="flex items-start justify-between">
      <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Export</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
  </CardHeader>
  
  {/* Footer */}
  <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
    <div className="flex items-center gap-2">
      <Avatar className="w-6 h-6">
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <span>Created by you</span>
    </div>
    <span>{formatDistanceToNow(project.lastViewedAt, { addSuffix: true })}</span>
  </CardFooter>
</Card>
```

---

## Next Steps

1. Review and approve this mockup
2. Implement basic card structure
3. Add status badges and favorites
4. Implement grid/list toggle
5. Add thumbnail generation (future phase)
6. Test on all devices
7. Gather user feedback

---

**End of Mockup Document**

