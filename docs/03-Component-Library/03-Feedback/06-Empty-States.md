# Empty States

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Feedback

---

# Purpose

Empty States communicate that no content is currently available while guiding users toward the next appropriate action.

Rather than displaying blank screens or empty tables, Empty States provide meaningful explanations, helpful illustrations or icons, and clear calls to action.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Empty States should:

- Explain why content is unavailable.
- Reduce user confusion.
- Encourage the next logical action.
- Improve first-time user experience.
- Maintain accessibility.
- Consume approved Design Tokens.

---

# Usage

Use Empty States when:

- No businesses have been registered.
- No permit applications exist.
- Search results return no matches.
- No payment history is available.
- No notifications exist.
- No uploaded documents are present.
- A feature has not been used yet.

Do not leave empty tables, blank pages, or unexplained whitespace.

---

# Anatomy

An Empty State consists of:

- Illustration or Icon
- Title
- Supporting Description
- Primary Action
- Optional Secondary Action

Example

+---------------------------------------------+
|             📄                              |
|                                             |
|     No Business Applications Yet            |
|                                             |
| Register your first business to begin       |
| applying for permits.                       |
|                                             |
| [Register Business]                         |
+---------------------------------------------+

---

# Variants

## First-Time Empty State

Displayed when the user has never created any records.

Examples:

- No registered businesses.
- No submitted applications.
- No uploaded documents.

---

## Search Empty State

Displayed when search returns no results.

Example

"No businesses match your search."

Suggested actions:

- Clear Filters
- Reset Search

---

## Filter Empty State

Displayed when filters exclude all available data.

Example

"No applications match the selected filters."

---

## Feature Empty State

Displayed when a feature has not yet been used.

Examples

Notifications

Payment History

Saved Drafts

---

## Permission Empty State

Displayed when users cannot access specific content due to role restrictions.

Example

"You do not have permission to access this feature."

---

# Behavior

Empty States should:

- Replace empty content areas.
- Explain the reason.
- Offer the next logical action.
- Maintain layout consistency.
- Avoid making the interface appear broken.

---

# Content Guidelines

Messages should:

- Be friendly.
- Be concise.
- Explain why content is unavailable.
- Suggest what users can do next.

Preferred

"You haven't registered a business yet."

Avoid

"No Data"

---

# Illustrations

Illustrations are optional.

Recommended:

- Simple illustrations
- Government-friendly graphics
- Material-style illustrations
- Consistent iconography

Avoid decorative artwork that distracts from the message.

---

# Actions

Every Empty State should include an appropriate action whenever possible.

Examples

Register Business

Submit Application

Upload Documents

Refresh

Clear Filters

Go Back

Learn More

---

# Accessibility

Empty States shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Maintain sufficient contrast.
- Avoid conveying meaning solely through illustrations.
- Provide descriptive text.

---

# Responsive Behavior

Desktop

- Center within the content area.
- Maintain generous spacing.

Tablet

- Scale illustrations proportionally.

Mobile

- Stack content vertically.
- Ensure action buttons remain easy to tap.
- Avoid excessive scrolling.

---

# Design Tokens

Empty States consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Illustration Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Empty States should:

- Reuse shared Empty State components.
- Consume centralized SCSS tokens.
- Support configurable icons, illustrations, messages, and actions.

Recommended location:

shared/components/empty-state/

---

# Flutter Implementation

Flutter Empty States should:

- Reuse shared Empty State widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Support configurable illustrations and actions.

Recommended location:

shared/widgets/empty_state/

---

# Related Components

- Loading States – displayed while content is loading.
- Error States – displayed when content cannot be retrieved.
- Progress Indicators – shown while operations are in progress.
- Alerts – communicate additional information after content becomes available.

---

# Implementation Checklist

- [ ] Uses approved Design Tokens
- [ ] Supports WCAG 2.1 AA
- [ ] Responsive across all breakpoints
- [ ] Reusable shared component
- [ ] Provides a clear explanation
- [ ] Includes an appropriate call to action
- [ ] Matches Brand Guidelines
- [ ] Matches Design System

---

# Do

✔ Explain why no content exists.

✔ Guide users toward the next action.

✔ Use friendly language.

✔ Maintain consistent layouts.

✔ Reuse shared Empty State components.

---

# Don't

✘ Display blank pages.

✘ Show "No Data" without explanation.

✘ Leave users without a next step.

✘ Use inconsistent illustrations.

✘ Create undocumented Empty State variants.

---

# eBPCO Examples

Dashboard

- No recent activities.

Business Registration

- No registered businesses.

Permit Applications

- No submitted applications.

Payments

- No payment records.

Notifications

- No notifications available.

Documents

- No uploaded files.

Search

- No matching businesses found.

---

# AI Development Guidelines

AI-generated Empty States must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Include meaningful actions whenever possible.
- Avoid undocumented variants.

---

# Governance

All Empty State implementations within the eBPCO ecosystem shall comply with this specification.

New Empty State variants require UI/UX approval before implementation.

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