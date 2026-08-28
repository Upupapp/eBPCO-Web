# 11 Forms

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Component Category ID: FRM

---

# Purpose

Forms are the primary method for collecting, validating, and updating information within the eBPCO ecosystem.

Every form, regardless of module or platform, shall follow the standards defined in this document to ensure consistency, usability, accessibility, and maintainability.

---

# Design Principles

Forms must be:

- Simple
- Predictable
- Accessible
- Responsive
- Error-tolerant
- Easy to complete

---

# Component Registry

| Component ID | Component |
|--------------|-----------|
| FRM-001 | Text Field |
| FRM-002 | Password Field |
| FRM-003 | Search Field |
| FRM-004 | Email Field |
| FRM-005 | Phone Number Field |
| FRM-006 | Number Field |
| FRM-007 | Text Area |
| FRM-008 | Dropdown |
| FRM-009 | Date Picker |
| FRM-010 | Checkbox |
| FRM-011 | Radio Button |
| FRM-012 | Switch |
| FRM-013 | File Upload |
| FRM-014 | Image Upload |
| FRM-015 | Validation Message |

---

# Universal Form Rules

Every form shall contain:

- Clear title
- Section grouping
- Labels
- Helper text (where needed)
- Validation feedback
- Submit action
- Cancel action (where appropriate)

---

# Labels

Every input must have a visible label.

Correct

```
Business Name
```

Incorrect

```
Placeholder only
```

---

# Required Fields

Required fields must display:

```
*
```

Example

```
Business Name *
```

Required fields must also be validated before submission.

---

# Optional Fields

Optional fields should be explicitly labeled only when necessary.

Example

```
Middle Name (Optional)
```

---

# Placeholder Text

Placeholders provide examples, not instructions.

Correct

```
Enter your business name
```

Incorrect

```
Business Name
```

---

# Validation

Validation occurs:

- Real-time where appropriate
- On field exit
- Before submission

Validation must be clear and actionable.

Example

```
Business name is required.
```

Avoid generic messages such as:

```
Invalid input.
```

---

# Helper Text

Helper text appears below the field.

Example

```
Maximum file size: 5 MB
```

---

# Input States

Every field must support:

- Default
- Hover (Web)
- Focus
- Filled
- Disabled
- Error
- Success
- Read-only

---

# Password Fields

Must include:

- Show/Hide password
- Secure input
- Strength indicator (future enhancement)

---

# Search Fields

Should include:

- Search icon
- Clear button
- Debounced search where appropriate

---

# Dropdowns

Rules:

- Searchable when more than 10 options
- Clear selected value
- Keyboard accessible

---

# Date Picker

Supported format:

```
MM/DD/YYYY
```

Future localization may introduce regional formats.

---

# File Upload

Supported features:

- Drag and drop (Web)
- Tap to upload (Mobile)
- File preview
- File size validation
- File type validation
- Upload progress

---

# Character Counters

Displayed when limits exist.

Example

```
125 / 250
```

---

# Form Layout

Desktop

Maximum two columns where appropriate.

Mobile

Single-column layout.

---

# Form Actions

Primary button

Right aligned (Web)

Bottom full-width (Mobile)

Secondary button

Cancel

Back

Reset (only when appropriate)

---

# Error Messages

Must appear:

- Immediately below the field
- In semantic error color
- With supporting icon (optional)

---

# Success Messages

Should be:

- Clear
- Brief
- Positive

Example

```
Business profile updated successfully.
```

---

# Accessibility

Forms must support:

- Keyboard navigation
- Screen readers
- WCAG AA contrast
- Focus indicators
- Minimum touch target of 44×44px

---

# Responsive Behaviour

Desktop

Optimized multi-column layout.

Tablet

Adaptive spacing.

Mobile

Single-column layout with full-width inputs.

---

# Angular Implementation Notes

Create reusable form components.

Examples:

- AppTextField
- AppDropdown
- AppDatePicker
- AppFileUpload

Never duplicate form logic.

---

# Flutter Implementation Notes

Create reusable widgets.

Examples:

- AppTextField
- AppDropdown
- AppDatePicker
- AppFileUpload

Use centralized validation logic.

---

# AI Generation Notes

When generating forms:

- Use only approved components.
- Follow validation rules.
- Maintain consistent spacing.
- Use documented component IDs.
- Never create undocumented form patterns.

---

# Governance

Any new form component requires:

1. Design review
2. Component registration
3. Documentation update
4. Approval
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