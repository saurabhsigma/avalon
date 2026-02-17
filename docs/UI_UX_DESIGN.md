# 🎨 UI/UX Design Guidelines

## Modern Educational Platform Design System

---

## 🎯 Design Principles

### 1. **Clarity Over Complexity**
- Clean, uncluttered interfaces
- Clear visual hierarchy
- Obvious call-to-actions
- Minimal cognitive load

### 2. **Consistency**
- Uniform spacing and sizing
- Consistent component behavior
- Predictable navigation
- Standardized terminology

### 3. **Accessibility First**
- WCAG 2.1 AA compliance
- High contrast ratios
- Keyboard navigation
- Screen reader support
- Focus indicators

### 4. **Performance**
- Fast load times
- Smooth animations (60fps)
- Optimized images
- Lazy loading

### 5. **Responsive & Adaptive**
- Mobile-first approach
- Fluid layouts
- Touch-friendly targets (44px min)
- Adaptive content

---

## 🎨 Color System

### Light Theme
```css
:root {
  /* Primary - Purple/Indigo */
  --primary: 263 70% 50%;          /* #6366F1 */
  --primary-foreground: 0 0% 100%; /* #FFFFFF */
  
  /* Background */
  --background: 0 0% 100%;         /* #FFFFFF */
  --foreground: 240 10% 3.9%;      /* #09090B */
  
  /* Card */
  --card: 0 0% 100%;               /* #FFFFFF */
  --card-foreground: 240 10% 3.9%; /* #09090B */
  
  /* Muted */
  --muted: 240 4.8% 95.9%;         /* #F4F4F5 */
  --muted-foreground: 240 3.8% 46%; /* #71717A */
  
  /* Accent */
  --accent: 240 4.8% 95.9%;        /* #F4F4F5 */
  --accent-foreground: 240 5.9% 10%; /* #18181B */
  
  /* Border */
  --border: 240 5.9% 90%;          /* #E4E4E7 */
  --input: 240 5.9% 90%;           /* #E4E4E7 */
  
  /* Success */
  --success: 142 76% 36%;          /* #16A34A */
  --success-foreground: 0 0% 100%; /* #FFFFFF */
  
  /* Warning */
  --warning: 38 92% 50%;           /* #F59E0B */
  --warning-foreground: 0 0% 100%; /* #FFFFFF */
  
  /* Error */
  --destructive: 0 84% 60%;        /* #EF4444 */
  --destructive-foreground: 0 0% 100%; /* #FFFFFF */
  
  /* Info */
  --info: 199 89% 48%;             /* #0EA5E9 */
  --info-foreground: 0 0% 100%;    /* #FFFFFF */
}
```

### Dark Theme
```css
.dark {
  /* Primary */
  --primary: 263 70% 50%;          /* #6366F1 */
  --primary-foreground: 0 0% 100%; /* #FFFFFF */
  
  /* Background */
  --background: 240 10% 3.9%;      /* #09090B */
  --foreground: 0 0% 98%;          /* #FAFAFA */
  
  /* Card */
  --card: 240 10% 3.9%;            /* #09090B */
  --card-foreground: 0 0% 98%;     /* #FAFAFA */
  
  /* Muted */
  --muted: 240 3.7% 15.9%;         /* #27272A */
  --muted-foreground: 240 5% 64.9%; /* #A1A1AA */
  
  /* Accent */
  --accent: 240 3.7% 15.9%;        /* #27272A */
  --accent-foreground: 0 0% 98%;   /* #FAFAFA */
  
  /* Border */
  --border: 240 3.7% 15.9%;        /* #27272A */
  --input: 240 3.7% 15.9%;         /* #27272A */
}
```

### Subject Colors
```typescript
const subjectColors = {
  physics: '#6366F1',    // Indigo
  chemistry: '#EC4899',  // Pink
  biology: '#10B981',    // Green
  mathematics: '#F59E0B', // Amber
  english: '#8B5CF6',    // Violet
  history: '#EF4444',    // Red
  geography: '#14B8A6',  // Teal
  computer: '#3B82F6',   // Blue
};
```

---

## 📏 Typography

### Font Family
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Font Scale
```css
/* Headings */
.text-h1 { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; }  /* 36px */
.text-h2 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; } /* 30px */
.text-h3 { font-size: 1.5rem; line-height: 2rem; font-weight: 600; }      /* 24px */
.text-h4 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; }  /* 20px */
.text-h5 { font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; } /* 18px */

/* Body */
.text-base { font-size: 1rem; line-height: 1.5rem; }        /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }     /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; }         /* 12px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }     /* 18px */
```

