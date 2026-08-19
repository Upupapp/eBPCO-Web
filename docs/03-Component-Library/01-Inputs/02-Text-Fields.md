# Text Fields

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Inputs

---

# Purpose

Text Fields allow users to enter and edit short-form textual information throughout the eBPCO ecosystem.

They are the primary component for collecting business information, applicant details, addresses, account credentials, and other structured text input.

Text Fields must provide a consistent, accessible, and predictable user experience across the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Text Fields should:

- Support efficient data entry.
- Clearly communicate expected input.
- Provide immediate validation feedback.
- Improve form completion rates.
- Follow the Design System.
- Consume approved Design Tokens.

---

# Usage

Use Text Fields for:

- Business Name
- Owner Name
- Email Address
- Username
- Contact Number
- Tax Identification Number (TIN)
- Business Address
- Reference Numbers
- Permit Numbers

Text Fields should only be used for short to medium-length input.

For long-form content, use a Text Area component.

---

# Anatomy

A standard Text Field consists of:

- Label
- Input Container
- User Input
- Placeholder (optional)
- Leading Icon (optional)
- Trailing Icon (optional)
- Helper Text (optional)
- Validation Message (when applicable)
- Required Indicator (if required)

Each element serves a specific purpose and should not be omitted without justification.

---

# Variants

## Standard

Used for most forms throughout the application.

---

## Filled

Used when stronger visual separation from the background is required.

---

## Outlined

Recommended for desktop forms and administrative interfaces.

---

## Password

Used for confidential input.

Should support:

- Show Password
- Hide Password

---

## Read Only

Displays information that users may copy but cannot modify.

---

## Disabled

Indicates that input is temporarily unavailable.

Disabled fields must remain readable.

---

# Input Types

Approved input types include:

- Text
- Email
- Password
- Number
- Telephone
- URL
- Search

Input type should match the expected data.

---

# States

Text Fields shall support:

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

Every Text Field must have a visible label.

Labels should:

- Clearly describe expected input.
- Remain visible during interaction.
- Be concise.
- Avoid abbreviations.

Incorrect:

```
Name
```

Preferred:

```
Business Name
```

---

# Placeholder Text

Placeholder text is optional.

It should:

- Provide an example.
- Never replace the label.
- Disappear when the user enters text.

Example:

```
example@email.com
```

---

# Helper Text

Helper text provides additional guidance.

Examples:

```
Maximum 100 characters.
```

```
Use your registered business name.
```

Helper text should appear below the field and above validation messages when both are present.

---

# Validation

Validation should occur:

- After user interaction.
- During form submission.
- When appropriate for the workflow.

Validation messages should:

- Explain the issue.
- Suggest how to fix it.
- Be written in plain language.

Example:

Incorrect:

```
Invalid input.
```

Preferred:

```
Business Name is required.
```

---

# Character Limits

When character limits apply:

- Display remaining characters when helpful.
- Prevent overflow where appropriate.
- Clearly communicate limits before submission.

---

# Behavior

Text Fields should:

- Preserve user input.
- Support copy and paste.
- Support autofill where appropriate.
- Display validation immediately after interaction.
- Prevent accidental data loss.

---

# Accessibility

Text Fields shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Provide semantic labels.
- Support screen readers.
- Display visible focus indicators.
- Respect text scaling preferences.

Placeholder text alone must never identify the field.

---

# Responsive Behavior

Desktop:

- Support keyboard-first workflows.
- Maintain consistent alignment.
- Display helper text beneath fields.

Tablet:

- Preserve spacing and readability.

Mobile:

- Expand to available width.
- Support virtual keyboards.
- Avoid horizontal scrolling.

---

# Design Tokens

Text Fields consume:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Shadow Tokens
- Motion Tokens

Hardcoded styling is prohibited.

---

# Angular Implementation

Angular Text Fields should:

- Use Reactive Forms.
- Reuse shared input components.
- Consume centralized SCSS tokens.
- Display validation consistently.
- Avoid inline styles.

Recommended location:

```
shared/components/text-field/
```

---

# Flutter Implementation

Flutter Text Fields should:

- Wrap the Material TextField or TextFormField.
- Reuse shared widgets.
- Consume ThemeData.
- Respect AppColors.
- Respect AppTypography.
- Display validation consistently.

Recommended location:

```
shared/widgets/text_fields/
```

---

# Do

✔ Always provide a visible label.

✔ Use helper text when additional guidance is needed.

✔ Validate input clearly.

✔ Match the keyboard to the input type.

✔ Reuse shared components.

✔ Keep field widths consistent within forms.

---

# Don't

✘ Use placeholder text as the only label.

✘ Hide validation messages.

✘ Disable copy and paste without justification.

✘ Hardcode colors or spacing.

✘ Create custom input styles outside the Design System.

---

# eBPCO Examples

Business Registration

- Business Name
- Trade Name
- Business Address

Owner Information

- Full Name
- Contact Number
- Email Address

Authentication

- Username
- Password

Permit Application

- Reference Number
- Permit Number

---

# AI Development Guidelines

AI-generated Text Fields must:

- Reuse documented components.
- Consume Design Tokens.
- Follow validation standards.
- Preserve accessibility.
- Maintain responsive behavior.
- Avoid undocumented field variants.

---

# Governance

All Text Field implementations within the eBPCO ecosystem shall comply with this specification.

New variants require UI/UX approval and documentation before implementation.

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
