# Text Areas

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Text Areas allow users to enter and edit multi-line textual information throughout the eBPCO ecosystem.

They are designed for collecting detailed information that exceeds the scope of a standard Text Field while maintaining consistency, accessibility, and usability across the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Text Areas should:

- Support long-form user input.
- Improve readability.
- Provide consistent validation.
- Encourage structured responses.
- Follow the Design System.
- Consume approved Design Tokens.

---

# Usage

Use Text Areas for:

- Business Description
- Inspection Notes
- Approval Remarks
- Rejection Reasons
- Additional Information
- Administrator Comments
- Internal Notes
- Feedback

Do not use Text Areas for short-form input such as names, phone numbers, or email addresses.

---

# Anatomy

A standard Text Area consists of:

- Label
- Multi-line Input Container
- User Input
- Placeholder (optional)
- Helper Text (optional)
- Validation Message
- Character Counter (optional)
- Required Indicator (when applicable)

---

# Variants

## Standard

The default multi-line input component used for most forms.

---

## Auto-Expanding

Automatically increases height as additional lines are entered.

Recommended for mobile devices and comment sections.

---

## Fixed Height

Maintains a predefined height with vertical scrolling.

Recommended for administrative interfaces.

---

## Read Only

Displays information without allowing edits.

Users may copy content.

---

## Disabled

Indicates that editing is temporarily unavailable.

Disabled content should remain readable.

---

# States

Text Areas shall support:

- Default
- Hover (Web)
- Focus
- Filled
- Disabled
- Read Only
- Error
- Success
- Warning

State transitions shall follow the Motion guidelines.

---

# Labels

Every Text Area must include a visible label.

Labels should:

- Clearly identify the expected content.
- Remain visible while typing.
- Be concise.
- Use descriptive wording.

Preferred examples:

- Business Description
- Inspection Remarks
- Rejection Reason

---

# Placeholder Text

Placeholder text may provide examples of expected content.

Examples:

```
Provide a brief description of the business...
```

```
Enter inspection findings...
```

Placeholder text must never replace a visible label.

---

# Helper Text

Helper text should clarify expectations.

Examples:

```
Maximum 500 characters.
```

```
Provide sufficient detail for review.
```

Helper text should appear above validation messages.

---

# Character Limits

Where character limits apply:

- Display the maximum limit.
- Show remaining characters when appropriate.
- Prevent excessive input.
- Inform users before submission.

Example:

```
245 / 500 characters
```

---

# Validation

Validation should:

- Occur after interaction.
- Occur during submission.
- Explain the issue clearly.
- Suggest corrective action.

Example:

Incorrect:

```
Invalid input.
```

Preferred:

```
Inspection Remarks are required.
```

---

# Behavior

Text Areas should:

- Preserve entered content.
- Support copy and paste.
- Support keyboard shortcuts.
- Maintain scroll position.
- Prevent accidental data loss.
- Expand naturally where appropriate.

---

# Accessibility

Text Areas shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Provide semantic labels.
- Support screen readers.
- Display visible focus indicators.
- Respect operating system text scaling.

---

# Responsive Behavior

Desktop:

- Display sufficient height for readability.
- Support resizing only if approved by the Design System.

Tablet:

- Maintain consistent spacing.

Mobile:

- Expand to available width.
- Support virtual keyboards.
- Prefer auto-expanding behavior.

---

# Design Tokens

Text Areas consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Text Areas should:

- Use Reactive Forms.
- Reuse shared Text Area components.
- Consume centralized SCSS tokens.
- Display validation consistently.
- Avoid inline styles.

Recommended location:

```
shared/components/text-area/
```

---

# Flutter Implementation

Flutter Text Areas should:

- Use TextFormField with multiline support.
- Reuse shared widgets.
- Consume ThemeData.
- Respect AppColors and AppTypography.
- Display validation consistently.

Recommended location:

```
shared/widgets/text_areas/
```

---

# Do

✔ Use Text Areas for detailed responses.

✔ Provide clear labels.

✔ Show character limits when applicable.

✔ Preserve user input.

✔ Reuse shared components.

✔ Support copy and paste.

---

# Don't

✘ Use Text Areas for short values.

✘ Replace labels with placeholder text.

✘ Hide validation messages.

✘ Hardcode dimensions.

✘ Create custom styles outside the Design System.

---

# eBPCO Examples

Business Registration

- Business Description

Application Review

- Review Remarks
- Inspector Notes

Approval Workflow

- Approval Comments
- Rejection Reason

Support

- User Feedback
- Additional Information

---

# AI Development Guidelines

AI-generated Text Areas must:

- Reuse documented components.
- Consume Design Tokens.
- Preserve accessibility.
- Follow validation standards.
- Support responsive layouts.
- Avoid undocumented variants.

---

# Governance

All Text Area implementations within the eBPCO ecosystem shall comply with this specification.

New variants require UI/UX approval and documentation before implementation.

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