### Font Weights
```css
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

---

## 📐 Spacing & Layout

### Spacing Scale (Base: 4px)
```css
.p-0  { padding: 0; }
.p-1  { padding: 0.25rem; }  /* 4px */
.p-2  { padding: 0.5rem; }   /* 8px */
.p-3  { padding: 0.75rem; }  /* 12px */
.p-4  { padding: 1rem; }     /* 16px */
.p-5  { padding: 1.25rem; }  /* 20px */
.p-6  { padding: 1.5rem; }   /* 24px */
.p-8  { padding: 2rem; }     /* 32px */
.p-10 { padding: 2.5rem; }   /* 40px */
.p-12 { padding: 3rem; }     /* 48px */
```

### Layout Grid
```css
/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Grid System */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

/* Responsive */
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

---

## 🎭 Component Styles

### Buttons

#### Primary Button
```tsx
<button className="
  inline-flex items-center justify-center
  rounded-lg px-4 py-2
  bg-primary text-primary-foreground
  font-medium text-sm
  transition-colors duration-200
  hover:bg-primary/90
  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
">
  Button Text
</button>
```

#### Secondary Button
```tsx
<button className="
  border border-input bg-background
  hover:bg-accent hover:text-accent-foreground
">
  Secondary
</button>
```

#### Ghost Button
```tsx
<button className="
  hover:bg-accent hover:text-accent-foreground
">
  Ghost
</button>
```

### Cards

#### Default Card
```tsx
<div className="
  rounded-xl border bg-card text-card-foreground
  shadow-sm
  transition-shadow duration-200
  hover:shadow-md
">
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-2">Card Title</h3>
    <p className="text-sm text-muted-foreground">Card description...</p>
  </div>
</div>
```

#### Glass Card (for live sessions)
```tsx
<div className="
  rounded-xl
  bg-white/10 backdrop-blur-lg
  border border-white/20
  shadow-xl
">
  Content
</div>
```

### Inputs

```tsx
<input className="
  flex h-10 w-full
  rounded-md border border-input
  bg-background px-3 py-2
  text-sm
  ring-offset-background
  file:border-0 file:bg-transparent file:text-sm file:font-medium
  placeholder:text-muted-foreground
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
  disabled:cursor-not-allowed disabled:opacity-50
" />
```

---

## 🎬 Animations

### Transitions
```css
/* Default transition */
.transition-base {
  transition: all 0.2s ease-in-out;
}

/* Color transition */
.transition-colors {
  transition: color 0.2s, background-color 0.2s;
}

/* Transform transition */
.transition-transform {
  transition: transform 0.3s ease;
}
```

### Keyframe Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Pulse (for live indicator) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin (for loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Framer Motion Variants
```typescript
// Stagger Children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Usage
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 🎯 Page Layouts

### Teacher Dashboard Layout
```
┌─────────────────────────────────────┐
│  Topbar (Logo, Search, Profile)    │
├─────┬───────────────────────────────┤
│     │                               │
│  S  │  Main Content Area            │
│  i  │  ┌─────────┐ ┌─────────┐    │
│  d  │  │ Card 1  │ │ Card 2  │    │
│  e  │  └─────────┘ └─────────┘    │
│  b  │                               │
│  a  │  ┌───────────────────────┐   │
│  r  │  │   Table / List        │   │
│     │  └───────────────────────┘   │
│     │                               │
└─────┴───────────────────────────────┘
```

### Student Dashboard (Mobile)
```
┌─────────────────────────┐
│  Topbar                 │
├─────────────────────────┤
│                         │
│  Content                │
│  ┌───────────────┐      │
│  │   Card        │      │
│  └───────────────┘      │
│  ┌───────────────┐      │
│  │   Card        │      │
│  └───────────────┘      │
│                         │
├─────────────────────────┤
│  Bottom Navigation      │
│  [Home][Classes][Live]  │
└─────────────────────────┘
```

### Live Session Layout
```
┌─────────────────────────────────────┐
│  Session Topbar (Title, Controls)   │
├──────────────────────┬──────────────┤
│                      │              │
│  Main Video Grid     │   Sidebar    │
│  ┌────────┬────────┐ │  ┌────────┐ │
│  │Teacher │Student │ │  │ Chat   │ │
│  └────────┴────────┘ │  │        │ │
│  ┌────────┬────────┐ │  │        │ │
│  │Student │Student │ │  └────────┘ │
│  └────────┴────────┘ │  ┌────────┐ │
│                      │  │Particip│ │
│                      │  └────────┘ │
├──────────────────────┴──────────────┤
│  Control Bar (Mic, Cam, Share)      │
└─────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Mobile-First Approach
```css
/* Base styles (mobile) */
.class {
  font-size: 14px;
  padding: 8px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .class {
    font-size: 16px;
    padding: 12px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .class {
    font-size: 18px;
    padding: 16px;
  }
}
```

