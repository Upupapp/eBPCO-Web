# Selection and Actions

Version: 1.0.0  
Status: Approved  
Document Owner: UI/UX Team

Category: Component Library

---

# Purpose

Selection and Action components allow users to choose options, confirm preferences, trigger commands, and perform operations throughout the eBPCO system.

These components are fundamental to forms, workflows, data management, navigation, and administrative operations.

This specification applies to:

- Angular Web Administration Portal
- Flutter Mobile Application

---

# Objectives

Selection and Action components should:

- Make available actions easy to understand.
- Distinguish primary, secondary, and destructive actions.
- Support efficient and accurate user decisions.
- Maintain consistent behavior across platforms.
- Meet accessibility requirements.
- Consume approved Design Tokens.
- Reuse shared components instead of creating one-off implementations.

---

# Scope

This category includes:

1. Buttons
2. Button Groups
3. Checkboxes
4. Radio Buttons
5. Switches
6. Segmented Controls
7. Floating Action Buttons
8. Contextual Actions
9. Speed Dials

---

# Component Structure

```text
05-Selection-Actions/
├── README.md
├── 01-Buttons.md
├── 02-Button-Groups.md
├── 03-Checkboxes.md
├── 04-Radio-Buttons.md
├── 05-Switches.md
├── 06-Segmented-Controls.md
├── 07-Floating-Action-Buttons.md
├── 08-Contextual-Actions.md
└── 09-Speed-Dials.md
```

---

# Selection Principles

Selection controls should help users understand:

- What options are available.
- Whether one or multiple options may be selected.
- Whether a choice takes effect immediately.
- Whether the choice can be reversed.
- Whether the selection is required.

Selection controls must not rely on visual appearance alone to communicate their state.

---

# Action Principles

Actions should be:

- Clearly labeled.
- Visually prioritized.
- Positioned consistently.
- Easy to activate.
- Reversible where practical.
- Confirmed when destructive or irreversible.

Every action should communicate its purpose before the user activates it.

---

# Action Hierarchy

The eBPCO interface uses the following action hierarchy:

## Primary Action

The most important action on the current screen or section.

Examples:

- Submit Application
- Save Changes
- Continue
- Approve Permit

Only one primary action should normally appear within a single action group.

---

## Secondary Action

An alternative or supporting action.

Examples:

- Save Draft
- Back
- Preview
- Download

Secondary actions should be visually less prominent than the primary action.

---

## Tertiary Action

A low-emphasis action that supports the current task.

Examples:

- Cancel
- Learn More
- Clear
- Reset

Tertiary actions may use text-only or subtle button styles.

---

## Destructive Action

An action that removes, cancels, rejects, or permanently changes data.

Examples:

- Delete
- Reject
- Cancel Application
- Remove User

Destructive actions must:

- Be visually distinguished.
- Use explicit labels.
- Require confirmation when irreversible.
- Never be positioned as the default action.

---

# Selection Models

## Single Selection

Use when users may choose only one option.

Recommended components:

- Radio Buttons
- Segmented Controls
- Dropdowns

Example:

Payment Method

- Bank Transfer
- Onsite Payment

---

## Multiple Selection

Use when users may choose more than one option.

Recommended component:

- Checkboxes

Example:

Required Business Activities

- Retail
- Food Service
- Manufacturing

---

## Binary Selection

Use when a setting has two opposing states.

Recommended component:

- Switch

Example:

Notifications

On / Off

---

# Immediate and Deferred Actions

## Immediate Action

The change takes effect as soon as the user interacts with the component.

Recommended for:

- Switches
- Display preferences
- Simple filters

The interface should provide immediate feedback.

---

## Deferred Action

The change is applied only after the user confirms or submits.

Recommended for:

- Forms
- Permit applications
- Account updates
- Administrative changes

Deferred actions should include a clear Save, Apply, Continue, or Submit control.

---

# Labels

Labels should:

- Use clear action-oriented language.
- Describe the result of the action.
- Avoid vague wording.
- Remain concise.
- Use consistent terminology throughout the application.

