# Buttons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Selection & Actions

---

# Purpose

Buttons are the primary mechanism for initiating user actions throughout the eBPCO ecosystem.

They allow users to submit forms, navigate workflows, confirm decisions, perform administrative operations, and trigger contextual commands.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Buttons should:

- Clearly communicate their purpose.
- Establish a consistent visual hierarchy.
- Provide immediate interaction feedback.
- Support accessibility.
- Consume approved Design Tokens.
- Be reusable shared components.

---

# Usage

Use Buttons whenever the user needs to intentionally trigger an action.

Recommended examples:

- Submit Application
- Save Changes
- Continue
- Upload Documents
- Download Receipt
- Approve Permit
- Reject Application
- View Details

Buttons should never be used as navigation links unless they represent a call-to-action.

---

# Anatomy

A Button consists of:

- Container
- Label
- Optional Leading Icon
- Optional Trailing Icon
- Focus State
- Hover State (Web)
- Pressed State
- Disabled State
- Loading State

Example

+-------------------------+
|  💾 Save Changes        |
+-------------------------+

---

# Button Hierarchy

The eBPCO Design System defines four button priorities.

---

## Primary Button

Represents the most important action on a screen.

Examples:

- Submit Application
- Save Changes
- Continue
- Approve Permit

Rules

- One primary button per action group.
- Filled background.
- Highest visual emphasis.

---

## Secondary Button

Supports the primary action.

Examples

- Save Draft
- Preview
- Download
- Back

Rules

- Outlined or tonal appearance.
- Lower emphasis than Primary.

---

## Tertiary Button

Low-emphasis action.

Examples

- Cancel
- Reset
- Learn More

Rules

- Text button.
- No filled background.

---

## Destructive Button

Irreversible action.

Examples

- Delete Business
- Reject Permit
- Remove User
- Cancel Application

Rules

- Use semantic error/destructive colors.
- Require confirmation when irreversible.
- Never appear as the default highlighted action.

---

# Variants

## Filled Button

Highest emphasis.

Recommended for:

- Primary actions

---

## Outlined Button

Medium emphasis.

Recommended for:

- Secondary actions

---

## Text Button

Lowest emphasis.

Recommended for:

- Tertiary actions
- Inline actions

---

## Icon Button

Contains only an icon.

Examples

- Search
- Notifications
- More Actions
- Refresh

Every icon-only button must include an accessible label.

---

## Loading Button

Displays progress while processing.

Example

Submitting...

The button should remain disabled until the operation completes.

---

# States

Every Button supports:

## Default

Available for interaction.

---

## Hover (Web)

Displayed when the cursor is over the button.

Should provide subtle visual feedback.

---

## Focus

Displayed during keyboard navigation.

Must remain clearly visible.

---

## Pressed

Displayed while the user activates the button.

Should provide tactile visual feedback.

---

## Disabled

Unavailable for interaction.

Disabled buttons should:

- Preserve readable labels.
- Clearly indicate they are unavailable.
- Avoid relying solely on opacity.

---

## Loading

Displayed while processing.

Behavior

- Disable repeated activation.
- Preserve width where practical.
- Show loading indicator.
- Maintain accessible status updates.

---

# Labels

Button labels should:

- Start with a verb.
- Describe the resulting action.
- Use sentence case.
- Be concise.

Preferred

- Save Changes
- Submit Application
- Download Receipt
- Upload Document
- Approve Permit

Avoid

- OK
- Yes
- Click Here
- Do It
- Proceed

---

# Icons

Icons may be:

Leading

💾 Save

Trailing

Continue →

Icons should reinforce the action rather than replace the text.

Avoid icon-only buttons unless the icon is universally recognized or accompanied by an accessible label.

---

# Button Placement

Desktop

Recommended order

[Secondary] [Primary]

Example

Cancel    Save Changes

---

Mobile

Preferred layout

Primary button

Secondary button

or

Full-width primary button

Actions should remain reachable with one-handed interaction where practical.

---

# Sizing

Recommended sizes

Small

Used in dense interfaces.

Medium

Default size.

Large

Used for prominent calls-to-action.

Touch targets

Angular Web

Minimum:

40 × 40 px

Flutter

Minimum:

48 × 48 logical pixels

---

# Width

Desktop

Prefer content width.

Mobile

Primary actions may span the full available width.

Avoid inconsistent button sizing within the same action group.

---

# Loading Behavior

While processing

- Disable repeated presses.
- Preserve layout.
- Display progress indicator.
- Prevent duplicate submissions.
- Keep users informed.

Example

Submitting...

---

# Accessibility

Buttons shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Maintain visible focus indicators.
- Meet minimum touch target requirements.
- Include accessible names.
- Never depend solely on color.

Icon-only buttons require descriptive accessibility labels.

---

# Responsive Behavior

Desktop

- Horizontal action groups.
- Hover states.
- Keyboard support.

Tablet

- Increase spacing.
- Reduce action density where necessary.

Mobile

- Full-width primary actions where appropriate.
- Larger touch targets.
- Respect safe areas.

---

# Design Tokens

Buttons consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Elevation Tokens
- Motion Tokens
- State Tokens
- Size Tokens

Hardcoded visual values are prohibited.

---

# Angular Implementation

Buttons should:

- Reuse shared Button components.
- Consume centralized SCSS Design Tokens.
- Support variants through inputs.
- Support loading states.
- Support icons.
- Support disabled states.

Recommended location

src/app/shared/components/buttons/

Example

PrimaryButtonComponent

SecondaryButtonComponent

IconButtonComponent

---

# Flutter Implementation

Flutter Buttons should:

- Reuse shared widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Respect Material state behavior.
- Support loading indicators.
- Support icons.

Recommended location

lib/shared/widgets/buttons/

Example

EbpcPrimaryButton

EbpcSecondaryButton

EbpcIconButton

---

# Related Components

- Button Groups
- Dialogs
- Menus
- Forms
- Stepper
- Floating Action Button

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Uses shared reusable component
- [ ] Supports loading state
- [ ] Supports disabled state
- [ ] Supports keyboard navigation
- [ ] Meets WCAG 2.1 AA
- [ ] Responsive across breakpoints
- [ ] Uses proper button hierarchy
- [ ] Uses clear action labels
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use one primary button per action group.

✔ Use verbs for labels.

✔ Keep hierarchy consistent.

✔ Disable repeated submissions.

✔ Confirm destructive actions.

✔ Reuse shared components.

---

# Don't

✘ Use multiple primary buttons together.

✘ Use vague labels.

✘ Use icon-only buttons without accessible labels.

✘ Hide important actions.

✘ Hardcode colors or spacing.

✘ Create undocumented variants.

---

# eBPCO Examples

## Permit Application

Primary

Submit Application

Secondary

Save Draft

Cancel

---

## Business Registration

Continue

Back

---

## User Management

Save Changes

Reset Password

Delete User

---

## Payments

Pay Onsite

Upload Receipt

Download Receipt

---

# AI Development Guidelines

AI-generated Buttons must:

- Reuse approved shared components.
- Consume Design Tokens.
- Preserve accessibility.
- Use documented button hierarchy.
- Support loading and disabled states.
- Prevent duplicate submissions.
- Avoid undocumented styling.
- Keep Angular and Flutter implementations behaviorally consistent.

---

# Governance

All Button implementations within the eBPCO ecosystem shall comply with this specification.

Changes to button hierarchy, variants, states, sizing, or interaction behavior require UI/UX approval before implementation.

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