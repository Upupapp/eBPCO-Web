# Form Experience

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: UX Standards

---

# Purpose

Form Experience defines the standards for designing, organizing, and interacting with forms throughout the Electronic Business Permit and Clearance Office (eBPCO) ecosystem.

Since permit applications, renewals, inspections, payments, and administrative functions rely heavily on forms, every form should provide a consistent, efficient, and accessible user experience across the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Forms should:

- Minimize user effort.
- Reduce input errors.
- Improve completion rates.
- Maintain consistency across platforms.
- Support accessibility requirements.
- Guide users toward successful submission.
- Preserve user progress.

---

# Form Design Principles

## Simplicity

Only request information that is necessary.

Avoid:

- duplicate fields
- unnecessary questions
- redundant confirmations
- excessive scrolling

Each field should have a clear purpose.

---

## Logical Organization

Related information should be grouped together.

Example

Business Information

- Business Name
- Business Type
- Business Address

Owner Information

- Owner Name
- Contact Number
- Email Address

Supporting Documents

- Upload Barangay Clearance
- Upload Fire Safety Certificate

---

## Progressive Disclosure

Display advanced or conditional fields only when required.

Example

Payment Method

○ Bank Transfer

○ Onsite Payment

If Bank Transfer is selected

↓

Display bank reference fields.

This prevents overwhelming users with unnecessary inputs.

---

## Clear Labels

Every input field shall have a visible label.

Labels should:

- describe the required information
- remain concise
- use consistent terminology

Preferred

Business Name

Contact Number

Business Address

Avoid

Field 1

Information

Data

---

## Helper Text

Helper text should provide additional guidance before errors occur.

Example

Business Name

Enter the registered business name exactly as shown on your DTI or SEC registration.

Helper text should not replace labels.

---

# Required Fields

Required fields should be clearly identified.

Recommended indicator

*

Example

Business Name *

Avoid relying solely on color to indicate required fields.

---

# Validation

Validation should occur as early as possible.

Validation should:

- identify incorrect input
- explain the problem
- describe how to fix it

Example

Email Address

Please enter a valid email address.

Validation should never erase previously entered information.

---

# Error Prevention

Forms should reduce opportunities for user mistakes.

Recommended techniques

- input masks
- dropdown selections
- date pickers
- autocomplete
- file type restrictions
- character limits

Prevent errors before they occur whenever possible.

---

# Default Values

Where appropriate, forms should provide intelligent defaults.

Examples

- Current Date
- Registered Barangay
- Default Country
- User Profile Information

Defaults should reduce typing without introducing incorrect information.

---

# Save Progress

Long forms should support draft saving.

Recommended workflows

- New Permit Application
- Permit Renewal
- Inspection Reports

Users should be able to continue later without losing progress.

---

# Submission

Before submission, users should have an opportunity to review their information.

Review pages should:

- summarize entered data
- highlight missing information
- allow editing
- clearly present the Submit action

---

# Confirmation

Successful submissions should include:

- confirmation message
- reference number
- submission date
- next steps

Example

Business Permit Application Submitted Successfully

Reference Number

BP-2026-000245

---

# Accessibility

Forms shall:

- Meet WCAG 2.1 AA.
- Support keyboard navigation.
- Maintain logical focus order.
- Associate labels programmatically.
- Provide descriptive validation messages.
- Maintain sufficient color contrast.

Every form should remain fully usable without a mouse.

---

# Responsive Behavior

Desktop

- Multi-column layouts where appropriate.
- Inline helper text.
- Efficient spacing.

Tablet

- Reduced columns.
- Comfortable spacing.

Mobile

- Single-column layout.
- Larger touch targets.
- Full-width input controls.
- Sticky action buttons where appropriate.

---

# Standard eBPCO Forms

The following workflows shall follow these standards:

- Business Permit Application
- Permit Renewal
- Inspection Reports
- User Registration
- Login
- Profile Management
- Payment Submission
- Business Registration

---

# Relationship to Other Standards

Form Experience supports:

- User Flows
- Validation
- Component Library
- Navigation
- Information Architecture
- Mobile Guidelines
- Web Guidelines

---

# AI Development Guidelines

AI-generated forms must:

- Reuse approved Design System components.
- Preserve field hierarchy.
- Support accessibility.
- Display validation immediately.
- Preserve user input during validation.
- Avoid introducing undocumented fields.
- Maintain consistent spacing and layouts.

AI should optimize usability without modifying approved business processes.

---

# Governance

All forms within the eBPCO ecosystem shall comply with this specification.

Changes to form structure, validation patterns, or interaction behavior require approval from the UI/UX Team before implementation.

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