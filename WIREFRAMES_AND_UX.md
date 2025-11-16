# SlideCoffee Complete Rebuild - Wireframes & UX Design

## 📸 Analysis of Gamma Screenshots

### Key UX Patterns Identified:

#### 1. **Entry Point - "Create with AI"** (Screenshot 1)
**Layout:**
- Clean, centered layout with soft gradient background (pink/peach tones)
- Large heading: "Create with AI"
- Subheading: "How would you like to get started?"
- Three card options displayed horizontally

**Three Creation Modes:**

**Card 1: "Paste in text"**
- Icon: Pink clipboard/document illustration
- Description: "Create from notes, an outline, or existing content"
- Arrow button to proceed

**Card 2: "Generate" (POPULAR - marked with mint green badge)**
- Icon: Purple starburst with sparkle illustration
- Description: "Create from a one-line prompt in a few seconds"
- Arrow button to proceed
- **This is the PRIMARY flow we should focus on**

**Card 3: "Import file or URL"**
- Icon: Purple document with sparkles
- Description: "Enhance existing docs, presentations, or webpages"
- Arrow button to proceed

**Design Notes:**
- Soft, playful illustrations (not corporate)
- Rounded corners on cards
- Subtle shadows
- Mint green accent for "Popular" badge
- Clean typography hierarchy

---

#### 2. **Dashboard/Library View** (Screenshot 2, 6)
**Layout:**
- Left sidebar with navigation
- Main content area showing project cards in grid
- Categories: "Projects & Collaboration", "Sales & Marketing", etc.
- Each project card shows thumbnail preview

**Key Elements:**
- Search/filter at top
- Project cards with visual previews
- Organized by categories/folders
- Clean white background

---

#### 3. **Generation Modal** (Screenshot 5)
**"New with AI" Modal:**
- Centered modal overlay
- Two options presented:

**Option 1: "Guided"**
- Description: "Answer a few questions and we'll generate an outline and first draft"

**Option 2: "Text to Deck"**
- Description: "Paste your content or a whole document to start"

**Design:**
- Simple two-column choice
- Icons for each option
- Clean, minimal design

---

#### 4. **Generate Interface** (Screenshot 7)
**Layout:**
- Clean, centered form
- "Generate" heading
- Input prompt: "What would you like to create today?"
- Additional options below (cards for different starting points)
- Soft gradient background

---

## 🎨 SlideCoffee Rebuild Design

