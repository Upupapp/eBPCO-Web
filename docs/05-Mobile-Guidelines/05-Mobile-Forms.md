# Mobile Forms

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Mobile Guidelines

---

# Purpose

Mobile Forms define the standards for designing, validating, and interacting with forms in the Electronic Building Permit and Certificate of Occupancy (eBPCO) mobile application.

As the primary method for applying for permits, renewing licenses, submitting documents, and updating user information, forms must be optimized for touch interaction, readability, and efficiency while minimizing user errors.

This specification applies to the Flutter Mobile Application.

---

# Objectives

Mobile forms should:

- Minimize typing.
- Reduce user errors.
- Support one-handed interaction.
- Maintain accessibility.
- Preserve user progress.
- Improve completion rates.
- Provide immediate validation.

---

# Mobile Form Principles

## Keep Forms Short

Request only information that is required.

Avoid:

- Duplicate fields
- Unnecessary questions
- Excessive scrolling
- Repeated confirmations

Every field should have a defined business purpose.

---

## One Column Layout

Mobile forms shall use a single-column layout.

Benefits include:

- Easier reading
- Better accessibility
- Simpler navigation
- Reduced cognitive load

Multi-column forms should not be used on mobile devices.

---

## Logical Grouping

Related fields should be grouped together.

Example

Business Information

- Business Name
- Business Type
- Business Address

Owner Information

- Full Name
- Contact Number
- Email Address

Supporting Documents

- Upload Barangay Clearance
- Upload Fire Safety Certificate

Groups should have clear section headings.

---

## Progressive Disclosure

Display advanced fields only when needed.

Example

Payment Method

○ Bank Transfer

○ Onsite Payment

If Bank Transfer is selected

↓

Display:

- Reference Number
- Upload Proof of Payment

Users should only see information relevant to their current selection.

---

# Labels

Every input shall include a visible label.

Examples

Business Name

Owner Name

Contact Number

Avoid using placeholder text as the only label.

---

# Helper Text

Helper text should guide users before errors occur.

Example

Business Name

Enter the registered business name exactly as shown on your DTI or SEC registration.

Helper text should remain concise.

---

# Input Controls

Use the most appropriate input control for each data type.

Examples

Text

- Business Name

Dropdown

- Business Type

Date Picker

- Date of Registration

Checkbox

- Terms and Conditions

Switch

- Notifications

File Picker

- Supporting Documents

Choosing the correct control reduces input errors.

---

# Keyboard Optimization

The appropriate mobile keyboard should be displayed automatically.

Examples

Email Address

→ Email Keyboard

Phone Number

→ Numeric Keyboard

Amount

→ Decimal Keyboard

Password

→ Secure Keyboard

Input methods should match expected data.

---

# Validation

Validation should occur immediately after user input whenever practical.

Validation should:

- Explain the problem.
- Explain how to fix it.
- Preserve entered information.

Example

Please enter a valid email address.

Avoid technical error messages.

---

# Required Fields

Required fields should be clearly identified.

Recommended indicator

*

Example

Business Name *

Do not rely solely on color to indicate required fields.

---

# File Uploads

File uploads should:

- Clearly indicate supported formats.
- Display maximum file size.
- Show upload progress.
- Confirm successful uploads.
- Allow replacement before submission.

Example

Supported Formats

PDF, JPG, PNG

Maximum Size

10 MB

---

# Save Draft

Long forms should support draft saving.

Applicable workflows include:

- Business Permit Application
- Permit Renewal
- Business Registration

Users should be able to continue later without losing progress.

---

# Review Before Submission

Before submission, users should review all entered information.

The review screen should:

- Display a summary.
- Allow editing.
- Highlight missing information.
- Clearly present the Submit button.

---

# Submission Confirmation

Successful submissions should display:

- Confirmation message
- Reference Number
- Submission Date
- Next Steps

Example

Business Permit Application Submitted Successfully

Reference Number

BP-2026-001245

---

# Accessibility

Mobile forms shall:

- Meet WCAG 2.1 AA.
- Support screen readers.
- Maintain logical focus order.
- Use descriptive labels.
- Provide accessible validation.
- Maintain touch targets of at least 44 × 44 px.

Accessibility shall be maintained at every step of the form.

---

# Responsive Behavior

Small Phones

- Single-column layout
- Full-width controls
- Compact spacing

Large Phones

- Increased spacing
- Comfortable reading width

Tablets

- Expanded spacing
- Larger section padding
- Full-width controls

Form behavior should remain consistent across supported devices.

---

# Relationship to Other Standards

Mobile Forms support:

- Mobile Design Principles
- Mobile Layouts
- Touch Interactions
- UX Standards
- Form Experience
- Accessibility Standards

---

# AI Development Guidelines

AI-generated mobile forms must:

- Use approved Design System components.
- Maintain single-column layouts.
- Optimize for touch interaction.
- Display immediate validation.
- Preserve entered information.
- Support accessibility.
- Avoid unnecessary input fields.

AI should generate forms that prioritize speed, clarity, and successful task completion.

---

# Governance

All forms within the eBPCO mobile application shall comply with this specification.

Changes to form structure, validation behavior, or interaction patterns require approval from the UI/UX Team before implementation.

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platform

- Flutter Mobile Application

Status

Approved

Version

1.0.0