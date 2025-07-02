# 🎨 Quizito Design System

## 🖤 Visual Theme: Dark, Minimal, Elegant

### Background System
All pages now use a consistent `PageBackground` component with three variants:
- **`hero`** - 50 particles, full gradient orbs (home page)
- **`default`** - 25 particles, gradient orbs (app pages)
- **`minimal`** - 15 particles, no orbs (loading/auth states)

### 🌈 Color Palette

| Use Case | Color | Hex | Usage |
|----------|-------|-----|-------|
| **Primary Accent** | Indigo | `#6366F1` | Main CTAs, active states |
| **Secondary Accent** | Teal | `#14B8A6` | Hover states, success |
| **Danger** | Red | `#EF4444` | Errors, warnings |
| **Success** | Green | `#22C55E` | Success messages |
| **Background** | Near Black | `#0D0D0D` | Page background |
| **Surface** | Dark Gray | `#1E1E1E` | Cards, containers |
| **Surface Alt** | Lighter Dark | `#2A2A2A` | Borders, dividers |
| **Text Primary** | Light Gray | `#E0E0E0` | Main text content |
| **Text Secondary** | Gray | `#A0A0A0` | Descriptions, labels |
| **Text Muted** | Dark Gray | `#666` | Helper text, captions |

### 🧱 Typography System

#### Components Available:
- `<PageTitle>` - Large gradient titles (4xl-6xl)
- `<SectionTitle>` - Section headings (2xl-3xl)
- `<CardTitle>` - Card/component titles (xl)
- `<BodyText>` - Main content text (base)
- `<MutedText>` - Small helper text (sm)
- `<GradientText>` - Customizable gradient text

#### Typography Hierarchy:
```tsx
// Page Title - Used for main page headers
<PageTitle>Welcome to Quizito</PageTitle>

// Section Title - Used for major sections
<SectionTitle>My Quizzes</SectionTitle>

// Card Title - Used within cards and components
<CardTitle>Get Started</CardTitle>

// Body Text - Main content
<BodyText>Transform knowledge into engaging quizzes</BodyText>

// Muted Text - Helper text
<MutedText>Sign in to create amazing quizzes</MutedText>
```

### 🎭 Animation System

#### Standard Variants:
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1-0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20-30, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};
```

#### Hover Effects:
- Buttons: Scale 1.02-1.05, color transitions
- Icons: Scale 1.1, color change to brand colors
- Cards: Shadow intensification, backdrop blur

### 🔧 Component Standards

#### Buttons
```tsx
// Primary Button
<Button className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6] hover:from-[#5B5CF6] hover:to-[#10B981] text-white transition-all duration-300">

// Secondary Button  
<Button className="bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#6366F1]/50 text-white">
```

#### Cards
```tsx
<Card className="bg-[#1E1E1E]/80 backdrop-blur-sm border-[#2A2A2A] shadow-xl shadow-purple-500/5">
```

#### Inputs
```tsx
<Input className="bg-[#2A2A2A]/50 border-[#3A3A3A] text-[#E0E0E0] placeholder:text-[#666] focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20 transition-all">
```

### 🌟 Background Effects

Every page includes:
1. **Base gradient**: `from-purple-900/10 via-transparent to-pink-900/10`
2. **Floating particles**: Animated gradient dots
3. **Gradient orbs**: Large blurred background elements
4. **Backdrop blur**: Cards use `backdrop-blur-sm/xl`

### ✅ Design Principles

1. **Consistency**: All pages use `AppLayout` with `PageBackground`
2. **Accessibility**: Proper contrast ratios, semantic HTML
3. **Performance**: Optimized animations, SSR-safe components
4. **Responsiveness**: Mobile-first design with breakpoints
5. **Hierarchy**: Clear visual hierarchy with typography system
6. **Interactivity**: Smooth hover states and micro-interactions

### 🚀 Implementation

#### Page Structure:
```tsx
export default function YourPage() {
  return (
    <AppLayout backgroundVariant="default">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageTitle>Your Title</PageTitle>
          <BodyText>Your content</BodyText>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
```

This system ensures visual consistency, improved user experience, and maintainable code across the entire Quizito application. 