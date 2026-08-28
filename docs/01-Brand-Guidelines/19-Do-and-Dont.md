# 19 Do and Don't

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Design Governance

---

# Purpose

This document defines practical design rules for creating consistent, professional, and accessible interfaces throughout the eBPCO ecosystem.

Every UI review should validate compliance with these rules before implementation approval.

---

# Philosophy

When making design decisions, always choose:

- Consistency over creativity
- Simplicity over complexity
- Clarity over decoration
- Accessibility over aesthetics
- Reusability over one-off solutions

---

# Layout

## ✅ Do

- Align content to the grid.
- Maintain consistent spacing.
- Use approved page layouts.
- Group related information.

## ❌ Don't

- Randomly position elements.
- Mix different spacing values.
- Create inconsistent layouts.
- Overcrowd pages.

---

# Typography

## ✅ Do

- Use the approved typography scale.
- Maintain hierarchy.
- Use sentence case.
- Ensure readability.

## ❌ Don't

- Mix multiple font sizes unnecessarily.
- Use decorative fonts.
- Overuse bold text.
- Write everything in uppercase.

---

# Colors

## ✅ Do

- Use Design Tokens.
- Use semantic colors.
- Maintain accessible contrast.
- Follow the approved palette.

## ❌ Don't

- Introduce random colors.
- Hardcode HEX values.
- Use color as the only indicator.
- Create unofficial theme variations.

---

# Buttons

## ✅ Do

- Use registered button components.
- Keep labels concise.
- Use one primary action per section.
- Display loading states.

## ❌ Don't

- Create custom button styles.
- Use vague labels.
- Overuse primary buttons.
- Hide disabled states.

---

# Forms

## ✅ Do

- Display labels.
- Validate inputs.
- Group related fields.
- Show meaningful error messages.

## ❌ Don't

- Use placeholder-only labels.
- Display unclear errors.
- Hide required fields.
- Create inconsistent layouts.

---

# Tables

## ✅ Do

- Use searchable tables where appropriate.
- Display pagination.
- Maintain consistent actions.
- Use status badges.

## ❌ Don't

- Overload tables with unnecessary columns.
- Mix action locations.
- Hide important data.
- Remove sorting without reason.

---

# Cards

## ✅ Do

- Use approved card types.
- Maintain spacing.
- Follow elevation rules.
- Keep content organized.

## ❌ Don't

- Create decorative cards.
- Mix elevation levels.
- Place unrelated information together.
- Overfill cards.

---

# Icons

## ✅ Do

- Use Material Symbols.
- Pair icons with labels.
- Maintain consistent sizing.
- Use semantic colors.

## ❌ Don't

- Mix icon libraries.
- Invent custom icons.
- Use icons without meaning.
- Replace text with icons.

---

# Navigation

## ✅ Do

- Provide clear navigation paths.
- Maintain consistent menus.
- Include back navigation.
- Keep destinations predictable.

## ❌ Don't

- Create dead-end screens.
- Change navigation patterns.
- Hide important actions.
- Move navigation unexpectedly.

---

# Accessibility

## ✅ Do

- Support keyboard navigation.
- Maintain WCAG AA contrast.
- Display focus indicators.
- Use descriptive labels.

## ❌ Don't

- Remove focus outlines.
- Depend solely on color.
- Ignore screen readers.
- Reduce touch targets below 44×44px.

---

# Motion

## ✅ Do

- Keep animations subtle.
- Maintain consistent timing.
- Use motion to support usability.

## ❌ Don't

- Add decorative animations.
- Delay workflows.
- Overanimate components.
- Use flashing effects.

---

# Component Creation

## ✅ Do

- Check the Component Library first.
- Reuse existing components.
- Request approval for new components.

## ❌ Don't

- Create undocumented components.
- Duplicate existing functionality.
- Bypass the Design Foundation.

---

# AI-Assisted Development

## ✅ Do

- Follow Design Tokens.
- Use registered component IDs.
- Respect the Brand Guidelines.
- Follow the Stitch documentation.
- Generate reusable components.

## ❌ Don't

- Invent new UI patterns.
- Ignore accessibility.
- Hardcode design values.
- Create undocumented workflows.

---

# Definition of Done

A feature is considered complete only when it:

- Follows the Brand Guidelines.
- Uses approved Design Tokens.
- Uses registered reusable components.
- Matches the Stitch navigation.
- Passes responsive testing.
- Passes accessibility review.
- Passes UI consistency review.
- Contains no placeholder content.
- Is approved by the Project Owner.
- Is approved by the Web Admin UI Lead.

---

# Governance

This document is mandatory during:

- Design reviews
- Pull request reviews
- QA validation
- AI-generated UI validation

Any violation must be corrected before implementation is approved.

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