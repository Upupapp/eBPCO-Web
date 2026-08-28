# 11 Layout Patterns

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Layout

---

# Purpose

Layout Patterns define standardized page structures used throughout the eBPCO ecosystem.

Instead of designing each screen independently, developers shall compose screens using approved layout patterns. This promotes consistency, improves maintainability, and accelerates frontend development across both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

The Layout Pattern system exists to:

- Standardize page composition.
- Improve navigation consistency.
- Increase UI predictability.
- Reduce duplicated layouts.
- Simplify AI-assisted development.
- Improve scalability.

---

# Source of Truth

The official Layout Patterns shall be derived from the approved Angular Web Administration Portal.

Flutter shall implement equivalent layouts while adapting them for mobile-first interaction.

---

# Design Principles

Every page should:

- Follow a consistent hierarchy.
- Maintain predictable spacing.
- Reuse existing components.
- Prioritize readability.
- Minimize cognitive load.
- Support responsive behavior.

---

# Standard Page Structure

Every screen should follow the general structure below.

```
App Navigation

↓

Page Header

↓

Page Actions

↓

Content Area

↓

Optional Sidebar

↓

Footer (if applicable)
```

---

# Dashboard Pattern

Purpose

Provides a high-level overview of system activity.

Structure

```
Page Header

↓

Summary Cards

↓

Charts

↓

Quick Actions

↓

Recent Activity

↓

Data Table
```

Typical Usage

- Administrator Dashboard
- Officer Dashboard
- Applicant Dashboard

---

# List Management Pattern

Purpose

Displays collections of records.

Structure

```
Header

↓

Filters

↓

Search

↓

Action Buttons

↓

Table or Card List

↓

Pagination
```

Typical Usage

- Business Records
- Permit Applications
- User Management
- Notifications

---

# Detail Page Pattern

Purpose

Displays detailed information about a single record.

Structure

```
Header

↓

Summary Information

↓

Tabs or Sections

↓

Supporting Information

↓

History

↓

Actions
```

Typical Usage

- Permit Details
- Applicant Details
- Business Details

---

# Form Pattern

Purpose

Supports creating or editing records.

Structure

```
Header

↓

Instructions

↓

Input Sections

↓

Validation Messages

↓

Action Buttons
```

Forms should:

- Group related fields.
- Display validation near inputs.
- Preserve user progress.

---

# Multi-Step Wizard Pattern

Purpose

Supports complex workflows.

Structure

```
Step Indicator

↓

Current Step

↓

Navigation Buttons

↓

Progress Indicator
```

Typical Usage

- Business Permit Application
- Renewal Process
- Business Registration

---

# Authentication Pattern

Structure

```
Application Logo

↓

Welcome Message

↓

Authentication Form

↓

Supporting Links

↓

Footer
```

Typical Usage

- Login
- Registration
- Forgot Password
- OTP Verification

---

# Profile Pattern

Structure

```
Profile Header

↓

Personal Information

↓

Account Settings

↓

Security

↓

Preferences
```

---

# Settings Pattern

Structure

```
Settings Navigation

↓

Content Area

↓

Configuration Sections

↓

Save Actions
```

---

# Approval Workflow Pattern

Purpose

Supports government review processes.

Structure

```
Application Summary

↓

Supporting Documents

↓

Review Notes

↓

Decision Actions

↓

Workflow History
```

Typical Usage

- Application Review
- Permit Approval
- Clearance Validation

---

# Search Results Pattern

Structure

```
Search Bar

↓

Filters

↓

Results Summary

↓

Results List

↓

Pagination
```

---

# Empty State Pattern

When no information exists, pages should display:

- Illustration or icon
- Clear explanation
- Recommended action
- Call-to-action button

Example

```
No Applications Found

Start your first application.
```

---

# Error State Pattern

Errors should include:

- Clear message
- Cause (when appropriate)
- Recovery action
- Support information

Avoid technical error codes unless required.

---

# Loading Pattern

Loading screens should use:

- Skeleton loaders
- Progress indicators
- Placeholder cards
- Placeholder tables

Avoid blank screens during loading.

---

# Responsive Behaviour

Desktop

- Multi-column layouts
- Sidebar navigation
- Expanded dashboards

Tablet

- Flexible columns
- Collapsible navigation

Mobile

- Single-column layouts
- Stacked components
- Bottom navigation where appropriate

Flutter shall prioritize mobile-first composition.

---

# Accessibility

Layout Patterns must:

- Preserve logical reading order.
- Support keyboard navigation.
- Maintain focus visibility.
- Avoid content overlap.
- Adapt to zoom and larger text sizes.

---

# Platform Implementation

## Angular

Pages should be assembled using:

- Shared layout components
- CSS Grid
- Flexbox
- Layout utilities

Avoid creating custom page structures unless approved.

---

## Flutter

Pages should be assembled using:

- Scaffold
- SafeArea
- Column
- Row
- ListView
- GridView
- Custom reusable layouts

Avoid duplicating layout code across screens.

---

# AI Development Guidelines

AI-generated screens must:

- Reuse approved Layout Patterns.
- Follow the documented page hierarchy.
- Maintain consistent spacing.
- Use existing components.
- Respect responsive behavior.

---

# Governance

Every screen within the eBPCO ecosystem shall be based on an approved Layout Pattern.

New page layouts require review and approval by the UI/UX Team before implementation.

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