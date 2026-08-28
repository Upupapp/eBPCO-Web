# 08 Icons

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

---

# Purpose

Icons provide quick visual recognition for actions, navigation, statuses, and system feedback throughout the eBPCO ecosystem.

The objective is to create a consistent, accessible, and professional icon language shared between the Angular Web Administration Portal and the Flutter Mobile Application.

Only approved icons may be used.

---

# Official Icon Library

The official icon library for eBPCO is:

**Material Symbols**

This library shall be used across:

- Angular Web Administration Portal
- Flutter Mobile Application
- Documentation
- Design Mockups
- Future eBPCO modules

Mixing multiple icon libraries is prohibited unless explicitly approved.

---

# Design Principles

The icon system follows these principles:

- Simple
- Recognizable
- Consistent
- Accessible
- Professional

Icons support content; they do not replace text.

---

# Icon Style

Approved style:

- Rounded
- Outlined
- Filled (only for emphasis)

Preferred style:

Outlined

Filled icons should only be used for:

- Active navigation
- Selected items
- Critical status indicators

---

# Standard Icon Sizes

| Token | Size | Usage |
|--------|-----:|------|
| Icon-XS | 16px | Inline text |
| Icon-S | 20px | Form fields |
| Icon-M | 24px | Standard UI |
| Icon-L | 32px | Dashboard cards |
| Icon-XL | 48px | Empty states |

No additional icon sizes should be introduced.

---

# Navigation Icons

Navigation icons should:

- Use 24px sizing
- Align consistently with text
- Maintain equal spacing
- Use the same visual weight

Examples include:

- Dashboard
- Users
- Business Permits
- Workflow
- Reports
- Notifications
- Settings
- Logout

---

# Action Icons

Action icons communicate user interactions.

Examples:

- Add
- Edit
- Delete
- Save
- Search
- Filter
- Refresh
- Download
- Upload
- Print
- View

Action icons should always include a tooltip on desktop.

---

# Status Icons

Status icons reinforce system feedback.

Examples:

- Approved
- Pending
- Under Review
- Rejected
- Success
- Warning
- Error
- Information

Status icons must always be paired with text or badges.

---

# Form Icons

Forms may include icons for:

- Search
- Password visibility
- Calendar
- File upload
- Location
- Email
- Phone

Icons must never replace field labels.

---

# Dashboard Icons

Dashboard statistic cards may include icons to improve recognition.

Icons should remain secondary to the statistic itself.

---

# Empty State Icons

Empty states should use larger icons (48px) with supporting text.

Examples:

- No Records
- No Notifications
- No Search Results
- No Applications

---

# Color Usage

Icons inherit the semantic color of their parent component.

Examples:

Primary Actions

Primary Color

Danger Actions

Danger Color

Disabled Actions

Disabled Color

Do not assign decorative colors to icons.

---

# Accessibility

Icons must never be the only indicator of meaning.

Always accompany icons with:

- Labels
- Tooltips (Web)
- Accessible descriptions
- Status text

Interactive icons must have sufficient touch targets.

Minimum:

44 × 44 px

---

# Responsive Behaviour

Icon sizes remain consistent across devices.

Spacing may be reduced on mobile while preserving usability.

---

# Angular Implementation Notes

Use Angular Material Symbols consistently.

Create reusable icon components where appropriate.

Avoid inline SVGs unless officially approved.

---

# Flutter Implementation Notes

Use the Material Symbols package or the official Material icon set.

Avoid mixing Cupertino and Material icons on the same screen.

---

# AI Generation Notes

When generating interfaces:

- Use only Material Symbols.
- Match the documented icon size.
- Do not invent custom icons.
- Pair icons with text when required.
- Follow semantic color usage.

---

# Governance

Any new icon requires:

1. Design review
2. Documentation update
3. Approval
4. Component update
5. Implementation

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