# Search

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

The Search component enables users to quickly locate records, applications, businesses, payments, users, and other information within the eBPCO ecosystem.

Search should prioritize speed, accuracy, and consistency while minimizing user effort.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Search should:

- Help users find information efficiently.
- Reduce navigation time.
- Support large datasets.
- Improve productivity.
- Support accessibility.
- Consume approved Design Tokens.

---

# Usage

Search is appropriate whenever users need to locate existing information.

Common eBPCO examples include:

- Business Registry
- Business Owners
- Permit Applications
- Payment Records
- Inspection Records
- User Accounts
- Notifications
- Audit Logs
- Reports

Search should not replace structured filters when users need precise control over results.

---

# Anatomy

A standard Search component consists of:

- Search Label (optional)
- Search Input
- Search Icon
- Clear Button
- Loading Indicator (when applicable)
- Search Suggestions (optional)
- Filter Button (optional)
- Validation Message (rarely required)

---

# Variants

## Standard Search

Allows users to search using keywords.

Recommended for most pages.

---

## Instant Search

Results update automatically as the user types.

Recommended for:

- Small datasets
- Local filtering
- Quick lookups

---

## Manual Search

Results are displayed only after the user:

- Presses Enter
- Clicks the Search button

Recommended for:

- Large datasets
- Server-side searches
- Expensive queries

---

## Search with Filters

Provides structured filtering alongside keyword search.

Example:

Search Businesses

Filters:

- Barangay
- Business Type
- Status
- Date Registered

---

## Search with Suggestions

Displays suggested results while typing.

Suggestions may include:

- Recent searches
- Matching businesses
- Permit numbers
- User names

---

# States

Search shall support:

- Default
- Hover (Web)
- Focus
- Typing
- Loading
- Results Available
- No Results
- Disabled
- Error

State transitions shall follow the Motion guidelines.

---

# Search Behavior

Search should:

- Preserve entered text.
- Support copy and paste.
- Allow clearing input.
- Maintain focus during interaction.
- Prevent duplicate search requests.

---

# Debouncing

Instant Search should debounce user input.

Recommended delay:

```
300–500 milliseconds
```

This reduces unnecessary processing while maintaining responsiveness.

---

# Minimum Search Length

Search should not execute until a minimum number of characters is entered when appropriate.

Recommended:

```
Minimum: 2–3 characters
```

Exceptions may apply for permit numbers or reference IDs.

---

# Search Results

Search results should:

- Display relevant information.
- Be ranked logically.
- Highlight matching text where appropriate.
- Preserve the user's search query.

---

# Search Suggestions

Suggestions should:

- Match partial input.
- Update dynamically.
- Support keyboard navigation.
- Disappear when focus is lost.

Suggestions should never obscure essential page content.

---

# Filters

Search Filters should:

- Be optional.
- Remain clearly labeled.
- Support multiple filter criteria.
- Display active filter indicators.
- Allow quick reset.

Example:

```
Status: Approved

Barangay: San Isidro

Business Type: Retail
```

---

# Empty State

If the user has not searched yet:

Display guidance.

Example:

```
Search for a Business Name or Permit Number.
```

---

# No Results State

When no matches exist:

Display a helpful message.

Example:

```
No matching businesses found.

Try another keyword or adjust your filters.
```

Avoid empty pages.

---

# Loading State

During search:

- Display a loading indicator.
- Preserve layout stability.
- Prevent duplicate requests.

Loading feedback should appear within the search area.

---

# Keyboard Support

Desktop Search should support:

- Tab
- Shift + Tab
- Enter
- Escape
- Arrow Keys (Suggestions)

Keyboard navigation should remain predictable.

---

# Accessibility

Search shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Provide semantic labels.
- Display visible focus indicators.
- Support keyboard navigation.
- Maintain accessible touch targets.

---

# Responsive Behavior

Desktop:

- Display inline search bars.
- Support keyboard shortcuts.
- Show filters beside search when space permits.

Tablet:

- Collapse filters when necessary.

Mobile:

- Display full-width search.
- Move filters into a modal or bottom sheet.
- Maintain generous touch spacing.

---

# Performance

Search should:

- Debounce input.
- Cache recent results when appropriate.
- Avoid unnecessary requests.
- Display loading efficiently.

Large datasets should use server-side searching.

---

# Design Tokens

Search consumes:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Search should:

- Use Reactive Forms.
- Reuse shared Search components.
- Consume centralized SCSS tokens.
- Support debounced Observables.
- Separate UI from search logic.

Recommended location:

```
shared/components/search/
```

---

# Flutter Implementation

Flutter Search should:

- Reuse shared Search widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Support debounced searching.
- Display loading consistently.

Recommended location:

```
shared/widgets/search/
```

---

# Do

✔ Debounce Instant Search.

✔ Display helpful empty states.

✔ Support filters.

✔ Preserve search queries.

✔ Highlight matching results where appropriate.

✔ Reuse shared components.

---

# Don't

✘ Execute searches on every keystroke without debouncing.

✘ Hide loading indicators.

✘ Display blank result pages.

✘ Hardcode styling.

✘ Create undocumented Search variants.

---

# eBPCO Examples

Business Registry

- Search Business Name
- Search Permit Number

Applications

- Search Applicant
- Search Application ID

Payments

- Search Official Receipt Number

Administration

- Search Users
- Search Roles

Reports

- Search Transactions

---

# AI Development Guidelines

AI-generated Search components must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Support responsive layouts.
- Implement debouncing where appropriate.
- Avoid undocumented variants.

---

# Governance

All Search implementations within the eBPCO ecosystem shall comply with this specification.

New Search variants require UI/UX approval and documentation before implementation.

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