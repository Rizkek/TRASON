# TRASON Design System & UI Concept
## Personal Self-Improvement PWA - Design Documentation

---

## 🎨 Design Philosophy

**Core Principle:** "Digital Living Space, Not Dashboard"

TRASON adalah ruang personal digital tempat user mengeksplorasi diri mereka sendiri. UI harus terasa:
- **Personal** — seperti journal digital, bukan tool
- **Warm** — warna-warna yang menenangkan, bukan cold tech
- **Intimate** — conversation over data visualization
- **Human** — natural language, micro-animations, breathing room

---

## 📐 Design System

### Color Palette

```
Primary Palette:
──────────────────
Warm Black (Background):    #0F0F0F
Soft Cream (Text):          #F5F3F0  
Deep Sage (Accent 1):       #546B5D    (calm, introspective)
Warm Gold (Accent 2):       #D4A574    (warmth, personal touch)
Pale Blush (Accent 3):      #E8D7D3    (soft, feminine undertone)

Secondary Palette:
──────────────────
Income (Growth):            #8BA887    (muted green, peaceful)
Expense (Release):          #B8956A    (warm brown, grounded)
Insight (Discovery):        #9B8B7E    (taupe, contemplative)
Energy/Activity:            #D9B99F    (peachy, approachable)

Neutral Grays (for hierarchy):
──────────────────
- Strong:  #2A2A2A
- Medium:  #4A4A4A
- Light:   #8A8A8A
- Very Light: #D0D0D0
```

**Color Usage Philosophy:**
- Warna-warna soft, muted, natural tones (terinspirasi minimalis interior scandinavian)
- Hindari neon, bright gradients
- Gunakan warna untuk meaning, bukan decoration
- Sage green = calm introspection (reminder, insight)
- Warm gold = personal achievement (income, completed tasks)
- Blush = gentle warmth (timeline, memories)

---

### Typography

```
Serif Font (Display, Headings):
  Font: "Crimson Text" atau "Cormorant Garamond"
  Usage: Page titles, section headers, quotes/insights
  Weight: Regular 400 untuk elegance, Bold 700 untuk emphasis
  Characteristic: Elegant, literary, personal journal feel

Sans-Serif Font (Body, UI):
  Font: "Inter" atau "Outfit"
  Usage: Body text, labels, input, micro-copy
  Weight: Regular 400 body, Medium 500 accent, Semibold 600 interactive
  Characteristic: Clean, readable, contemporary
```

**Typography Scale:**
```
Display (40px):     Crimson Text, semibold, page titles
Heading 1 (32px):   Crimson Text, regular, section headers
Heading 2 (24px):   Crimson Text, regular, subsections
Heading 3 (20px):   Inter, semibold, card titles
Body (16px):        Inter, regular, main content
Caption (14px):     Inter, regular, secondary info
Micro (12px):       Inter, medium, labels, tags
```

---

### Spacing & Layout Grid

```
Base Unit: 8px (8px grid system)

Spacing Scale:
- xs:  4px  (small elements)
- sm:  8px  (compact spacing)
- md:  16px (standard spacing)
- lg:  24px (section spacing)
- xl:  32px (major sections)
- 2xl: 48px (page padding)

Layout Philosophy:
- Container width: 1024px max (desktop)
- Generous margins: 48px+ on sides
- Card margins: 24px between major sections
- Breathing room > compactness
```

---

### Iconography

```
Style: Minimalist line icons
Weight: 2px stroke
Approach: Simple, hand-drawn feeling (tidak perfect geometric)
Size: 24px primary, 20px secondary, 16px micro

Icons/Elements Custom:
- Wallet icon for finance (minimalist purse shape)
- Hourglass for timeline (time passing feeling)
- Brain/bulb for insights (soft rounded)
- Cloud/waves for daily reflection
```

---

## 📄 Layout Architecture

### Global Layout Structure

```
┌─────────────────────────────────────┐
│        HEADER (Minimal)              │
│  Logo | Date/Time | User Menu        │
├──────────────────────────────────────┤
│ └─ SIDEBAR (Retractable, 64px when) │
│ │                                    │
│ MAIN CONTENT AREA                    │
│ (Maximum 1024px, centered)           │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│        FOOTER (Optional)              │
└──────────────────────────────────────┘
```