### Color Scheme (Based on Current Branding)
**Primary Colors:**
- Background: Soft pink/peach gradient (#FFE5E5 to #FFF0F0)
- Primary Purple: #7C3AED (for buttons, accents)
- Mint Green: #6EE7B7 (for "Popular" badges, success states)
- Text Dark: #1F2937
- Text Light: #6B7280

**Card Colors:**
- Pink card: #FFE4E6 background
- Purple card: #DDD6FE background  
- Lavender card: #E9D5FF background

---

## 📱 Complete User Flow

### Flow 1: Landing → Generate (Primary Flow)

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE                          │
│                                                          │
│  Logo (top left)              Login/Sign Up (top right) │
│                                                          │
│              Create with AI                              │
│        How would you like to get started?               │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ Paste text │  │ Generate ✨ │  │ Import URL │       │
│  │            │  │  POPULAR    │  │            │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         ↓ (Click "Generate")
┌─────────────────────────────────────────────────────────┐
│                  GENERATION INTERFACE                    │
│                                                          │
│  ← Back                                                  │
│                                                          │
│                     Generate                             │
│          What would you like to create today?           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Type your prompt here...                        │   │
│  │ e.g., "AI in healthcare presentation"           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│                    [Generate →]                          │
│                                                          │
│  OR choose a template:                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Pitch│ │Report│ │ Edu  │ │ Mktg │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                         ↓ (Click "Generate")
┌─────────────────────────────────────────────────────────┐
│              SPLIT-SCREEN EDITOR                         │
│                                                          │
│  ┌──────────────┬──────────────────────────────────┐   │
│  │              │                                   │   │
│  │  CHAT (30%)  │    LIVE PREVIEW (70%)                │   │
│  │              │                                   │   │
│  │  ☕ AI:      │    ┌─────────────────┐           │   │
│  │  "Creating   │    │  Slide 1        │           │   │
│  │  your        │    │  [Preview]      │           │   │
│  │  slides..."  │    └─────────────────┘           │   │
│  │              │                                   │   │
│  │  Progress:   │    Thumbnails:                   │   │
│  │  [████░░] 60%│    [1][2][3][4][5]              │   │
│  │              │                                   │   │
│  │  You: Can    │    Controls:                     │   │
│  │  you add...  │    [← →] [Zoom] [Export]        │   │
│  │              │                                   │   │
│  └──────────────┴──────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Screens to Build

### Screen 1: Landing Page
**Purpose:** Entry point for new users  
**Layout:** Centered, three-card selection  
**CTA:** "Generate" (primary), "Paste text", "Import URL"  
**Design:** Soft gradient background, playful illustrations, clean typography

### Screen 2: Generate Interface
**Purpose:** Prompt input for AI generation  
**Layout:** Centered form with large text input  
**Elements:**
- Back button (top left)
- "Generate" heading
- Large prompt input field
- Generate button (primary CTA)
- Template suggestions below (optional)

### Screen 3: Split-Screen Editor (PRIMARY FOCUS)
**Purpose:** Real-time slide generation and editing  
**Layout:** 30% chat / 70% preview split  

**Left Panel (Chat):**
- AI messages with coffee personality
- User input at bottom
- Progress indicators
- Milestone celebrations

**Right Panel (Preview):**
- Large slide preview (main area)
- Thumbnail sidebar (left or bottom)
- Zoom controls
- Navigation (prev/next)
- Export button (top right)

### Screen 4: Export/Share
**Purpose:** Download or share completed presentation  
**Options:**
- Download as PPTX
- Download as PDF
- Get shareable link
- Continue editing

---

## 🎨 Design System

### Typography
- **Headings:** Inter/SF Pro Display, Bold, 48px → 32px → 24px
- **Body:** Inter/SF Pro Text, Regular, 16px
- **Small:** Inter, Medium, 14px

### Spacing
- Container max-width: 1200px
- Section padding: 80px vertical
- Card padding: 32px
- Element spacing: 16px, 24px, 32px

### Components

#### Card Component
```
┌─────────────────────────────┐
│                             │
│     [Illustration]          │
│                             │
│     Card Title              │
│     Description text here   │
│                             │
│                    [→]      │
└─────────────────────────────┘
```
- Border radius: 16px
- Shadow: soft, subtle
- Hover: slight lift + shadow increase
- Background: gradient or solid color

#### Button Styles
**Primary:** Purple background, white text, rounded  
**Secondary:** White background, purple border, purple text  
**Ghost:** Transparent, purple text

---

## ✅ Design Approval Checklist

Before coding, confirm:
- [ ] Landing page layout matches Gamma's clean, centered approach
- [ ] Three-card selection with proper hierarchy (Generate as primary)
- [ ] Soft gradient backgrounds (pink/peach tones)
- [ ] Playful, friendly illustrations (not corporate)
- [ ] Split-screen editor with 40/60 split
- [ ] Chat interface with coffee personality
- [ ] Live preview with thumbnails
- [ ] Color scheme approved (purple primary, mint accents, pink backgrounds)
- [ ] Typography hierarchy clear
- [ ] Mobile responsive considerations

---

## 🚀 Next Steps

1. **Get User Approval** on this wireframe document
2. **Create visual mockups** (optional - or proceed to code)
3. **Build frontend** with approved design
4. **Integrate backend** (Netlify Functions)
5. **Deploy to Netlify**


