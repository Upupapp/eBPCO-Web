# Stepper

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Navigation

---

# Purpose

A Stepper guides users through a sequence of related steps required to complete a multi-stage process. It communicates progress, clarifies the current stage, and helps users understand what remains before completion.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Steppers should:

- Guide users through complex workflows.
- Reduce errors during multi-step processes.
- Display progress clearly.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use a Stepper whenever users must complete a process consisting of multiple dependent steps.

Recommended eBPCO workflows:

- Business Registration
- Permit Application
- Permit Renewal
- Business Amendment
- User Registration
- Account Verification

Do not use a Stepper for simple forms that can be completed on a single page.

---

# Anatomy

A Stepper consists of:

- Step Indicator
- Step Label
- Progress Connector
- Current Step Indicator
- Completed Step Indicator
- Content Area
- Navigation Controls

Example

Business Details

●────○────○────○

Business Details → Documents → Payment → Review

---

# Variants

## Horizontal Stepper

Displays steps horizontally.

Recommended for:

- Desktop
- Tablet
- Four to six steps

---

## Vertical Stepper

Displays steps vertically.

Recommended for:

- Mobile
- Long descriptions
- More than six steps

---

## Linear Stepper

Users complete steps sequentially.

Recommended for:

- Permit Applications
- Registrations
- Payment Processes

Users cannot skip required steps.

---

## Non-Linear Stepper

Users may revisit completed steps.

Recommended for:

- Draft editing
- Review workflows

Required steps must still be validated before submission.

---

# Behavior

Steppers should:

- Clearly identify the current step.
- Display completed steps.
- Prevent access to incomplete required steps in linear workflows.
- Preserve entered data when moving between steps.
- Allow users to return to previous completed steps.

Step transitions should be smooth and should not cause unnecessary page reloads.

---

# Step States

Each step may be in one of the following states:

## Pending

The step has not yet been started.

---

## Active

The user is currently completing the step.

---

## Completed

The step has been successfully finished.

Completed steps should display a checkmark indicator.

---

## Error

Validation has failed.

The affected step should display an error indicator and provide guidance for correction.

---

## Disabled

The step cannot yet be accessed because prerequisite steps are incomplete.

---

# Navigation Controls

Typical controls include:

- Back
- Next
- Save Draft
- Cancel
- Review
- Submit

Controls should remain consistent throughout the workflow.

---

# Validation

Before moving to the next step:

- Validate required fields.
- Display inline validation messages.
- Prevent progression when critical information is missing.
- Preserve entered values.

Validation should occur before advancing to the next step.

---

# Accessibility

Steppers shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Clearly announce the current step.
- Identify completed and incomplete steps.
- Maintain sufficient color contrast.
- Avoid relying solely on color to indicate progress.

---

# Responsive Behavior

## Desktop

- Prefer Horizontal Stepper.
- Display labels beneath or beside indicators.

## Tablet

- Horizontal Stepper when space allows.
- Vertical Stepper for longer workflows.

## Mobile

- Prefer Vertical Stepper.
- Ensure labels remain readable.
- Keep navigation controls fixed where appropriate.

---

# Design Tokens

Steppers consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Steppers should:

- Reuse shared Stepper components.
- Integrate with Angular Forms.
- Consume centralized SCSS tokens.
- Support configurable validation and navigation.

Recommended location:

shared/components/navigation/stepper/

---

# Flutter Implementation

Flutter Steppers should:

- Reuse shared Stepper widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Preserve form state across steps.

Recommended location:

shared/widgets/navigation/stepper/

---

# Related Components

- Tabs – for switching between related content.
- Progress Indicators – for long-running operations.
- Dialogs – for confirmation before submission.
- Breadcrumbs – for page hierarchy on desktop.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Preserves form state
- [ ] Validates before progression
- [ ] Clearly identifies step states
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Use Steppers for multi-step workflows.

✔ Keep step labels concise.

✔ Validate each step before continuing.

✔ Allow users to return to completed steps.

✔ Display completed and current progress clearly.

---

# Don't

✘ Use a Stepper for simple forms.

✘ Allow users to bypass required validation.

✘ Reset entered information between steps.

✘ Create inconsistent step labels.

✘ Introduce undocumented Stepper variants.

---

# eBPCO Examples

## Business Registration

1. Business Details
2. Owner Information
3. Required Documents
4. Review
5. Submit

---

## Permit Application

1. Business Selection
2. Permit Information
3. Document Upload
4. Payment
5. Review
6. Submit

---

## Permit Renewal

1. Existing Permit
2. Updated Information
3. Supporting Documents
4. Payment
5. Confirmation

---

# AI Development Guidelines

AI-generated Steppers must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Maintain consistent step ordering.
- Preserve entered data across steps.
- Avoid undocumented workflow variants.

---

# Governance

All Stepper implementations within the eBPCO ecosystem shall comply with this specification.

Changes to workflow structures, step labels, or Stepper variants require UI/UX approval before implementation.

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