**Sidebar Design:**
- Collapsed state: Icon-only, 64px width
- Expanded state: Full nav labels, 280px width
- Smooth animation on toggle (300ms cubic-bezier)
- Icons + labels stacked
- No hover effects on items, instead use indicator bar on left

---

## 🏠 Page Designs

### 1. HOME PAGE - "Today View"

**Concept:** Personal reflection dashboard yang terasa seperti buka surat pagi

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ "Good Morning, [Name]"              │
│ Monday, April 7, 2026               │
├─────────────────────────────────────┤
│                                     │
│ ╔═══════════════════════════╗      │
│ ║  Daily Summary Card       ║      │
│ ║                           ║      │
│ ║  "You've tracked 12        ║      │
│ ║   activities today and     ║      │
│ ║   spent $245 on essentials ║      │
│ ║   (+$150 income)"          ║      │
│ ╚═══════════════════════════╝      │
│                                     │
│ ┌─────────────────────────────────┐│
│ │  📊 Financial Summary            ││
│ │  Income:  $150                   ││
│ │  Expense: $245                   ││
│ │  Balance: -$95 (for today)       ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │  🔄 Quick Input                  ││
│ │  "What are you doing?"           ││
│ │  [Input field - chat-like]       ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │  💡 Today's Insight             ││
│ │                                  ││
│ │  "You're most active between     ││
│ │   2-4 PM. Your top category is   ││
│ │   'Work' with 6 hours logged."   ││
│ │                                  ││
│ │  [Learn More] [Dismiss]          ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │  📍 Upcoming Reminders           ││
│ │                                  ││
│ │  3:00 PM - Team Meeting          ││
│ │  6:00 PM - Exercise              ││
│ │  8:00 PM - Journal reflection    ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**

*Hero Section:*
- Typography: "Good Morning, [Name]" dalam Crimson Text 40px, color: Warm Gold
- Subtext: Date & weather-like info dalam Inter 14px, color: Light Gray
- Background: Soft gradient dari Warm Black ke slightly lighter (0F0F0F → 1A1A1A)
- Padding: 48px top, 24px bottom

