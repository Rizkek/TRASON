# Status Report: Weekly Routine + Light Theme

## ❌ **WEEKLY ROUTINE - NOT COMPLETE**

### Current State:
```
Timeline Page (/timeline)
    ↓
Redirects to: /schedule
    ↓
WeeklyScheduleView component exists BUT:
    ❌ Not fully integrated
    ❌ Button "Weekly Focus" di dashboard tidak link ke schedule
    ❌ No create/edit template UI di halaman
    ❌ No data flow from API
```

### What's Built:
✅ Database schema (migration file)
✅ Type definitions
✅ Utility functions
✅ Service queries
✅ Hooks (useWeeklyTemplate, useWeekSchedule)
✅ Main display component (WeeklyScheduleView)
✅ Day display component (DaySchedule)
✅ Template builder component (TemplateBuilder)

### What's MISSING:
❌ **Integration ke Timeline page** - Perlu setup WeeklyScheduleView di `/app/timeline/page.tsx`
❌ **Integration ke Dashboard** - "Weekly Focus" button harus ke `/schedule`
❌ **Template creation flow** - User perlu bisa create/edit template dari UI
❌ **Navigation** - Perlu link di sidebar ke schedule page
❌ **Weekly schedule page** - `/app/schedule/page.tsx` belum ada

### Flow Status:
```
Dashboard → [Weekly Focus] → Should go to /schedule
                               ↓
                            /schedule page
                               ↓
                            Show this week's template
                               ↓
                            [Edit Template] button
                               ↓
                            Template builder modal
                               ↓
                            Save & apply
```

**Status:** 30% complete - Infrastructure ada, UI integration missing

---

## ❌ **LIGHT THEME - NOT 100% IMPLEMENTED**

### Current State:
```typescript
// settings/page.tsx line 394
const isComingSoon = t !== 'dark';  // ← Light & auto DISABLED

{(['dark', 'light', 'auto'] as const).map((t) => {
  return (
    <button
      disabled={isComingSoon}  // ← Cannot click light/auto
      ...
    >
```

**Message di UI:**
```
"Dark mode is the supported theme for now. 
Light and auto will be enabled after the full design pass."
```

### What's Built:
✅ Button UI (3 options: dark, light, auto)
✅ Settings preference field
✅ Toggle disabled state
✅ CSS for dark mode (complete)

### What's MISSING:
❌ **Light theme colors** - Belum ada CSS variables untuk light mode
❌ **Color switching logic** - Belum ada logic yang apply theme
❌ **CSS dark/light selectors** - Belum ada `@media (prefers-color-scheme: light)`
❌ **Theme provider** - Belum ada component yang manage theme switching
❌ **localStorage persistence** - Belum ada saving theme preference
❌ **System preference detection** - Belum ada untuk "auto" mode

### Implementation Needed:

**1. Create Light Theme Colors** (tailwind.config.js):
```typescript
theme: {
  extend: {
    colors: {
      // Dark mode (current - sudah ada)
      'warm-black': '#0F0F0F',
      'soft-cream': '#F5F3F0',
      
      // Light mode (MISSING)
      'light-bg': '#FAFAF8',
      'light-text': '#1A1A1A',
      'light-accent': '#D4A574',
      // ... etc
    }
  }
}
```

**2. Create Theme Provider Hook** (MISSING):
```typescript
// hooks/useThemeProvider.ts
export const useThemeProvider = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
};
```

**3. Update CSS** (globals.css):
```css
/* Current: only dark */
body {
  @apply bg-warm-black text-soft-cream;
}

/* MISSING: light mode */
[data-theme="light"] body {
  @apply bg-light-bg text-light-text;
}

/* MISSING: auto (system preference) */
@media (prefers-color-scheme: light) {
  [data-theme="auto"] body {
    @apply bg-light-bg text-light-text;
  }
}
```

**4. Update Settings Handler** (settings/page.tsx):
```typescript
const handleThemeChange = (theme: 'dark' | 'light' | 'auto') => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  // Update preferences di database
};
```

---

## 📊 **COMPLETION STATUS**

