# Progress Indicators

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Progress Indicators communicate that the system is processing an operation or loading information. They provide users with feedback that an action is in progress, reducing uncertainty and preventing duplicate interactions.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Progress Indicators should:

- Inform users that work is in progress.
- Reduce perceived waiting time.
- Prevent duplicate submissions.
- Improve user confidence.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Progress Indicators whenever the system requires noticeable processing time.

Common eBPCO examples include:

- Logging in
- Registering an account
- Loading dashboard data
- Uploading documents
- Submitting permit applications
- Processing payments
- Downloading permits
- Refreshing application status
- Synchronizing data

Never leave users wondering whether an action is still running.

---

# Anatomy

A Progress Indicator may include:

- Indicator
- Optional Label
- Optional Percentage
- Optional Description

Example

Loading...

⟳ Processing your application...

---

# Variants

## Circular Progress Indicator

Used when the duration is unknown.

Examples

- Login
- Loading dashboard
- Fetching notifications
- Retrieving business information

---

## Linear Progress Indicator

Used when progress can be estimated.

Examples

- Uploading documents
- Downloading permit
- Payment processing

---

## Step Progress Indicator

Displays progress through multiple stages.

Recommended for workflows.

Examples

Business Registration

Account
↓

Business Details
↓

Requirements
↓

Payment
↓

Review
↓

Submit

---

## Button Progress

Displayed inside a button while an action is processing.

Example

[Submitting...]

Users should not be able to press the button multiple times.

---

## Full Screen Loader

Used when an entire page or feature is unavailable until loading completes.

Examples

- Initial application launch
- Session restoration
- Dashboard initialization

---

## Skeleton Loader

Displays placeholders that mimic page content while data is loading.

Recommended for:

- Lists
- Cards
- Tables
- Dashboards
- Business records

Skeletons reduce perceived waiting time better than spinners.

---

# Behavior

Progress Indicators should:

- Appear immediately after an operation starts.
- Disappear automatically after completion.
- Transition smoothly.
- Prevent duplicate requests.
- Never freeze indefinitely.

If loading exceeds reasonable expectations, display additional context.

Example:

"This is taking longer than expected."

---

# Progress Messaging

When appropriate, provide descriptive messages.

Examples

Uploading Fire Safety Certificate...

Processing Payment...

Loading Businesses...

Synchronizing Notifications...

Avoid vague messages such as:

Loading...

when more context can be provided.

---

# Accessibility

Progress Indicators shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Announce progress updates.
- Maintain sufficient contrast.
- Avoid flashing animations.

If progress percentage is available, expose it to assistive technologies.

---

# Responsive Behavior

Desktop

- Inline indicators for local actions.
- Full-screen loaders only for page initialization.

Tablet

- Maintain proportional sizing.

Mobile

- Avoid blocking navigation unnecessarily.
- Keep indicators visible without obscuring important content.

---

# Design Tokens

Progress Indicators consume:

- Color Tokens
- Motion Tokens
- Spacing Tokens
- Typography Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Progress Indicators should:

- Reuse shared Progress components.
- Consume centralized SCSS tokens.
- Support all documented variants.
- Integrate with shared loading services.

Recommended location:

shared/components/progress/

---

# Flutter Implementation

Flutter Progress Indicators should:

- Reuse shared Progress widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support all documented variants.

Recommended location:

shared/widgets/progress/

---

# Related Components

- Loading States – complete loading experiences.
- Empty States – when loading finishes with no data.
- Error States – when loading fails.
- Dialogs – for blocking operations requiring confirmation.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Prevents duplicate actions
- [ ] Supports multiple variants
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Show progress immediately.

✔ Use Skeleton Loaders whenever possible.

✔ Disable repeated actions while processing.

✔ Provide descriptive loading messages.

✔ Remove indicators immediately after completion.

---

# Don't

✘ Leave users without feedback.

✘ Display infinite loading without explanation.

✘ Block unrelated interactions unnecessarily.

✘ Mix multiple loading indicators for the same operation.

✘ Create undocumented progress styles.

---

# eBPCO Examples

Authentication

- Logging in
- Restoring session

Business Registration

- Saving business information
- Uploading documents

Permit Applications

- Processing application
- Validating requirements

Payments

- Uploading payment receipt
- Verifying payment

Dashboard

- Loading statistics
- Loading notifications
- Loading recent applications

---

# AI Development Guidelines

AI-generated Progress Indicators must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Prefer Skeleton Loaders over indefinite spinners.
- Avoid undocumented variants.

---

# Governance

All Progress Indicator implementations within the eBPCO ecosystem shall comply with this specification.

New Progress Indicator variants require UI/UX approval before implementation.

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