Preferred labels:

- Save Changes
- Submit Application
- Download Receipt
- Approve Permit
- Reject Application

Avoid:

- OK
- Yes
- Do It
- Proceed
- Click Here

Context-specific labels are more informative than generic labels.

---

# Button Placement

## Desktop

Recommended order:

```text
[Secondary Action] [Primary Action]
```

Example:

```text
[Cancel] [Save Changes]
```

For destructive confirmation dialogs:

```text
[Keep Record] [Delete Record]
```

---

## Mobile

Primary actions may be:

- Full width
- Fixed near the bottom
- Positioned after the content
- Displayed in a Floating Action Button where appropriate

Actions must not conflict with:

- Bottom Navigation
- Safe areas
- System gestures
- On-screen keyboards

---

# Loading Behavior

When an action is being processed:

- Disable repeated activation.
- Display a loading indicator.
- Preserve the action label where space allows.
- Prevent duplicate submissions.
- Provide success or error feedback.

Example:

```text
[Submitting…]
```

Do not leave users uncertain about whether an action was triggered.

---

# Disabled States

Disabled controls should:

- Remain readable.
- Clearly appear unavailable.
- Preserve their label.
- Avoid relying on reduced opacity alone.
- Provide guidance when the reason is not obvious.

When practical, explain why the action is unavailable.

Example:

```text
Submit Application
Complete all required fields before submission.
```

---

# Touch Targets

Interactive controls should provide sufficiently large activation areas.

Recommended minimum:

- Angular Web: 40 × 40 px
- Flutter Mobile: 48 × 48 logical pixels

Visual elements may appear smaller, but their interactive area should meet the minimum target size.

---

# Keyboard Interaction

Interactive components should support:

- Tab navigation
- Enter activation
- Space activation where appropriate
- Arrow-key selection for grouped controls
- Visible focus states
- Escape dismissal for temporary action surfaces

Keyboard behavior must follow the expected semantic behavior of each component.

---

# Accessibility

Selection and Action components shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Support screen readers.
- Include visible focus indicators.
- Maintain sufficient color contrast.
- Use semantic controls.
- Communicate selected, disabled, loading, and error states.
- Avoid using color as the only state indicator.

Labels must be programmatically associated with their controls.

---

# Responsive Behavior

## Desktop

- Actions may appear inline.
- Button groups may use horizontal layouts.
- Contextual actions may appear in menus.
- Hover and focus states should be supported.

## Tablet

- Maintain adequate spacing.
- Reduce action density when necessary.
- Use overflow menus for secondary actions.

## Mobile

- Prefer clear vertical action layouts.
- Use full-width primary actions where appropriate.
- Avoid placing many actions in one row.
- Use bottom sheets for larger action collections.
- Respect safe areas and Bottom Navigation.

---

# Design Tokens

Selection and Action components consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Elevation Tokens
- Motion Tokens
- State Tokens
- Size Tokens

Hardcoded visual values are prohibited unless formally approved and documented.

---

# Angular Implementation

Angular implementations should:

- Use reusable shared components.
- Integrate with Angular Forms where applicable.
- Consume centralized SCSS Design Tokens.
- Support loading, disabled, focus, and validation states.
- Use semantic HTML elements.
- Avoid duplicated button and selection-control styling.

Recommended location:

```text
src/app/shared/components/selection-actions/
```

Suggested structure:

```text
selection-actions/
├── button/
├── button-group/
├── checkbox/
├── radio-button/
├── switch/
├── segmented-control/
├── contextual-action/
└── index.ts
```

---

# Flutter Implementation

Flutter implementations should:

- Reuse shared widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support Material state behavior.
- Preserve accessibility semantics.
- Respect safe areas and touch targets.

Recommended location:

```text
lib/shared/widgets/selection_actions/
```

Suggested structure:

```text
selection_actions/
├── app_button.dart
├── app_button_group.dart
├── app_checkbox.dart
├── app_radio.dart
├── app_switch.dart
├── segmented_control.dart
├── contextual_action.dart
└── selection_actions.dart
```

---

# Shared Naming

Component names should remain aligned across both platforms.

| Purpose | Angular | Flutter |
|---|---|---|
| Primary button | `EbpcPrimaryButtonComponent` | `EbpcPrimaryButton` |
| Secondary button | `EbpcSecondaryButtonComponent` | `EbpcSecondaryButton` |
| Checkbox | `EbpcCheckboxComponent` | `EbpcCheckbox` |
| Radio button | `EbpcRadioComponent` | `EbpcRadio` |
| Switch | `EbpcSwitchComponent` | `EbpcSwitch` |
| Segmented control | `EbpcSegmentedControlComponent` | `EbpcSegmentedControl` |

Equivalent naming helps developers understand the shared architecture across repositories.

---

# Related Categories

- Inputs
- Feedback
- Navigation
- Forms
- Overlays
- Accessibility

Selection and Action components frequently work together with form controls, dialogs, menus, and validation feedback.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Uses the documented action hierarchy
- [ ] Supports keyboard interaction
- [ ] Supports screen readers
- [ ] Provides visible focus states
- [ ] Meets minimum touch-target requirements
- [ ] Handles loading and disabled states
- [ ] Prevents duplicate submissions
- [ ] Confirms destructive actions
- [ ] Uses clear labels
- [ ] Reuses shared components
- [ ] Matches Brand Guidelines
- [ ] Matches the Design System

---

# Do

✔ Use one clear primary action per action group.

✔ Use explicit labels describing the result.

✔ Use Checkboxes for multiple selection.

✔ Use Radio Buttons for one choice among several options.

✔ Use Switches for immediate binary settings.

✔ Confirm irreversible destructive actions.

✔ Disable repeated activation while processing.

✔ Keep Angular and Flutter component naming aligned.

---

# Don't

✘ Use multiple competing primary buttons.

✘ Use Switches for actions requiring form submission.

✘ Use Checkboxes when only one option is allowed.

✘ Use vague labels such as “OK” or “Proceed.”

✘ Depend only on color to communicate selection.

✘ hide important actions inside overflow menus.

✘ Allow users to submit the same request repeatedly.

✘ Create undocumented action variants.

---

# eBPCO Examples

## Permit Application

Primary action:

- Submit Application

Secondary actions:

- Save Draft
- Preview

Tertiary action:

- Cancel

---

## Permit Review

Primary action:

- Approve Permit

Secondary action:

- Request Revision

Destructive action:

- Reject Application

---

## Payment Method

Single selection:

- Bank Transfer
- Onsite Payment

Use Radio Buttons or a Segmented Control depending on the available space and platform.

---

## Notification Preferences

Binary selections:

- Application Updates
- Payment Updates
- Permit Expiration Reminders

Use Switches because changes may take effect immediately.

---

## Business Classification

Multiple selections:

- Retail
- Wholesale
- Manufacturing
- Food Service

Use Checkboxes because multiple options may apply.

---

# AI Development Guidelines

AI-generated Selection and Action components must:

- Reuse approved shared components.
- Follow the documented action hierarchy.
- Consume Design Tokens.
- Preserve accessibility.
- Use explicit action labels.
- Prevent duplicate submissions.
- Confirm destructive actions.
- Use the correct component for each selection model.
- Keep Angular and Flutter behavior aligned.
- Avoid undocumented visual or behavioral variants.

AI tools must not generate isolated button styling inside feature modules when an approved shared component already exists.

---

# Governance

All Selection and Action implementations within the eBPCO ecosystem shall comply with this specification.

Changes to:

- Action hierarchy
- Component variants
- Interaction behavior
- Labels
- Selection models
- Loading behavior
- Destructive-action treatment

require UI/UX approval before implementation.

---

# Approval

Project:

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platforms:

- Angular Web Administration Portal
- Flutter Mobile Application

Status:

Approved

Version:

1.0.0