| Feature | Status | Effort | Priority |
|---------|--------|--------|----------|
| **Weekly Routine** |
| Database schema | ✅ 100% | - | - |
| Types & interfaces | ✅ 100% | - | - |
| Service layer | ✅ 100% | - | - |
| React hooks | ✅ 100% | - | - |
| Components | ✅ 80% | 1h | HIGH |
| **Page integration** | ❌ 0% | 2h | HIGH |
| **Template UI** | ✅ 60% | 1.5h | HIGH |
| **Navigation** | ❌ 0% | 30min | MEDIUM |
| **Total** | 🟠 **40%** | **4.5h** | - |
| | | | |
| **Light Theme** |
| Settings UI | ✅ 100% | - | - |
| Color palette | ❌ 0% | 1.5h | MEDIUM |
| Theme provider | ❌ 0% | 1h | MEDIUM |
| CSS switching | ❌ 0% | 1h | MEDIUM |
| Persistence | ❌ 0% | 30min | MEDIUM |
| **Total** | 🔴 **0%** | **4h** | - |

---

## 🎯 **NEXT STEPS (Priority Order)**

### HIGH PRIORITY (Weekly Routine):
1. **Create `/app/schedule/page.tsx`** (30 min)
   - Import WeeklyScheduleView
   - Add template builder toggle
   - Setup week navigation

2. **Update `/app/timeline/page.tsx`** (30 min)
   - Replace redirect with actual schedule page content
   - Or just keep redirect if moving to schedule page

3. **Update Dashboard** (30 min)
   - Fix "Weekly Focus" button to navigate to `/schedule`
   - Ensure WeeklyScheduleView shows properly

4. **Add Navigation** (30 min)
   - Add "Schedule" link to sidebar menu
   - Remove old "Timeline" or repurpose it

5. **Fix Template Integration** (1h)
   - Connect TemplateBuilder to dashboard/schedule
   - Add create/edit flows

### MEDIUM PRIORITY (Light Theme):
1. **Extend Tailwind config** (1h)
   - Add light mode colors
   - Setup color variables

2. **Create theme provider** (1h)
   - useThemeProvider hook
   - localStorage integration
   - System preference detection

3. **Update CSS** (1h)
   - Add `[data-theme="light"]` selectors
   - Test contrast ratios

4. **Update Settings handler** (30 min)
   - Enable light/auto buttons
   - Add save functionality

---

## ❓ **WHY BUTTON NO INTERACTION?**

**Weekly Routine button issues:**
```javascript
// Dashboard button
<Button 
  onClick={() => router.push('/schedule')}  // ← Should navigate
  className="text-warm-gold hover:text-warm-gold/80"
>
  Full Schedule
</Button>

// But /schedule page doesn't exist yet!
// So button works tapi page kosong/redirect nowhere
```

**Light theme button issues:**
```javascript
<button
  disabled={isComingSoon}  // ← DISABLED!
  onClick={() => updatePrefs('theme', t)}
>
  Light
</button>

// Cannot click because disabled={true}
```

---

## 📋 **SUMMARY TABLE**

| Item | Status | Why Not Done | Fix Time |
|------|--------|-------------|----------|
| Weekly schedule display | ✅ Ready | - | - |
| Create/edit template | ✅ Ready | - | - |
| `/schedule` page | ❌ Missing | Not created yet | 30min |
| Schedule navigation | ❌ Missing | Sidebar missing link | 15min |
| Dashboard integration | 🟡 Partial | Button exists, page missing | 30min |
| Light theme UI | ✅ Exists | - | - |
| Light theme colors | ❌ Missing | Design not done | 1.5h |
| Light theme switching | ❌ Missing | Logic not implemented | 2h |
| Theme persistence | ❌ Missing | localStorage not setup | 30min |

---

## 🚀 **QUICK FIXES TO ENABLE FUNCTIONALITY**

### Fix 1: Weekly Schedule (30 min)
```bash
# Create schedule page
touch src/app/schedule/page.tsx

# Content:
'use client';
import { WeeklyScheduleView } from '@/components/Schedule';
import { Layout } from '@/components';

export default function SchedulePage() {
  return (
    <Layout>
      <WeeklyScheduleView />
    </Layout>
  );
}
```

### Fix 2: Add Sidebar Link (5 min)
```typescript
// layout/Layout.tsx - add to menuItems
{ 
  label: 'Schedule', 
  href: '/schedule', 
  icon: Calendar 
}
```

### Fix 3: Enable Light Theme (2 hours)
- Add light colors ke tailwind.config.js
- Create useThemeProvider hook
- Update globals.css dengan light selectors
- Enable buttons di settings

---

**Status:** 
- **Weekly Routine:** 40% done (infrastructure complete, UI integration missing)
- **Light Theme:** 0% done (only UI buttons, no functionality)

**Estimate to Complete:** 8-10 hours total
