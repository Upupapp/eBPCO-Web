# 17 Light Theme

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Theme Standard

---

# Purpose

The Light Theme defines the official visual appearance of the eBPCO ecosystem.

Version 1.0 supports Light Theme exclusively for both the Angular Web Administration Portal and the Flutter Mobile Application.

All UI components shall reference semantic design tokens instead of hardcoded color values.

---

# Theme Philosophy

The Light Theme is designed to be:

- Professional
- Clean
- Government-appropriate
- Accessible
- Calm
- Readable
- Consistent

The interface should minimize visual fatigue while maintaining strong content hierarchy.

---

# Official Theme

Supported Theme

✔ Light Theme

Future Support

☐ Dark Theme (Planned)

No additional themes are permitted without approval.

---

# Theme Tokens

Components must reference semantic tokens.

Examples:

Background

Surface

Primary

Secondary

Text Primary

Text Secondary

Border

Success

Warning

Danger

Information

Disabled

Never reference raw HEX values directly inside components.

---

# Background Layers

Layer 1

Application Background

Layer 2

Page Surface

Layer 3

Cards

Layer 4

Dialogs

Layer 5

Overlays

Each layer should provide subtle visual separation.

---

# Navigation Theme

Sidebar

Light surface

Top Navigation

Light surface

Breadcrumbs

Neutral text

Navigation must maintain sufficient contrast at all times.

---

# Card Theme

Cards should:

- Use approved surface colors.
- Maintain consistent elevation.
- Follow approved border radius.
- Preserve visual hierarchy.

---

# Form Theme

Forms should maintain:

- White input backgrounds
- Visible borders
- Accessible focus indicators
- Semantic validation colors

---

# Table Theme

Tables should use:

- White background
- Subtle row separators
- Hover highlighting
- Semantic status colors

Avoid heavy borders.

---

# Button Theme

Primary actions

Primary token

Secondary actions

Secondary token

Danger actions

Danger token

Disabled buttons

Disabled token

---

# Status Theme

Statuses inherit semantic theme colors.

Examples:

Approved

Success

Pending

Warning

Rejected

Danger

Information

Info

Draft

Neutral

---

# Shadows

Use only approved elevation levels.

Do not increase shadow intensity for decorative purposes.

---

# Typography

Text colors must reference semantic tokens.

Examples:

Heading

Body

Secondary

Disabled

Never use arbitrary text colors.

---

# Responsive Behaviour

The Light Theme must remain visually consistent across:

- Desktop
- Laptop
- Tablet
- Mobile

Only layout and spacing adapt to screen size.

---

# Future Dark Theme Readiness

All components must reference semantic tokens so Dark Theme can be introduced without rewriting components.

Example

```
Background → Theme.Background
Primary → Theme.Primary
Text → Theme.TextPrimary
```

Never bind components directly to HEX values.

---

# Angular Implementation Notes

Implement themes using:

- SCSS variables
- CSS custom properties
- Angular Material theming (where applicable)

Avoid component-level color definitions.

---

# Flutter Implementation Notes

Use:

ThemeData

ColorScheme

TextTheme

InputDecorationTheme

ButtonTheme

Never define colors inside widgets.

---

# AI Generation Notes

When generating UI:

- Use semantic theme tokens.
- Never hardcode colors.
- Follow approved Light Theme rules.
- Prepare components for future Dark Theme support.

---

# Governance

Theme changes require:

1. Design review
2. Documentation update
3. Token update
4. Component validation
5. Approval

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