### Component Responsiveness
```tsx
// Responsive grid
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
">
  {items}
</div>

// Responsive text
<h1 className="
  text-2xl
  md:text-3xl
  lg:text-4xl
  font-bold
">
  Title
</h1>

// Responsive padding
<div className="
  p-4
  md:p-6
  lg:p-8
">
  Content
</div>
```

---

## 🎨 UI Patterns

### Status Badges
```tsx
const statusConfig = {
  present: { color: 'bg-green-500', icon: '✓' },
  absent: { color: 'bg-red-500', icon: '✗' },
  late: { color: 'bg-yellow-500', icon: '⏰' },
  live: { color: 'bg-green-500 animate-pulse', icon: '🔴' },
  scheduled: { color: 'bg-blue-500', icon: '📅' },
  completed: { color: 'bg-gray-500', icon: '✓' },
};

<span className={`
  inline-flex items-center gap-1
  px-2 py-1 rounded-full
  text-xs font-medium text-white
  ${statusConfig[status].color}
`}>
  {statusConfig[status].icon} {status}
</span>
```

### Avatar Patterns
```tsx
// With image
<div className="h-10 w-10 rounded-full overflow-hidden">
  <img src={avatar} alt={name} className="h-full w-full object-cover" />
</div>

// Initials fallback
<div className="
  h-10 w-10 rounded-full
  bg-primary text-primary-foreground
  flex items-center justify-center
  font-semibold text-sm
">
  {initials}
</div>
```

### Loading States
```tsx
// Skeleton loader
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>

// Spinner
<div className="
  animate-spin h-8 w-8
  border-2 border-current border-t-transparent
  rounded-full
"></div>
```

### Empty States
```tsx
<div className="
  flex flex-col items-center justify-center
  py-12 px-4 text-center
">
  <div className="text-4xl mb-4">📚</div>
  <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
  <p className="text-sm text-muted-foreground mb-4">
    Get started by creating your first class
  </p>
  <Button>Create Class</Button>
</div>
```

---

## 🌟 Micro-interactions

### Hover Effects
```css
/* Card hover */
.card {
  transition: all 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* Button hover */
.button {
  transition: transform 0.1s;
}
.button:active {
  transform: scale(0.98);
}
```

### Focus States
```css
/* Keyboard focus */
.focusable:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Success Feedback
```tsx
// Toast notification
toast.success('Session scheduled successfully!', {
  icon: '✅',
  duration: 3000,
});

// Check animation
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  ✓
</motion.div>
```

---

## ♿ Accessibility

### Color Contrast
- Text on background: minimum 4.5:1
- Large text: minimum 3:1
- Interactive elements: minimum 3:1

### Keyboard Navigation
```tsx
// Tab order
<div tabIndex={0} onKeyDown={handleKeyDown}>
  Interactive element
</div>

// Escape to close
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, []);
```

### Screen Reader Support
```tsx
// ARIA labels
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// ARIA live regions
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## 🎨 Design Inspiration

### Reference Sites
- **Linear** - Clean, modern dashboard
- **Notion** - Flexible, content-focused
- **Vercel** - Minimalist, fast
- **Stripe** - Professional, clear
- **Framer** - Smooth animations

### Design Resources
- **Icons**: Lucide Icons (https://lucide.dev)
- **Illustrations**: unDraw (https://undraw.co)
- **Colors**: Tailwind Colors
- **Fonts**: Google Fonts (Inter, Poppins)

---

## ✨ Polish Checklist

- [ ] All interactive elements have hover states
- [ ] Focus states are visible
- [ ] Loading states for all async operations
- [ ] Error states with helpful messages
- [ ] Empty states with CTAs
- [ ] Smooth page transitions
- [ ] Consistent spacing throughout
- [ ] All text is readable (contrast)
- [ ] Images have alt text
- [ ] Forms have validation feedback
- [ ] Success confirmations for actions
- [ ] Mobile touch targets ≥ 44px
- [ ] Animations are smooth (60fps)
- [ ] Dark mode properly implemented
