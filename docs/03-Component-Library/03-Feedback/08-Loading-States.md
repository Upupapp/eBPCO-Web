# Loading States

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Loading States communicate that content or functionality is being prepared before it becomes available to the user.

Rather than displaying blank pages or causing uncertainty, Loading States reassure users that the application is actively processing their request.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Loading States should:

- Reduce perceived waiting time.
- Prevent user confusion.
- Improve application responsiveness.
- Maintain layout stability.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Loading States should appear whenever:

- Pages are initializing.
- Dashboard data is loading.
- Business records are being retrieved.
- Applications are loading.
- Notifications are synchronizing.
- Payments are loading.
- User profiles are initializing.
- Reports are generating.

Loading States should never leave users looking at blank screens.

---

# Loading Hierarchy

The appropriate loading experience depends on the scope of the operation.

| Scope | Recommended Loading Pattern |
|--------|-----------------------------|
| Entire Application | Splash Screen |
| Entire Page | Skeleton Loader |
| Section | Section Skeleton |
| Card | Card Skeleton |
| Table | Table Skeleton |
| List | List Skeleton |
| Button | Button Progress |
| File Upload | Linear Progress Indicator |

---

# Variants

## Splash Loading

Displayed during application startup.

Examples:

- Launching application.
- Restoring user session.

---

## Page Loading

Displayed while an entire page is loading.

Recommended:

Skeleton placeholders matching the final layout.

Avoid full-page spinners whenever possible.

---

## Section Loading

Displayed while a portion of the page is loading.

Examples:

Dashboard Cards

Notifications

Business Summary

Recent Applications

---

## Table Loading

Displays placeholder rows while retrieving data.

Recommended for:

- Businesses
- Payments
- Applications
- Reports

---

## List Loading

Displays placeholder list items.

Examples:

Notifications

Documents

Business Records

Messages

---

## Card Loading

Displays placeholder cards while dashboard information is loading.

Examples:

Statistics

Recent Activity

Business Overview

Payment Summary

---

## Button Loading

Displayed after the user presses a button.

Example:

[Submitting...]

Buttons should become temporarily disabled until the operation completes.

---

# Behavior

Loading States should:

- Appear immediately.
- Match the final layout.
- Prevent layout shifts.
- Transition smoothly to loaded content.
- Automatically disappear after completion.

If loading exceeds expected durations, provide additional context.

Example:

Still loading...
This may take a few more moments.

---

# Skeleton Loading

Skeletons are the preferred loading method for most content.

Recommended:

✓ Tables

✓ Cards

✓ Lists

✓ Dashboard Widgets

✓ Business Records

Skeletons should closely resemble the final layout.

---

# Spinner Usage

Spinners should only be used for:

- Very short operations
- Unknown durations
- Inline actions

Avoid using full-screen spinners for page loading.

---

# Accessibility

Loading States shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Announce loading status.
- Avoid excessive animations.
- Maintain sufficient contrast.

Loading animations should respect reduced motion preferences when supported.

---

# Responsive Behavior

Desktop

- Preserve layout dimensions.
- Maintain consistent spacing.

Tablet

- Adapt skeleton sizes proportionally.

Mobile

- Display simplified skeleton layouts.
- Prevent excessive scrolling.
- Preserve touch targets.

---

# Motion

Loading animations should:

- Be subtle.
- Avoid flashing.
- Maintain consistent timing.
- Transition smoothly into loaded content.

---

# Design Tokens

Loading States consume:

- Color Tokens
- Motion Tokens
- Spacing Tokens
- Typography Tokens
- Radius Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Loading States should:

- Reuse shared Loading components.
- Consume centralized SCSS tokens.
- Support configurable skeleton layouts.
- Integrate with shared loading services.

Recommended location:

shared/components/loading/

---

# Flutter Implementation

Flutter Loading States should:

- Reuse shared Loading widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support reusable skeleton components.

Recommended location:

shared/widgets/loading/

---

# Related Components

- Progress Indicators – individual loading indicators.
- Empty States – when loading completes with no content.
- Error States – when loading fails.
- Alerts – communicate loading-related issues if necessary.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Prevents layout shifting
- [ ] Uses Skeleton Loaders where appropriate
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Match skeletons to the final layout.

✔ Display loading immediately.

✔ Use button loading for form submissions.

✔ Preserve page structure.

✔ Reuse shared Loading components.

---

# Don't

✘ Display blank pages.

✘ Use full-page spinners unnecessarily.

✘ Shift layouts after loading.

✘ Use inconsistent loading animations.

✘ Create undocumented loading styles.

---

# eBPCO Examples

Authentication

- Restoring session
- Logging in

Dashboard

- Statistics loading
- Recent activity loading
- Notification loading

Business Registration

- Loading business information

Permit Applications

- Loading applications

Payments

- Loading payment history

Reports

- Generating reports

Profile

- Loading user profile

---

# AI Development Guidelines

AI-generated Loading States must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Prefer Skeleton Loaders over blank pages.
- Avoid undocumented loading patterns.

---

# Governance

All Loading State implementations within the eBPCO ecosystem shall comply with this specification.

New Loading State variants require UI/UX approval before implementation.

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