# Buttons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Buttons allow users to perform actions within the eBPCO ecosystem.

They communicate intent, initiate workflows, submit forms, navigate between screens, and trigger system operations.

Buttons must remain visually consistent, accessible, and reusable across the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Buttons should:

- Clearly communicate available actions.
- Provide immediate visual feedback.
- Follow a consistent hierarchy.
- Support accessibility.
- Adapt across desktop and mobile devices.
- Consume approved Design Tokens.

---

# Usage

Use buttons to:

- Submit forms.
- Save information.
- Navigate workflows.
- Confirm actions.
- Cancel actions.
- Delete records.
- Launch dialogs.
- Download documents.
- Start approval processes.

Buttons should never be used for static information.

---

# Button Hierarchy

The eBPCO Design System defines the following button types.

## Primary Button

Used for the most important action on a screen.

Examples:

- Submit Application
- Save
- Continue
- Approve

Each view should generally contain only one primary action.

---

## Secondary Button

Used for supporting actions.

Examples:

- Cancel
- Back
- Edit
- View Details

Secondary buttons should never compete visually with the primary button.

---

## Tertiary Button

Used for low-emphasis actions.

Examples:

- Learn More
- View History
- Show Details

Often displayed as text buttons.

---

## Destructive Button

Used for irreversible actions.

Examples:

- Delete
- Remove
- Reject
- Archive

Destructive buttons should clearly communicate risk.

---

## Icon Button

Used when space is limited or the action is universally recognized.

Examples:

- Search
- Notifications
- Settings
- Refresh
- Download

Icon-only buttons must provide accessible labels.

---

## Loading Button

Displayed while processing an action.

Examples:

- Submitting Permit
- Saving Changes
- Processing Payment

The loading state prevents duplicate submissions.

---

# Anatomy

A standard button may contain:

- Container
- Label
- Optional Leading Icon
- Optional Trailing Icon
- Loading Indicator (when applicable)

Icons should enhance clarity rather than replace text unless the action is universally understood.

---

# Sizes

Approved sizes include:

- Small
- Medium
- Large

Size selection should depend on the context and platform.

Touch targets must remain accessible on mobile devices.

---

# States

Buttons shall support the following states:

- Default
- Hover (Web)
- Focus
- Pressed
- Active
- Disabled
- Loading
- Success (optional)
- Error (optional)

State transitions should follow the Motion guidelines.

---

# Behavior

Buttons should:

- Provide immediate visual feedback.
- Prevent duplicate actions.
- Clearly indicate loading.
- Disable while processing where appropriate.
- Display success or error feedback after completion.

---

# Placement

Primary actions should appear consistently throughout the application.

Examples:

Desktop:

- Bottom-right of forms
- Top-right of toolbars
- Dialog footer

Mobile:

- Bottom action area
- Sticky action button where appropriate

Button placement should remain predictable.

---

# Labels

Button labels should:

- Use verbs.
- Be concise.
- Describe the action.

Preferred:

- Save
- Continue
- Submit Application
- Download Permit

Avoid:

- OK
- Click Here
- Yes
- Button

---

# Icons

Icons may be used to improve recognition.

Examples:

- Save
- Download
- Upload
- Search
- Print
- Edit

Icons should not replace meaningful text unless the action is universally recognized.

---

# Accessibility

Buttons shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Display visible focus indicators.
- Provide accessible names.
- Support screen readers.
- Maintain sufficient touch target sizes.

Color alone must never communicate button purpose.

---

# Responsive Behavior

Desktop:

- Support hover interactions.
- Display full labels.

Tablet:

- Maintain spacing.
- Preserve hierarchy.

Mobile:

- Prioritize touch accessibility.
- Allow full-width buttons when appropriate.
- Avoid overcrowding actions.

---

# Design Tokens

Buttons consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Angular buttons should:

- Be implemented as reusable shared components.
- Consume centralized SCSS variables.
- Support disabled and loading states.
- Reuse theme styles.
- Avoid inline styling.

Recommended location:

```
shared/components/button/
```

---

# Flutter Implementation

Flutter buttons should:

- Use ThemeData.
- Reuse shared button widgets.
- Consume AppColors.
- Consume AppTypography.
- Support loading states.
- Respect Material accessibility.

Recommended location:

```
shared/widgets/buttons/
```

---

# Do

✔ Use one primary button per screen.

✔ Use descriptive labels.

✔ Display loading indicators.

✔ Disable duplicate submissions.

✔ Keep placement consistent.

✔ Reuse shared components.

---

# Don't

✘ Use multiple primary buttons together.

✘ Replace labels with unclear icons.

✘ Hardcode colors.

✘ Remove focus indicators.

✘ Create custom button styles outside the Design System.

---

# eBPCO Examples

Primary:

- Submit Application
- Save Business Information
- Approve Permit

Secondary:

- Cancel
- Back
- View Details

Destructive:

- Delete Business
- Reject Application

Icon:

- Search
- Refresh
- Download

---

# AI Development Guidelines

AI-generated button components must:

- Reuse documented button variants.
- Consume Design Tokens.
- Preserve accessibility.
- Respect responsive behavior.
- Avoid introducing undocumented button styles.

---

# Governance

All button implementations within the eBPCO ecosystem shall comply with this specification.

New button variants require approval from the UI/UX Team and documentation before implementation.

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