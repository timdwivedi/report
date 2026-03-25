// ── Bloom Shared Components ──
// These components are available in every Bloom build.
// Agents should use them to make apps feel alive and interactive.

// Animation — Scroll-triggered reveals and counters
export { default as ScrollReveal } from './ScrollReveal'
export { default as AnimatedCounter } from './AnimatedCounter'
export { StaggerContainer, StaggerItem } from './StaggerChildren'

// Data Display — Tables with enforced column alignment
export { default as DataTable } from './DataTable'
export type { Column } from './DataTable'
export { default as StatCard } from './StatCard'

// Landing Page — Rich inline SVG illustrations (no external images)
export { default as FeatureVisual } from './FeatureVisual'

// Portal — Renders overlays at document.body (fixes overflow-hidden gap)
export { default as Portal } from './Portal'

// Modal — Centered dialog for forms, confirmations, actions
export { default as Modal } from './Modal'

// SlidePanel — Right-side slide-out panel for detail views
export { default as SlidePanel } from './SlidePanel'

// ProjectStatusStepper — Horizontal pipeline progress indicator
export { default as ProjectStatusStepper } from './ProjectStatusStepper'

// Interactive Demo — Makes mockup apps feel real
export { default as DemoToastProvider, useToast } from './DemoToastProvider'
export { default as ClickReveal, MockDetail, DetailPanel } from './ClickReveal'
export { default as ActionButton } from './ActionButton'
export { default as DemoNotifications } from './DemoNotifications'
export { default as LoadingSequence } from './LoadingSequence'

// Pricing — Quantity-break cost/margin grid for quoting
export { default as PricingGrid } from './PricingGrid'
