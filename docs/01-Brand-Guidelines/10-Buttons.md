# 10 Buttons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Component Category ID: BTN

---

# Purpose

Buttons are the primary action components within the eBPCO ecosystem.

They initiate user interactions such as submitting forms, saving records, navigating workflows, approving applications, and performing administrative actions.

Every button must follow the standards defined in this document.

---

# Design Principles

Buttons must be:

- Consistent
- Accessible
- Predictable
- Clearly identifiable
- Responsive
- Reusable

---

# Component Registry

| Component ID | Name | Purpose |
|--------------|------|---------|
| BTN-001 | Primary Button | Main action |
| BTN-002 | Secondary Button | Alternative action |
| BTN-003 | Outline Button | Less prominent action |
| BTN-004 | Text Button | Inline actions |
| BTN-005 | Danger Button | Destructive actions |
| BTN-006 | Icon Button | Icon-only actions |
| BTN-007 | Floating Action Button | Mobile quick actions |
| BTN-008 | Loading Button | Displays processing state |

---

# Button Sizes

| Token | Height | Usage |
|--------|-------:|------|
| Small | 32px | Tables |
| Medium | 40px | Forms |
| Large | 48px | Primary screens |

Minimum width should fit the content without truncation.

---

# Primary Button (BTN-001)

Purpose:

Main call-to-action.

Examples:

- Login
- Submit Application
- Save
- Continue
- Approve

Only one primary button should appear in a section whenever possible.

---

# Secondary Button (BTN-002)

Purpose:

Alternative action.

Examples:

- Cancel
- Back
- Previous
- Close

---

# Outline Button (BTN-003)

Purpose:

Low-emphasis actions.

Examples:

- View Details
- Preview
- Learn More

---

# Text Button (BTN-004)

Purpose:

Inline navigation or lightweight actions.

Examples:

- Forgot Password
- View More
- Show All

---

# Danger Button (BTN-005)

Purpose:

Destructive operations.

Examples:

- Delete
- Remove
- Reject
- Archive

Danger buttons require confirmation before executing critical actions.

---

# Icon Button (BTN-006)

Purpose:

Compact actions.

Examples:

- Edit
- Delete
- Refresh
- Search
- Filter

Every icon button must include an accessible label or tooltip.

---

# Floating Action Button (BTN-007)

Reserved for mobile workflows where a single high-priority action is required.

Only one Floating Action Button should appear per screen.

---

# Loading Button (BTN-008)

During processing:

- Disable interaction
- Display loading indicator
- Preserve button width
- Prevent duplicate submissions

---

# Interaction States

Every button must define:

- Default
- Hover (Web)
- Focus
- Active / Pressed
- Disabled
- Loading

State transitions should use:

- Duration: 200ms
- Timing: Ease-in-out

---

# Icon Rules

Buttons may include icons when they improve clarity.

Icon placement:

Leading icon preferred.

Trailing icons reserved for navigation actions.

Icon spacing:

8px

---

# Button Text

Use sentence case.

Correct:

Submit Application

Incorrect:

SUBMIT APPLICATION

Incorrect:

submit application

---

# Accessibility

Buttons must:

- Meet WCAG AA contrast requirements
- Have a minimum touch target of 44×44px
- Support keyboard navigation
- Display visible focus indicators
- Never rely solely on color

---

# Responsive Behaviour

Desktop

Standard button sizing.

Tablet

Reduce horizontal spacing when required.

Mobile

Buttons should expand to available width for primary actions.

---

# Angular Implementation Notes

Create reusable button components.

Suggested structure:

Primary Button

Secondary Button

Outline Button

Danger Button

Icon Button

Avoid inline styling.

---

# Flutter Implementation Notes

Use centralized reusable widgets.

Suggested structure:

AppPrimaryButton

AppSecondaryButton

AppDangerButton

AppOutlineButton

AppIconButton

Use ThemeData where possible.

---

# AI Generation Notes

When generating UI:

- Use only documented button components.
- Reference Component IDs.
- Follow approved spacing and typography.
- Never invent new button variants.

---

# Governance

New button variants require:

1. Design review
2. Component registration
3. Documentation update
4. Approval
5. Implementation

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