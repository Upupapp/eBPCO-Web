# Avatars

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Data Display

---

# Purpose

Avatars visually represent a person, organization, or entity throughout the eBPCO ecosystem.

They help users quickly identify individuals, departments, or businesses while improving recognition and navigation.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Avatars should:

- Improve user recognition.
- Reinforce identity across the application.
- Support accessibility.
- Adapt responsively.
- Consume approved Design Tokens.

---

# Usage

Use Avatars to represent:

- Business Owners
- Applicants
- Government Employees
- Inspectors
- Administrators
- Business Representatives
- Departments (optional)
- Organizations (optional)

Avoid using Avatars purely for decoration.

---

# Anatomy

A standard Avatar consists of:

- Avatar Container
- Image, Initials, or Icon
- Optional Status Indicator
- Optional Border

Example:

[👤]

[JT]

[🏢]

---

# Variants

## Image Avatar

Displays a user's uploaded profile photo.

Recommended whenever a verified image is available.

---

## Initial Avatar

Displays the user's initials when no profile photo exists.

Examples:

JT

MC

AR

Initials should be generated consistently.

---

## Icon Avatar

Displays a generic icon.

Recommended for:

- Unknown users
- Guest accounts
- Organizations
- Departments

---

## Business Avatar

Represents a registered business.

May display:

- Business Logo
- Default Business Icon

Business logos should never distort the layout.

---

## Group Avatar

Represents multiple users.

Recommended for:

- Assigned Inspectors
- Teams
- Departments

---

# Sizes

The Design System shall define standard Avatar sizes.

Recommended categories:

- Extra Small
- Small
- Medium (Default)
- Large
- Extra Large

Avoid arbitrary sizes.

---

# States

Avatars shall support:

- Default
- Loading
- Disabled
- Selected (when interactive)

---

# Status Indicators

Avatars may include a small status indicator.

Examples:

Online

Offline

Busy

Available

Status indicators shall not obscure the avatar image.

---

# Image Guidelines

Profile images should:

- Be cropped consistently.
- Preserve aspect ratio.
- Avoid stretching.
- Display centered content.

Fallbacks should automatically appear when images fail to load.

---

# Initial Generation

Initial Avatars should:

Use the first letter of the first and last name when available.

Examples:

Juan Dela Cruz

JD

Maria Santos

MS

Single-word names should display one initial.

---

# Accessibility

Avatars shall:

- Meet WCAG 2.1 AA.
- Provide descriptive alternative text.
- Support screen readers.
- Preserve sufficient contrast.
- Display focus indicators when interactive.

Example alt text:

Profile photo of Juan Dela Cruz

---

# Responsive Behavior

Desktop

- Maintain consistent sizing.
- Support hover interactions when clickable.

Tablet

- Preserve spacing.

Mobile

- Maintain touch-friendly sizes.
- Avoid overcrowding.

---

# Design Tokens

Avatars consume:

- Color Tokens
- Typography Tokens
- Radius Tokens
- Spacing Tokens
- Border Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Avatars should:

- Reuse shared Avatar components.
- Consume centralized SCSS tokens.
- Support image, initials, and icon variants.
- Automatically display fallbacks.

Recommended location:

shared/components/avatar/

---

# Flutter Implementation

Flutter Avatars should:

- Reuse shared Avatar widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Automatically display image fallbacks.

Recommended location:

shared/widgets/avatars/

---

# Do

✔ Display user images when available.

✔ Use initials as fallbacks.

✔ Maintain consistent sizing.

✔ Support accessibility.

✔ Reuse shared Avatar components.

---

# Don't

✘ Stretch images.

✘ Display low-quality images.

✘ Hardcode avatar sizes.

✘ Create undocumented Avatar variants.

✘ Use Avatars as decorative graphics.

---

# eBPCO Examples

User Profile

- Employee Photo

Business Owner

- Applicant Photo

Inspection

- Assigned Inspector

Administration

- User Accounts

Audit Logs

- User Identity

Comments

- Comment Author

Notifications

- Sender Avatar

---

# AI Development Guidelines

AI-generated Avatars must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Implement image fallbacks consistently.
- Avoid undocumented variants.

---

# Governance

All Avatar implementations within the eBPCO ecosystem shall comply with this specification.

New Avatar variants require UI/UX approval and documentation before implementation.

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