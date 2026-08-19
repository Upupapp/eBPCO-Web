# Forms and Data Entry

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Web Guidelines

---

# Purpose

The Forms and Data Entry specification establishes the standards for designing and implementing forms within the Electronic Business Permit and Clearance Office (eBPCO) web application.

Forms are the primary mechanism through which citizens, business owners, and government personnel interact with the system. Well-designed forms improve efficiency, reduce errors, and increase successful transaction completion.

This specification applies to all responsive web portals, administrative systems, and internal management modules.

---

# Objectives

Forms should:

- Minimize user effort.
- Reduce data entry errors.
- Support efficient workflows.
- Maintain accessibility compliance.
- Provide immediate feedback.
- Preserve user-entered information.
- Improve completion rates.

---

# Form Design Principles

## Simplicity

Forms shall request only information required for the current business process.

Avoid:

- Duplicate fields
- Redundant questions
- Unnecessary confirmations
- Excessive scrolling

Every field must have a defined business purpose.

---

## Logical Organization

Fields shall be grouped according to related information.

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

- Barangay Clearance
- Fire Safety Certificate
- Sanitary Permit

Logical grouping improves readability and reduces cognitive load.

---

## Progressive Disclosure

Complex forms should reveal additional fields only when required.

Example

Payment Method

- Bank Transfer
- Onsite Payment

If Bank Transfer is selected:

Display

- Reference Number
- Upload Proof of Payment

Users should only see relevant information.

---

## Consistency

All forms shall maintain consistent:

- Labels
- Field spacing
- Validation behavior
- Required field indicators
- Button placement
- Success messages
- Error messages

Consistency improves user confidence.

---

# Form Layout

Desktop forms may use:

- Single-column layouts for simple workflows.
- Two-column layouts for complex forms where readability is preserved.

Forms should maintain:

- Consistent spacing
- Clear section headings
- Logical reading order

Multi-column layouts should never compromise usability.

---

# Labels

Every input field shall include a visible label.

Examples

Business Name

Business Address

Email Address

Avoid using placeholder text as the only field identifier.

---

# Helper Text

Helper text should provide guidance before users make mistakes.

Example

Business Name

Enter the registered business name exactly as shown on your DTI or SEC registration.

Helper text should be concise and informative.

---

# Required Fields

Required fields shall be clearly identified.

Recommended indicator

*

Example

Business Name *

Do not rely solely on color to indicate required fields.

---

# Input Controls

Select the appropriate control for each type of information.

Examples

Text Field

Business Name

Dropdown

Business Type

Date Picker

Registration Date

Checkbox

Terms and Conditions

Radio Button

Payment Method

File Upload

Supporting Documents

Appropriate controls reduce user errors.

---

# Keyboard Navigation

Forms shall fully support keyboard navigation.

Users should be able to:

- Move between fields using Tab.
- Navigate backward using Shift + Tab.
- Activate controls using Enter or Space where appropriate.
- Submit forms without requiring a mouse.

Keyboard accessibility is mandatory.

---

# Validation

Validation should occur as early as possible without disrupting the user.

Validation should:

- Explain the problem.
- Explain how to correct it.
- Preserve entered information.

Example

Please enter a valid email address.

Avoid technical or system-generated messages.

---

# File Uploads

File upload components shall display:

- Supported file formats
- Maximum file size
- Upload progress
- Successful upload confirmation
- Upload failure messages

Example

Supported Formats

PDF, JPG, PNG

Maximum File Size

10 MB

Users should be able to replace uploaded files before submission.

---

# Auto-Save

Long-running workflows should support automatic draft saving.

Applicable workflows include:

- New Business Permit Application
- Permit Renewal
- Business Registration
- Business Profile Updates

Users should not lose progress due to accidental page closure or session interruption.

---

# Review Before Submission

Complex workflows should include a review step.

The review page should:

- Summarize entered information.
- Highlight missing or invalid fields.
- Allow users to edit sections.
- Clearly identify the final submission action.

Review screens reduce submission errors.

---

# Submission Confirmation

Successful submissions shall display:

- Confirmation message
- Transaction reference number
- Submission date and time
- Next steps
- Expected processing timeline

Example

Business Permit Application Submitted Successfully

Reference Number

BP-2026-001245

Users should be able to print or download confirmation details.

---

# Error Recovery

If submission fails:

- Preserve all entered data.
- Explain the reason for failure.
- Provide retry options.
- Identify affected fields if applicable.

Users should never need to re-enter previously completed information.

---

# Accessibility

Forms shall comply with WCAG 2.1 Level AA.

Requirements include:

- Visible labels
- Logical focus order
- Keyboard accessibility
- Screen reader compatibility
- Accessible validation messages
- Sufficient color contrast
- Proper semantic markup

Accessibility shall be incorporated into every form.

---

# Responsive Behavior

Forms should adapt appropriately to different screen sizes.

Desktop

- One or two-column layouts

Tablet

- Reduced spacing
- Larger controls

Mobile Web

- Single-column layout
- Full-width inputs
- Optimized touch targets

Form functionality shall remain consistent across devices.

---

# Relationship to Other Standards

Forms and Data Entry support:

- Web Design Principles
- Layouts and Grid
- Navigation Patterns
- Responsive Web
- Web Accessibility
- Design System
- UX Standards

---

# AI Development Guidelines

AI-generated forms must:

- Use approved Design System components.
- Maintain logical field organization.
- Generate accessible forms.
- Preserve user-entered data.
- Provide immediate validation.
- Optimize keyboard navigation.
- Support responsive layouts.

AI should generate forms that maximize usability, accuracy, and efficiency while meeting enterprise government standards.

---

# Governance

All forms within the eBPCO web application shall comply with this specification.

Changes to form structure, validation behavior, or interaction patterns require approval from the UI/UX Team before implementation.

---

# Approval

Project

Electronic Business Permit and Clearance Office (eBPCO)

Platform

- Responsive Web Application
- Administrative Portal
- Public Portal

Status

Approved

Version

1.0.0