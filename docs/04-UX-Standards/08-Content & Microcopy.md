# Content & Microcopy

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: UX Standards

---

# Purpose

Content & Microcopy establishes the writing standards for all user-facing text throughout the Electronic Business Permit and Clearance Office (eBPCO) ecosystem.

Well-written content helps users understand information quickly, complete tasks confidently, reduce errors, and build trust in the system. Every piece of text should be intentional, consistent, and easy to understand.

This specification applies to both the Angular Web Administration Portal and Flutter Mobile Application.

---

# Objectives

Content should:

- Be clear and concise.
- Use plain language.
- Maintain a professional government tone.
- Reduce ambiguity.
- Support accessibility.
- Guide users toward successful task completion.
- Remain consistent across all platforms.

---

# Writing Principles

## Clarity

Use language that is easy for all users to understand.

Preferred

Submit Application

Business Address

Payment Method

Avoid

Execute Submission

Business Location Information

Transaction Processing Option

---

## Simplicity

Write using the fewest words necessary.

Preferred

Save Draft

Avoid

Save Your Current Application Progress

Shorter text improves readability.

---

## Consistency

Use the same terminology throughout the application.

Example

Always use

Application

Never alternate with

Request

Submission

Form

Consistency reduces cognitive load.

---

## Action-Oriented Language

Buttons and actions should begin with verbs.

Examples

- Submit
- Save
- Continue
- Upload
- Download
- Print
- Cancel
- Review

Avoid vague labels such as:

- OK
- Next Screen
- Proceed Here

---

## Positive Language

Whenever possible, communicate positively.

Preferred

Your application has been submitted successfully.

Avoid

Submission completed.

Positive language increases user confidence.

---

# Tone of Voice

The eBPCO platform should maintain a tone that is:

- Professional
- Respectful
- Helpful
- Clear
- Neutral
- Trustworthy

The system should avoid humor, sarcasm, or overly casual language.

---

# Button Labels

Buttons should clearly describe the resulting action.

Preferred

- Submit Application
- Upload Document
- Save Draft
- View Receipt
- Download Permit

Avoid

- Click Here
- Continue
- Next
- Process

---

# Form Labels

Field labels should:

- Clearly identify the required information.
- Use sentence case.
- Avoid abbreviations where possible.

Examples

Business Name

Owner Name

Contact Number

Business Address

---

# Helper Text

Helper text should explain how to complete a field before errors occur.

Example

Business Name

Enter the registered business name exactly as shown on your DTI or SEC registration.

Helper text should remain concise.

---

# Error Messages

Error messages should:

- Explain the problem.
- Explain how to fix it.
- Avoid technical terminology.

Preferred

Please upload a PDF file smaller than 10 MB.

Avoid

Upload Error 500.

---

# Success Messages

Success messages should confirm completion and explain the next step.

Example

Application Submitted Successfully.

You may track your application using your reference number.

---

# Warning Messages

Warnings should explain potential consequences before users continue.

Example

You have unsaved changes.

Leaving this page will discard your progress.

---

# Empty State Content

Every empty state should answer:

- Why is there no information?
- What should the user do next?

Example

No permits found.

Start a new permit application to begin.

---

# Dates and Numbers

Dates should follow a consistent format.

Recommended

15 July 2026

Currency should follow Philippine Peso standards.

Example

₱1,250.00

Numbers should use thousands separators.

Example

12,500

---

# Capitalization

Use sentence case for:

- headings
- labels
- buttons
- helper text

Examples

Business information

Upload document

Payment details

Avoid unnecessary title case.

---

# Accessibility

Content shall:

- Meet WCAG 2.1 AA.
- Use descriptive language.
- Avoid jargon.
- Avoid relying on symbols alone.
- Remain understandable when read by screen readers.

Reading level should be appropriate for the general public.

---

# Localization

Content should support future localization.

Avoid:

- idioms
- slang
- culturally specific expressions

Use language that can be translated accurately.

---

# Responsive Behavior

Desktop

- Longer helper text when necessary.
- Multi-line descriptions.

Tablet

- Moderate text length.

Mobile

- Shorter labels.
- Concise helper text.
- Prioritize readability.
- Avoid excessive scrolling caused by lengthy text.

---

# Relationship to Other Standards

Content & Microcopy supports:

- Form Experience
- Error Handling & Recovery
- Feedback & System Status
- Accessibility Standards
- Mobile Guidelines
- Web Guidelines

---

# AI Development Guidelines

AI-generated content must:

- Follow the approved tone of voice.
- Use consistent terminology.
- Produce concise and actionable text.
- Avoid technical jargon.
- Maintain accessibility.
- Preserve approved business terminology.

AI should not invent new terminology or modify official government wording without approval.

---

# Governance

All user-facing text within the eBPCO ecosystem shall comply with this specification.

Changes to terminology, tone, or writing standards require approval from the UI/UX Team before implementation.

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