*Summary Card:*
- Background: Deep Sage (#546B5D), rgba opacity 0.15 (very subtle)
- Border: 1px solid Pale Blush rgba 0.3
- Text terasa seperti bercerita (narrative tone)
- Rounded corners: 12px
- Padding: 32px
- Line height: 1.8 (generous spacing antar baris)
- Font: Inter 18px, color: Soft Cream

*Financial Summary:*
- Layout: 3 columns (Income | Expense | Net)
- Income color: Muted Green background
- Expense color: Warm Brown background
- Card dengan light background (20% opacity)
- Typography: Number dominant (24px bold), label di bawah (12px caps)

*Quick Input Section:*
- Desain seperti chat bubble, bukan form tradisional
- Focus state: Border berubah ke Warm Gold, subtle shadow
- Placeholder text: "What are you doing right now?"
- Send button: Minimal, just "Return" key indicator atau small icon
- No form labels, just conversational

*Insight Card:*
- Background: gradient subtle dari Insight color (taupe) ke transparent
- Text styled sebagai quote/narrative, bukan data dump
- Call-to-action buttons: "Learn More" (text link) dan "Dismiss" (ghost button)
- Icon: Simple brain/bulb illustration

*Reminders Section:*
- Vertical list, each item is a thin row
- Time di sebelah kiri (bold, Warm Gold jika upcoming < 1 hour)
- Text di kanan (title & optional category tag)
- Divider: 1px light border between items
- Hover state: Subtle background color change

---

### 2. TIMELINE PAGE - "Your Day"

**Concept:** Vertical timeline as visual storytelling dari hari user

**Layout Structure:**
```
┌──────────────────────────────────────┐
│ Timeline - Monday, April 7            │
├──────────────────────────────────────┤
│                                      │
│  6:00 AM                             │
│  ●─────────────────────────────────  │
│  │ Wake up & Morning Routine         │
│  │ Duration: 45min                   │
│  │ Mood: Energized                   │
│  │ Tags: Self-care, Health           │
│  └────────────────────────────────── │
│                                      │
│  6:45 AM                             │
│  ●─────────────────────────────────  │
│  │ Breakfast                         │
│  │ Duration: 15min                   │
│  │ Spent: $5                         │
│  │ Tags: Nutrition                   │
│  └────────────────────────────────── │
│                                      │
│  [Loading more entries...]           │
│                                      │
└──────────────────────────────────────┘
```

**Design Details:**

*Timeline Row Structure:*
- Time di kiri: 12px Inter, Medium, color: Light Gray
- Vertical dot: 12px diameter, color: Warm Gold
- Connector line: 2px solid, color: Deep Sage rgba 0.3
- Card/entry content di kanan: 80% width

*Activity Card:*
- Background: Very subtle color berdasarkan category (20% opacity)
- Padding: 12px 16px
- Border radius: 8px
- Title: Inter 16px semibold, color: Soft Cream
- Meta info: 3 baris
  - Duration: "45 min"
  - Optional spend: "$5"
  - Mood/Tags: "Energized, Self-care"
- Text size: 13px, color: Light Gray
- Line height: 1.6

*Interactive States:*
- Hover: Border muncul (1px Pale Blush)
- Click: Expand untuk detail lebih lengkap
- Edit mode: Inline editing untuk title & notes

*Visual Variety:*
- Warna dot berubah berdasarkan kategori (tapi subtle)
- Income entries: Warm Gold dot
- Expense entries: Warm Brown dot
- Activities: Peachy dot
- Reminders: Sage dot

*Date Navigation:*
- Arrow buttons subtle di header
- Tab untuk quick jump ke dates (Today, Yesterday, Last Week)
- Atau calendar picker (minimal, hidden by default)

---

### 3. FINANCE PAGE - "Money"

**Concept:** Personal financial narrative, bukan accounting spreadsheet

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Finance - April 2026                │
├─────────────────────────────────────┤
│                                     │
│ ╔═══╦═══════╦═══════╗              │
│ ║Σ  ║ $2,450║-$1,200║  Monthly     │  (Summary row)
│ ║   ║Income ║Expense ║              │
│ ╚═══╩═══════╩═══════╝              │
│                                     │
│ [Recent Transactions]               │
│                                     │
│ April 6 - Sunday                    │
│ ─────────────────────────           │
│ Grocery Shopping      - $45         │
│ Freelance Project    + $200         │
│                                     │
│ April 5 - Saturday                  │
│ ─────────────────────────           │
│ Dinner                 - $32        │
│ Electricity Bill      - $80         │
│                                     │
│ [Add Transaction +]                 │
│ [View All]                          │
│                                     │
│ ╔═══════════════════════════════╗  │
│ ║ 💡 Financial Insight          ║  │
│ ║                               ║  │
│ ║ Your average daily spend is   ║  │
│ ║ $40. This month you're 15%    ║  │
│ ║ above your target budget.     ║  │
│ ║                               ║  │
│ ║ [See Breakdown]               ║  │
│ ╚═══════════════════════════════╝  │
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**

*Summary Stats:*
- 3 boxes: Total | Income | Expense
- Background: Gradient subtle (Income = muted green, Expense = warm brown)
- Layout: Grid 3 columns
- Number display: Crimson Text 32px bold, color: Soft Cream
- Label: Inter 12px, caps, color: Light Gray
- Total box: Neutral gray background

*Transaction List:*
- Group by date (date header: 16px bold Crimson Text)
- Each transaction: 1px bottom border only (no full card)
- Layout: 2 columns (title left, amount right)
- Title: 16px Inter, color varies by type (income = green, expense = neutral)
- Amount: 16px bold Inter, color: entsprechend
- Category tag: Optional, 11px, subtle background
- Hover: Background color changes (very subtle)

*Add Transaction Button:*
- Floating atau sticky di bawah
- Design: Primary button dengan Warm Gold background
- Text: "+ Add Transaction" dalam Inter 14px semibold
- Rounded: 8px bordar
- Shadow: Subtle drop shadow (blur 8px, opacity 0.15)

*Insight Card:*
- Design sama seperti di Home page
- Narrative text: "Your average daily spend..."
- Call-to-action: "[See Breakdown]" text link

*Category Tags:*
- Small rounded pills: 14px height
- Background: Category color (20% opacity)
- Text: Category name, 11px Inter medium
- Optional filter buttons di atas untuk mengelompokkan

---

### 4. REMINDERS PAGE - "Mindful"

**Concept:** Gentle reminder system sebagai personal assistant

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Reminders                           │
├─────────────────────────────────────┤
│                                     │
│ [All] [Pending] [Completed]         │ (Tabs)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📌 Team Meeting                 │ │
│ │ Today at 3:00 PM                │ │
│ │ 📍 Conference Room              │ │
│ │ [In 2 hours]                    │ │
│ │                                 │ │
│ │ [Mark Done]  [Snooze]  [...]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💪 Exercise                     │ │
│ │ Today at 6:00 PM (Recurring)    │ │
│ │ 🔄 Every Tuesday & Friday       │ │
│ │                                 │ │
│ │ [Mark Done]  [Snooze]  [...]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Past Due:                           │
│ ─────────────────────────           │
│ Call Mom                            │
│ [2 days overdue]                    │
│ [Mark Done]                         │
│                                     │
│ [+ New Reminder]                    │
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**

*Reminder Card:*
- Background: Subtle sage green (20% opacity)
- Border: Left border 4px Sage Green (accent)
- Padding: 20px
- Rounded: 12px
- Title: 18px Crimson Text, semibold
- Metadata: 3 lines
  - Time: 14px Inter, color: Light Gray
  - Location: 13px Inter, icon + text
  - Relative time: 12px Inter, caps, color: Warm Gold jika upcoming
- Action buttons: Row di bawah
  - Primary: "Mark Done" (Warm Gold text link)
  - Secondary: "Snooze" (Light text)
  - Tertiary: "..." menu (ellipsis)

*Recurring Indicator:*
- Chip/badge: "🔄 Every Tue & Fri"
- Small background pulse animation (subtle)
- Color: Sage Green

*Overdue Cards:*
- Background: Warm Brown (20% opacity)
- Text color: Slightly warmer tone
- "Overdue" label: Red accent (minimal usage)

*Tab Navigation:*
- Underline style, tidak pills
- All | Pending | Completed
- Active: Underline Warm Gold 3px
- Text: Inter 14px medium

*Create Reminder Modal:*
- Floating button: "+" centered, Warm Gold background
- Modal: 90vh height, dari bottom slide up
- Close button: X top right, atau swipe down to close
- Form fields:
  - Title input: Full width, placeholder "What do you want to remember?"
  - Date/Time picker: Calendar + time picker (minimalist design)
  - Recurring: Toggle + select pattern
  - Location: Optional input
  - Description: Optional textarea
  - Submit: "Create Reminder" button

---

### 5. INSIGHTS PAGE - "Reflection"

**Concept:** AI-powered narrative insights, storytelling over dashboards

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Insights                            │
├─────────────────────────────────────┤
│                                     │
│ Weekly Summary                      │
│ ═════════════════════════════════   │
│                                     │
│ ╔═══════════════════════════════╗  │
│ ║ "This week was productive.    ║  │
│ ║  You logged 42 hours of work, ║  │
│ ║  15 hours of self-care, and   ║  │
│ ║  spent $320 on essentials.    ║  │
│ ║                               ║  │
│ ║  Your energy peaked on        ║  │
│ ║  Wednesday at 2 PM. Consider  ║  │
│ ║  scheduling important tasks   ║  │
│ ║  at this time."               ║  │
│ ║                               ║  │
│ ║ [Read Full Analysis]           ║  │
│ ╚═══════════════════════════════╝  │
│                                     │
│ Patterns Discovered                 │
│ ───────────────────────────────     │
│ ✓ Most productive: 2-4 PM          │
│ ✓ Highest stress: Tuesday          │
│ ✓ Favorite category: Reading       │
│ ✓ Budget concerns: Food expenses   │
│                                     │
│ Recommendations                     │
│ ───────────────────────────────     │
│ 💡 "Block your 2-4 PM for deep    │
│    work. Your data shows this is   │
│    your peak productivity window." │
│                                     │
│ 💡 "Consider setting a food       │
│    budget limit of $280/month to   │
│    stay on track."                 │
│                                     │
│ [See Monthly Report]                │
│ [See Annual Report]                 │
│                                     │
└─────────────────────────────────────┘
```

**Design Details:**

*Time Period Selector:*
- Tabs: Week | Month | Year, di header
- Underline style navigation
- Smooth transition antar periods

*Insight Narrative Box:*
- Background: Gradient subtle (Insight color taupe)
- Border: 1px Pale Blush
- Padding: 40px (generous)
- Text: Crimson Text 18px, line height 1.8
- Quote-like styling
- Call-to-action button: "[Read Full Analysis]" text link

*Patterns Section:*
- Checkmark icon, Warm Gold color
- 4-6 bullet points
- Format: "Pattern: Description"
- Layout: 2 columns jika banyak

*Recommendations:*
- Numbered atau icon-based (💡 lightbulb)
- Card-like appearance
- Action-oriented language
- Related links: "[Learn more about this]"

*Visual Charts (Minimal):**
- Jika ada chart, gunakan simple line chart atau area chart
- Color: Warm Gold untuk positive trend, Warm Brown untuk neutral/declining
- No clutter, just essential data
- Label: Minimal, hanya key points

---

## 🎬 Micro-interactions & Animations

### 1. Page Transitions
```
Entrance: Fade in + slight scale up (300ms, ease-out-quad)
Exit: Fade out (200ms, ease-in-quad)
```

### 2. Button States
```
Hover: 
  - Background: Slight brightening (10% increase)
  - Scale: 1.02x
  - Transition: 200ms ease-out

Active/Pressed:
  - Scale: 0.98x
  - Duration: 100ms

Disabled:
  - Opacity: 0.5
  - Cursor: not-allowed
```

### 3. Input Focus
```
Normal State:
  - Border: 1px Light Gray
  - Background: Warm Black

Focus State:
  - Border: 2px Warm Gold
  - Glow: Warm Gold shadow (blur 8px, opacity 0.3)
  - Transition: 200ms ease-out

Filled State:
  - Border: 1px Deep Sage
```

### 4. Card Hover
```
Hover:
  - Border: 1px Pale Blush
  - Shadow: 0 8px 32px rgba(212, 165, 116, 0.1)
  - Scale: 1.01x transform
  - Transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

### 5. Loading States
```
Skeleton: 
  - Shimmer animation (left to right, 2s infinite)
  - Background: 20% lighter shade
  - Rounded corners match content

Spinner:
  - Rotating cubic (not circle) untuk modern feel
  - Color: Warm Gold
  - Animation: 1.2s rotation (ease-in-out)
```

### 6. Timeline Connector
```
On Scroll Enter (intersection observer):
  - Line gradient animates dari top (300ms ease-out)
  - Dot scales in (400ms ease-out cubic)
  - Card fades + slides (500ms ease-out)
```

### 7. Quick Input Feedback
```
On Submit:
  - Input focus blur (gentle)
  - Success checkmark appears (200ms scale-in)
  - Message slides in dari bottom (300ms)
  - Auto-dismiss after 3s

Error State:
  - Input shake (200ms)
  - Border blink to red (100ms)
  - Error message appears di bawah
```

### 8. Modal/Dialog
```
Backdrop:
  - Fade in dari transparent (200ms)
  - Blur effect apply ke background (300ms)

Modal:
  - Scale from 0.95 to 1.0 (300ms, ease-out cubic)
  - Fade in simultaneously

Close:
  - Reverse animation (200ms)
```

---

## 🎨 Component Specifications

### Buttons

```
Primary Button:
  Background: Warm Gold (#D4A574)
  Text: Warm Black, Inter 14px semibold
  Padding: 12px 24px
  Border radius: 8px
  Height: 44px (clickable area)
  Hover: Background +10% brightness
  
Secondary Button (Ghost):
  Background: Transparent
  Border: 1px Light Gray
  Text: Soft Cream, Inter 14px medium
  Hover: Border Warm Gold, text color warm gold

Text Link:
  Color: Warm Gold
  Text-decoration: none
  Border-bottom: 1px dashed
  Hover: Solid underline, color +10% brightness
  
Destructive:
  Background: Warm Brown (#B8956A)
  Text: Soft Cream
  Usage: Delete, remove, danger actions
```

### Cards

```
Standard Card:
  Background: rgba(84, 107, 93, 0.08)  // Deep Sage
  Border: 1px solid rgba(232, 215, 211, 0.2)  // Pale Blush
  Border-radius: 12px
  Padding: 24px
  Box-shadow: none (flat design)
  Hover: Border color rgba(232, 215, 211, 0.4), shadow 0 8px 32px rgba(0, 0, 0, 0.1)
  
Elevated Card (Alert/Important):
  Border: 1px solid Pale Blush
  Border-left: 4px solid accent color
  Background: 15% opacity of accent color
```

### Input Fields

```
Text Input:
  Background: #1A1A1A
  Border: 1px Light Gray
  Border-radius: 8px
  Padding: 12px 16px
  Font: Inter 16px
  Color: Soft Cream
  Focus: Border Warm Gold 2px, shadow subtle
  Placeholder: #999 (Light Gray), 0.7 opacity
  
Date Picker:
  Calendar: Minimal design
  Current month: Crimson Text header
  Days: Simple grid, 6 rows
  Today: Background Warm Gold circle
  Selected: Deep Sage background
  
Time Picker:
  Scrollable wheels (atau input fields)
  Current time: Warm Gold highlight
```

### Tags & Badges

```
Category Tag:
  Background: 20% opacity dari category color
  Text: Category name, 11px Inter, medium, soft cream
  Padding: 4px 12px
  Border-radius: 20px (fully rounded)
  Optional X to remove (small, minimal)
  
Status Badge:
  Background: 30% opacity dari status color
  Text: 10px inter, semibold, uppercase
  Padding: 4px 8px
  Border-radius: 4px
  Completed: Green
  Pending: Gold
  Overdue: Brown
```

---

## 🌍 Responsive Design

### Breakpoints
```
Mobile:   0px - 640px
Tablet:   641px - 1024px
Desktop:  1025px+
```

### Mobile Optimization
```
- Stack layout: Sidebar becomes collapsible hamburger
- Cards: Full width minus 16px padding
- Font sizes: Reduced 10% on headings for mobile
- Spacing: Reduce xl/2xl to lg on mobile
- Timeline: Single column, dot moves above time text
- Buttons: 44px min height untuk easy tap
- Modals: Full height sa mobile, swipe to close
```

### Tablet Optimization
```
- Sidebar: Hidden, hamburger menu available
- Container: 90% width
- Cards: 2 columns grid jika applicable
- Typography: Between mobile dan desktop sizes
```

---

## 📱 Platform-Specific Considerations

### PWA (Web App)
```
- Standalone window frame (no browser UI)
- Safe area consideration para sa notched devices
- Touch-friendly hit targets: 44x44px minimum
- Statusbar styling: Dark theme matching app
```

### iOS (via PWA)
```
- Status bar: dark-content
- Viewport: Proper viewport-fit=cover para notch
- Scroll: Momentum scrolling preserved
- Home screen icon: 180x180px, no rounded corners (iOS handles)
```

### Android (via PWA)
```
- Status bar padding: 24dp
- Navigation bar: 48dp bottom padding jika applicable
- Splash screen: Custom branding
```

---

## 🎯 Design Tokens (CSS Variables)

```css
/* Colors */
--color-bg-primary: #0F0F0F;
--color-text-primary: #F5F3F0;
--color-text-secondary: #D0D0D0;
--color-accent-primary: #546B5D;
--color-accent-warm: #D4A574;
--color-accent-blush: #E8D7D3;
--color-income: #8BA887;
--color-expense: #B8956A;
--color-insight: #9B8B7E;
--color-energy: #D9B99F;

/* Typography */
--font-serif: 'Crimson Text', serif;
--font-sans: 'Inter', sans-serif;
--font-size-display: 40px;
--font-size-h1: 32px;
--font-size-h2: 24px;
--font-size-body: 16px;
--font-size-caption: 14px;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 8px 32px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 16px 56px rgba(0, 0, 0, 0.2);

/* Transitions */
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--easing-out: cubic-bezier(0.4, 0, 0.2, 1);
--easing-in: cubic-bezier(0.4, 0, 0.58, 1);
```

---

## 🔮 Design Inspiration & Aesthetic Direction

### Visual References (Gaya, Bukan Copy)
- **Letterpress**: Minimalis serif typography, generous whitespace
- **Things 3**: Calm, organized, warm color palette
- **Day One**: Personal journal aesthetic, typography-first
- **Notion**: Clean grids, calm backgrounds, user-controlled
- **Apple Notes**: Simplicity, handcrafted feel
- **Scandinavian Interior**: Muted colors, functional beauty, breathing room

### Design Philosophy References
- Dieter Rams "Less but Better"
- Jony Ive's philosophy: Simplicity through reduction
- Typographic minimalism (think editorial design)
- Warm modernism (tidak cold, tech-forward)

### Mood & Feeling
- Intimate, not corporate
- Warm, not sterile
- Organized, not overwhelming
- Personal, not generic
- Contemporary, not trendy
- Accessible, not exclusive

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Setup CSS variables system
- [ ] Create global typography styles (Crimson Text + Inter)
- [ ] Implement color palette
- [ ] Build spacing/grid system

### Phase 2: Core Components
- [ ] Button variations (primary, secondary, text, destructive)
- [ ] Input fields (text, date, time, textarea, select)
- [ ] Cards (standard, elevated, minimal)
- [ ] Tags & badges
- [ ] Icons (custom minimalist set)

### Phase 3: Layout
- [ ] Global header component
- [ ] Sidebar navigation (collapsible)
- [ ] Main content container
- [ ] Modal/dialog framework
- [ ] Responsive breakpoints

### Phase 4: Micro-interactions
- [ ] Button hover/active states
- [ ] Input focus effects
- [ ] Page transitions
- [ ] Loading states
- [ ] Success/error feedback

### Phase 5: Pages
- [ ] Home/Today view
- [ ] Timeline page
- [ ] Finance page
- [ ] Reminders page
- [ ] Insights page

### Phase 6: Polish
- [ ] Accessibility audit (WCAG AA)
- [ ] Animation performance optimization
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] PWA deployment optimization

