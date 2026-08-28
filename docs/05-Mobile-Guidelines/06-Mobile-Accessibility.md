# Mobile Accessibility

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Mobile Guidelines

---

# Purpose

Mobile Accessibility defines the standards for ensuring that the Electronic Building Permit and Certificate of Occupancy (eBPCO) mobile application is usable by everyone, including persons with disabilities (PWDs), senior citizens, users with temporary impairments, and users with varying levels of digital literacy.

Accessibility shall be considered a fundamental design and development requirement throughout the Flutter Mobile Application.

---

# Objectives

Mobile accessibility should:

- Ensure equal access to government services.
- Comply with WCAG 2.1 Level AA.
- Support Android accessibility services.
- Improve usability for all users.
- Support assistive technologies.
- Reduce barriers during task completion.
- Maintain accessibility across all devices.

---

# Accessibility Principles

The eBPCO mobile application follows the four WCAG accessibility principles:

## Perceivable

Information must be presented in ways users can perceive.

Examples

- High color contrast
- Descriptive icons
- Readable typography
- Alternative text
- Visible labels

---

## Operable

Users must be able to operate every feature regardless of input method.

Examples

- Touch
- External keyboard
- Screen readers
- Voice access
- Switch devices

No essential feature shall depend on a single interaction method.

---

## Understandable

Interfaces should be predictable and easy to understand.

Examples

- Consistent navigation
- Clear instructions
- Helpful validation
- Plain language
- Familiar interaction patterns

---

## Robust

The application shall remain compatible with current and future assistive technologies.

Examples

- Flutter Semantics
- Android TalkBack
- Voice Access
- Screen Magnification
- Accessibility APIs

---

# Compliance

The mobile application shall comply with:

- WCAG 2.1 Level AA
- Android Accessibility Guidelines
- Flutter Accessibility Best Practices

Future updates should consider WCAG 2.2 recommendations.

---

# Touch Targets

Minimum touch target

44 × 44 px

Recommended touch target

48 × 48 px

Touch targets include:

- Buttons
- Icons
- Switches
- Checkboxes
- Radio Buttons
- Navigation Items
- Floating Action Buttons

Spacing between controls should prevent accidental activation.

---

# Typography

Text shall remain readable.

Recommended minimum sizes

Body Text

16 px

Secondary Text

14 px

Headings

20–32 px

Users should be able to increase text size using system accessibility settings without breaking layouts.

---

# Color and Contrast

Color shall never be the only method of communicating information.

Minimum contrast ratios

Normal Text

4.5 : 1

Large Text

3 : 1

Interactive Elements

3 : 1 minimum

Examples

Good

✔ Approved

Bad

Green icon only

Status should include text and icons.

---

# Screen Reader Support

Every interactive element shall include meaningful accessibility labels.

Examples

Good

Submit Business Permit Application

Bad

Button

Icons performing actions shall include semantic descriptions.

---

# Forms

Accessible forms shall include:

- Visible labels
- Required field indicators
- Helper text
- Descriptive validation messages
- Programmatically associated labels

Placeholder text shall never replace labels.

---

# Images

Meaningful images shall include alternative descriptions.

Decorative images shall be ignored by screen readers.

Government logos should include descriptive accessibility labels.

---

# Navigation

Navigation shall:

- Follow a logical order.
- Remain consistent.
- Support screen readers.
- Support keyboard navigation when external keyboards are used.

Users should always understand where they are within the application.

---

# Motion

Animations should:

- Respect reduced-motion settings.
- Avoid excessive movement.
- Support users with vestibular disorders.

Essential information shall never depend solely on animation.

---

# Time Limits

Where workflows include time limits:

- Notify users before expiration.
- Allow extension where appropriate.
- Preserve user-entered information.

Users should never lose progress unexpectedly.

---

# Error Messages

Errors shall:

- Be announced by screen readers.
- Clearly explain the issue.
- Describe recovery steps.
- Preserve user-entered data.

Example

Please upload a PDF file smaller than 10 MB.

---

# Device Accessibility Features

The application should support:

- Android TalkBack
- Voice Access
- Screen Magnification
- High Contrast Mode
- Large Font Sizes
- Color Correction
- Accessibility Shortcuts

---

# Accessibility Testing

Accessibility should be validated using:

Manual Testing

- Keyboard navigation
- Screen reader testing
- Large text testing
- High contrast verification

Automated Testing

- Flutter accessibility analysis
- Semantic tree validation
- Contrast analysis
- Accessibility linting

Accessibility testing shall be included in every release cycle.

---

# Relationship to Other Standards

Mobile Accessibility supports:

- Mobile Design Principles
- Mobile Layouts
- Touch Interactions
- Mobile Forms
- Accessibility Standards
- Responsive UX

---

# AI Development Guidelines

AI-generated mobile interfaces must:

- Comply with WCAG 2.1 AA.
- Generate semantic widgets.
- Preserve accessibility labels.
- Support TalkBack.
- Maintain readable typography.
- Use approved color contrast ratios.
- Avoid gesture-only interactions.
- Preserve accessible navigation order.

Accessibility shall never be sacrificed for visual design.

---

# Governance

All mobile interfaces within the eBPCO ecosystem shall comply with this Mobile Accessibility specification.

Accessibility compliance shall be verified before production deployment.

Exceptions require documented approval from the UI/UX Team and Project Management.

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