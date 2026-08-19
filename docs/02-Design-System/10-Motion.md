# 10 Motion

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Interaction

---

# Purpose

The Motion System defines the animation and transition standards used throughout the eBPCO ecosystem.

Motion should enhance usability by providing visual feedback, reinforcing interactions, and guiding users through workflows. Animations should never distract from completing government services.

This document applies to both the Angular Web Administration Portal and the Flutter Mobile Application.

---

# Objectives

The Motion System exists to:

- Improve user experience.
- Provide visual feedback.
- Reinforce interaction states.
- Create smooth transitions.
- Improve perceived performance.
- Standardize animation behavior.
- Support accessible interfaces.
- Improve AI-assisted frontend development.

---

# Design Principles

Motion should be:

- Purposeful
- Subtle
- Consistent
- Predictable
- Accessible
- Fast
- Non-blocking

Animations should communicate intent rather than decoration.

---

# Motion Categories

The Design System defines the following motion categories:

- Page Transitions
- Component Transitions
- Hover Animations
- Focus Animations
- Loading Animations
- Navigation Animations
- Dialog Animations
- Notification Animations
- Status Animations

Each category should follow the approved motion standards.

---

# Transition Durations

Motion durations should use centralized duration tokens.

Examples:

```
motion-instant

motion-fast

motion-normal

motion-slow
```

Applications should avoid arbitrary animation durations.

---

# Easing

Animations should use approved easing curves.

Examples:

```
ease-standard

ease-in

ease-out

ease-in-out
```

The same easing functions should be used consistently throughout the application.

---

# Page Transitions

Page transitions should:

- Feel smooth.
- Complete quickly.
- Preserve user orientation.
- Avoid excessive movement.

Recommended transitions:

- Fade
- Slide
- Fade + Slide (where appropriate)

Complex transitions are discouraged.

---

# Component Transitions

Interactive components should animate appropriately.

Examples:

- Expansion panels
- Accordions
- Dropdown menus
- Side drawers
- Bottom sheets
- Floating menus

Transitions should remain responsive and unobtrusive.

---

# Hover Animations

Desktop interactions may include:

- Background color changes
- Shadow changes
- Elevation changes
- Border emphasis

Hover animations should not delay user interaction.

Flutter should not implement hover effects except on desktop platforms.

---

# Focus Animations

Focused elements should provide clear visual feedback.

Examples:

- Focus ring
- Border highlight
- Subtle color transition

Focus indicators must remain visible for keyboard users.

---

# Loading Animations

Loading indicators should communicate system activity without causing distraction.

Approved loading components include:

- Circular progress indicators
- Linear progress indicators
- Skeleton loaders
- Button loading states

Avoid decorative loading animations.

---

# Dialog Animations

Dialogs should:

- Fade into view.
- Scale subtly where appropriate.
- Close smoothly.

Animations should not interfere with user interaction.

---

# Navigation Animations

Navigation components should transition consistently.

Examples:

- Sidebar expansion
- Drawer opening
- Bottom navigation changes
- Page navigation

Navigation animations should preserve spatial orientation.

---

# Notification Animations

Notifications should:

- Enter smoothly.
- Exit automatically when appropriate.
- Avoid covering critical interface elements.

Examples:

- Snackbars
- Toast messages
- Alert banners

---

# Status Animations

Status changes may include subtle animations.

Examples:

- Success confirmation
- Progress completion
- Upload completion
- Approval indicators

Animations should reinforce workflow without distracting users.

---

# Accessibility

Motion must support users with motion sensitivity.

Applications should:

- Respect operating system motion preferences.
- Reduce non-essential animations.
- Avoid flashing effects.
- Avoid rapid movement.
- Never rely on animation alone to communicate information.

Users must still understand interface changes when animations are disabled.

---

# Platform Implementation

## Angular

Motion should be implemented using:

- Angular Animations
- CSS transitions
- CSS keyframes (where appropriate)

Animations should be centralized and reusable.

---

## Flutter

Motion should be implemented using:

- AnimatedContainer
- AnimatedOpacity
- AnimatedSwitcher
- Hero (where appropriate)
- AnimationController
- Theme animations

Widgets should avoid custom animation implementations unless required.

---

# Hardcoded Animations

Hardcoded animation timings and easing curves are prohibited except for documented exceptions approved by the UI/UX Team.

---

# AI Development Guidelines

AI-generated code must:

- Use approved motion tokens.
- Reuse existing animation patterns.
- Respect accessibility preferences.
- Avoid unnecessary animations.
- Maintain consistent transition behavior across Angular and Flutter.

---

# Governance

All animations within the eBPCO ecosystem must comply with the approved Motion System.

New animation patterns require UI/UX Team review before implementation.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application

Status

Approved

Version

1.0.0