---

## ♿ Accessibility Guidelines

```
Color Contrast:
  Text: Minimum 4.5:1 ratio (WCAG AA)
  UI Components: Minimum 3:1 ratio

Typography:
  Minimum font size: 14px (body text)
  Line height: Minimum 1.5x
  Letter spacing: 0.02em untuk improved readability

Interactive Elements:
  Minimum hit target: 44x44px
  Focus indicators: Visible outline (2px)
  Keyboard navigation: Full support, logical tab order

Motion:
  Respect prefers-reduced-motion setting
  Animation duration: >200ms (easier to perceive)
  Avoid rapid flashing (>3Hz)

Forms:
  Explicit labels untuk semua inputs
  Error messages linked ke fields
  Success messages announced sama screen readers
```

---

## 🚀 Performance Considerations

```
Web Fonts:
  Load: async dengan fallback
  Weights: Load only 400, 500, 600, 700
  Variable fonts: Single file untuk Crimsons Text variants

CSS:
  Use CSS variables para theme switching
  Minimal media queries (mobile-first)
  BEM naming convention untuk maintainability

Animations:
  Use transform & opacity (GPU accelerated)
  Avoid animating width/height (use scale instead)
  Debounce scroll events

Images:
  SVG untuk icons & illustrations
  WebP dengan fallback untuk photos
  Lazy load images outside viewport
```

---

**Version:** 1.0  
**Last Updated:** April 7, 2026  
**Design Lead:** TRASON Design System  
**Status:** Ready for Implementation
