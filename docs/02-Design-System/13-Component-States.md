# 13 Component States

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Interaction

---

# Purpose

Component States define the standard interaction and feedback states that reusable UI components must support throughout the eBPCO ecosystem.

By standardizing component behavior, users receive predictable visual feedback regardless of which screen or platform they are using.

This document applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

The Component State system exists to:

- Standardize user interactions.
- Improve accessibility.
- Improve usability.
- Maintain visual consistency.
- Support reusable components.
- Simplify frontend development.
- Improve AI-assisted frontend implementation.

---

# Design Principles

Component states should be:

- Predictable
- Consistent
- Accessible
- Easy to recognize
- Visually distinct
- Fast to respond

Every state must clearly communicate what is happening to the user.

---

# Standard Component States

Every reusable component should support the following states where applicable.

```
Default

Hover

Focused

Active

Pressed

Selected

Disabled

Loading

Success

Warning

Error

Read Only
```

Not every component requires every state, but supported states must behave consistently.

---

# Default State

The default appearance when the component is idle.

Characteristics:

- Fully interactive
- Uses standard theme colors
- No active feedback

Examples:

- Button awaiting interaction
- Empty input field
- Card at rest

---

# Hover State

Desktop-only interaction indicating pointer proximity.

Characteristics:

- Subtle background change
- Optional elevation increase
- Pointer cursor

Hover effects should never interfere with usability.

Flutter should implement hover only for desktop platforms.

---

# Focus State

Indicates keyboard or accessibility focus.

Characteristics:

- Visible focus ring
- High contrast
- Clear boundary

Focus indicators must never be removed.

---

# Active State

Represents an actively engaged component.

Examples:

- Current navigation item
- Selected tab
- Expanded accordion
- Active filter

The Active state should remain visible until another selection is made.

---

# Pressed State

Occurs while a component is being clicked or tapped.

Characteristics:

- Temporary feedback
- Slight visual compression
- Reduced elevation
- Immediate response

Pressed states should disappear immediately after interaction.

---

# Selected State

Represents persistent selection.

Examples:

- Selected card
- Selected checkbox
- Selected chip
- Selected table row

Selection should remain visually distinct.

---

# Disabled State

Indicates that interaction is unavailable.

Characteristics:

- Reduced emphasis
- Lower contrast
- No interaction
- No hover feedback

Disabled components must remain readable.

---

# Loading State

Communicates that an operation is in progress.

Examples:

- Loading button
- Data table
- Dialog
- Form submission

Loading components should:

- Prevent duplicate actions.
- Display progress indicators.
- Preserve layout stability.

---

# Success State

Indicates successful completion.

Examples:

- Saved successfully
- Payment completed
- Application submitted
- Permit approved

Success should be communicated using:

- Approved colors
- Icons where appropriate
- Confirmation messaging

---

# Warning State

Communicates caution.

Examples:

- Unsaved changes
- Expiring session
- Missing information

Warnings should encourage user attention without implying failure.

---

# Error State

Communicates failed operations.

Examples:

- Invalid input
- Network error
- Upload failure
- Authentication failure

Errors should include:

- Clear explanation
- Recovery guidance
- Accessible messaging

---

# Read Only State

Represents information that can be viewed but not modified.

Examples:

- Approved permit details
- Historical records
- Audit logs

Read-only controls should remain visually distinguishable from disabled controls.

---

# Component Mapping

The following components should support applicable states:

| Component | States |
|------------|--------|
| Button | Default, Hover, Focus, Pressed, Disabled, Loading |
| Text Field | Default, Focus, Error, Disabled, Read Only |
| Checkbox | Default, Hover, Focus, Selected, Disabled |
| Radio Button | Default, Hover, Focus, Selected, Disabled |
| Dropdown | Default, Focus, Selected, Disabled, Error |
| Card | Default, Hover, Selected |
| Table Row | Default, Hover, Selected |
| Chip | Default, Hover, Selected, Disabled |
| Navigation Item | Default, Hover, Active |
| Dialog | Default, Loading |
| Snackbar | Success, Warning, Error |

---

# State Transitions

Transitions between states should:

- Be smooth.
- Be consistent.
- Follow Motion guidelines.
- Never delay interaction.

Avoid abrupt visual changes.

---

# Accessibility

Component states must:

- Meet WCAG 2.1 AA requirements.
- Never rely solely on color.
- Support keyboard navigation.
- Preserve screen reader compatibility.
- Remain distinguishable for users with color vision deficiencies.

---

# Platform Implementation

## Angular

States should be implemented using:

- CSS pseudo-classes
- Angular directives
- Shared component styles

Examples:

- :hover
- :focus
- :disabled
- .active

---

## Flutter

States should be implemented using:

- MaterialStateProperty
- WidgetStateProperty (where applicable)
- ThemeData
- State-aware widgets

Components should avoid custom state logic when framework support exists.

---

# Hardcoded States

Hardcoded visual state implementations are prohibited unless documented and approved by the UI/UX Team.

---

# AI Development Guidelines

AI-generated code must:

- Implement all applicable component states.
- Reuse centralized state styling.
- Respect accessibility requirements.
- Follow the Motion System for transitions.
- Avoid introducing undocumented states.

---

# Governance

All reusable components within the eBPCO ecosystem shall implement the approved Component States.

Any new interaction state must be reviewed and approved before adoption.

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platforms

- Angular Web Administration Portal
- Flutter Mobile Application

Status

Approved

Version

1.0.0