# Icons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Data Display

---

# Purpose

Icons are visual symbols that communicate actions, objects, navigation, or statuses with minimal text.

Icons should improve usability, recognition, and navigation while remaining consistent throughout the Electronic Business Permit and Clearance Office (eBPCO) ecosystem.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Icons should:

- Improve recognition.
- Reduce cognitive load.
- Support quick navigation.
- Reinforce visual hierarchy.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Icons should be used to:

- Represent common actions.
- Enhance navigation.
- Support labels.
- Improve recognition of system functions.

Common eBPCO examples include:

- Dashboard
- Business Registry
- Applications
- Payments
- Reports
- Users
- Notifications
- Settings

Icons should support text rather than replace it where clarity is important.

---

# Anatomy

An Icon consists of:

- Icon Graphic
- Container (optional)
- Label (optional)

Examples:

📄 Document

🏢 Business

👤 User

⚙ Settings

🔍 Search

---

# Icon Categories

## Navigation Icons

Used for application navigation.

Examples:

- Dashboard
- Home
- Back
- Forward
- Menu
- Settings

---

## Action Icons

Represent user actions.

Examples:

- Add
- Edit
- Delete
- Save
- Search
- Download
- Upload
- Refresh
- Filter
- Print
- Share

---

## Status Icons

Communicate application status.

Examples:

- Success
- Warning
- Error
- Information
- Pending
- Approved
- Rejected

Status Icons should complement semantic colors.

---

## File Icons

Represent document types.

Examples:

- PDF
- Image
- Spreadsheet
- Word Document
- Archive

---

## Business Icons

Represent business-related entities.

Examples:

- Business
- Store
- Building
- Permit
- Certificate
- Payment
- Inspection

---

## User Icons

Represent users and organizational functions.

Examples:

- User
- Administrator
- Inspector
- Team
- Organization

---

# Variants

## Standard Icon

Displays an icon without interaction.

---

## Icon Button

An interactive icon used to perform an action.

Examples:

✏ Edit

🗑 Delete

🔍 Search

Icon Buttons shall provide hover, focus, and pressed states.

---

## Icon with Label

Displays an icon alongside descriptive text.

Recommended for navigation and actions.

Example:

📄 View Permit

---

## Decorative Icon

Supports visual presentation only.

Decorative Icons should not convey essential information.

---

# States

Interactive Icons shall support:

- Default
- Hover (Web)
- Focus
- Pressed
- Disabled
- Selected (when applicable)

State transitions shall follow Motion guidelines.

---

# Sizing

The Design System shall define standard icon sizes.

Recommended categories:

- Extra Small
- Small
- Medium (Default)
- Large
- Extra Large

Avoid arbitrary sizing.

---

# Color Usage

Icons shall consume semantic Color Tokens.

Examples:

Primary

Secondary

Success

Warning

Error

Information

Neutral

Hardcoded colors are prohibited.

---

# Accessibility

Icons shall:

- Meet WCAG 2.1 AA.
- Maintain sufficient contrast.
- Include accessible labels when interactive.
- Support keyboard navigation when clickable.
- Provide semantic meaning.

Icons conveying important information should not rely solely on shape or color.

---

# Responsive Behavior

Desktop

- Maintain consistent sizing.
- Support hover interactions.

Tablet

- Preserve spacing.

Mobile

- Increase touch target sizes.
- Avoid overcrowding.
- Support one-handed interaction.

---

# Design Tokens

Icons consume:

- Color Tokens
- Spacing Tokens
- Motion Tokens
- Size Tokens

Hardcoded styling is prohibited.

---

# Icon Library

To ensure consistency across platforms, the following icon libraries shall be used:

Angular Web Administration Portal

- Material Symbols (preferred)
- Material Icons

Flutter Mobile Application

- Material Icons (default)
- Cupertino Icons (for platform-specific iOS interactions when appropriate)

Custom icons should only be introduced when an equivalent does not exist in the approved libraries.

---

# Naming Guidelines

Icons should use descriptive, consistent names.

Examples:

business

payment

inspection

notification

download

upload

Avoid ambiguous or project-specific names.

---

# Angular Implementation

Angular Icons should:

- Reuse shared Icon components where appropriate.
- Consume centralized SCSS tokens.
- Use approved Material icon libraries.
- Support accessible labels for interactive icons.

Recommended location:

shared/components/icon/

---

# Flutter Implementation

Flutter Icons should:

- Reuse shared Icon widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect icon sizing tokens.
- Use Material Icons by default.

Recommended location:

shared/widgets/icons/

---

# Do

✔ Use approved icon libraries.

✔ Pair icons with labels when clarity is needed.

✔ Maintain consistent sizing.

✔ Use semantic colors.

✔ Reuse shared icon components.

---

# Don't

✘ Invent custom icons without approval.

✘ Use icons as the sole method of communication.

✘ Hardcode icon sizes or colors.

✘ Mix multiple icon libraries within the same screen.

✘ Overuse decorative icons.

---

# eBPCO Examples

Navigation

- Dashboard
- Businesses
- Applications
- Payments
- Reports

Business Registry

- View
- Edit
- Delete
- Search

Payments

- Download Receipt
- Print Receipt

Administration

- Users
- Roles
- Settings

Notifications

- Alert
- Announcement
- Reminder

---

# AI Development Guidelines

AI-generated interfaces must:

- Use approved icon libraries.
- Consume Design Tokens.
- Preserve accessibility.
- Pair icons with text where appropriate.
- Avoid introducing undocumented icons.

---

# Governance

All Icon implementations within the eBPCO ecosystem shall comply with this specification.

New icon sets or custom icons require UI/UX approval before implementation.

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