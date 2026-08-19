# Web Accessibility

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Web Guidelines

---

# Purpose

The Web Accessibility specification establishes the standards for creating inclusive and accessible web interfaces within the Electronic Business Permit and Clearance Office (eBPCO) platform.

Accessibility ensures that all users—including persons with disabilities (PWDs), senior citizens, users with temporary impairments, and users with varying levels of digital literacy—can effectively access and use government digital services.

This specification applies to all responsive web applications, administrative portals, and public-facing websites within the eBPCO ecosystem.

---

# Objectives

Web accessibility should:

- Ensure equal access to digital government services.
- Comply with WCAG 2.1 Level AA.
- Support assistive technologies.
- Improve usability for all users.
- Remove barriers to completing transactions.
- Maintain accessibility across supported browsers and devices.
- Encourage inclusive design practices throughout development.

---

# Accessibility Principles

The eBPCO web platform follows the four principles of WCAG.

## Perceivable

Information and user interface components shall be presented in ways that users can perceive.

Examples

- Readable typography
- High color contrast
- Alternative text for images
- Captions where applicable
- Clear labels
- Visible focus indicators

No important information shall rely solely on visual presentation.

---

## Operable

Every interface component shall be operable using multiple input methods.

Supported methods include:

- Keyboard
- Mouse
- Touch
- Screen Readers
- Voice Navigation

Users shall not be required to perform complex gestures or use a pointing device.

---

## Understandable

Interfaces should be easy to understand and predictable.

Examples

- Consistent navigation
- Plain language
- Helpful instructions
- Meaningful error messages
- Predictable interaction patterns

Users should understand what actions are available and what will happen after each interaction.

---

## Robust

Interfaces shall remain compatible with current and future assistive technologies.

Examples include:

- Screen Readers
- Browser Accessibility APIs
- Voice Control Software
- Magnification Tools

Semantic HTML and ARIA should be used appropriately.

---

# Compliance

All web interfaces shall comply with:

- WCAG 2.1 Level AA
- WAI-ARIA Authoring Practices
- HTML Accessibility Standards
- Applicable Philippine accessibility regulations where required

Future updates should consider WCAG 2.2 recommendations.

---

# Keyboard Accessibility

Every interactive element shall be fully operable using a keyboard.

Users should be able to:

- Navigate using Tab
- Move backward using Shift + Tab
- Activate controls using Enter or Space
- Close dialogs using Escape where appropriate

Keyboard traps shall never occur.

---

# Focus Management

Visible keyboard focus indicators shall be maintained throughout the application.

Focus should:

- Be clearly visible.
- Follow logical reading order.
- Move appropriately after dialogs or navigation changes.
- Never disappear unexpectedly.

Programmatic focus management should support dynamic interfaces.

---

# Typography

Typography shall prioritize readability.

Recommended minimum sizes

Body Text

16 px

Secondary Text

14 px

Headings

20–32 px

Text shall remain readable when browser zoom is increased to 200%.

---

# Color and Contrast

Color shall never be the sole method of communicating information.

Minimum contrast ratios

Normal Text

4.5 : 1

Large Text

3 : 1

Interactive Components

3 : 1 minimum

Examples

Good

✔ Approved

Bad

Green badge only

Status should always include descriptive text.

---

# Images

Meaningful images shall include alternative text.

Alternative text should:

- Describe the image purpose.
- Convey equivalent information.
- Remain concise.

Decorative images should use empty alternative text.

---

# Icons

Icons representing actions shall include accessible labels.

Example

Good

Download Permit

Bad

Icon only

Icons shall not replace descriptive text for critical actions.

---

# Forms

Accessible forms shall include:

- Visible labels
- Required field indicators
- Helper text
- Accessible validation
- Logical focus order
- Proper input associations

Placeholder text shall never replace field labels.

---

# Tables

Accessible tables shall include:

- Semantic table structure
- Header associations
- Descriptive captions where appropriate
- Keyboard accessibility
- Screen reader compatibility

Complex tables should provide summaries when necessary.

---

# Navigation

Navigation shall support:

- Keyboard navigation
- Skip to Content links
- Screen readers
- Logical menu order
- Descriptive navigation labels

Users should always know their current location.

---

# Links

Links should clearly describe their destination.

Good

Download Business Permit

Bad

Click Here

Links should remain distinguishable from surrounding text.

---

# Error Messages

Error messages shall:

- Clearly explain the problem.
- Describe how to correct it.
- Be announced by screen readers.
- Preserve entered information.

Technical error messages should never be displayed directly to users.

---

# Notifications

Notifications shall:

- Be announced to assistive technologies.
- Remain readable.
- Avoid relying solely on color.
- Provide clear actions where applicable.

Users should not miss important updates.

---

# Motion and Animation

Animations should:

- Respect reduced-motion preferences.
- Avoid excessive movement.
- Never convey essential information exclusively through animation.

Users sensitive to motion should remain comfortable using the application.

---

# Accessibility Testing

Accessibility testing shall include:

Manual Testing

- Keyboard Navigation
- Screen Reader Testing
- Browser Zoom
- Color Contrast
- Focus Indicators

Automated Testing

- Accessibility Audits
- HTML Validation
- ARIA Validation
- Contrast Analysis

Accessibility testing shall be mandatory before production deployment.

---

# Responsive Accessibility

Accessibility requirements apply equally across:

- Desktop
- Laptop
- Tablet
- Mobile Browser

Responsive behavior shall never reduce accessibility.

---

# Relationship to Other Standards

Web Accessibility supports:

- Web Design Principles
- Responsive Web
- Forms and Data Entry
- Navigation Patterns
- Dashboard Guidelines
- Design System
- UX Standards

---

# AI Development Guidelines

AI-generated web interfaces must:

- Comply with WCAG 2.1 Level AA.
- Generate semantic HTML.
- Preserve keyboard accessibility.
- Support screen readers.
- Maintain proper color contrast.
- Include accessible form controls.
- Avoid inaccessible interaction patterns.

AI should generate interfaces that are inclusive, accessible, and suitable for public government services.

---

# Governance

All web interfaces within the eBPCO platform shall comply with this Web Accessibility specification.

Accessibility compliance shall be verified during design reviews, development, quality assurance, and before every production release.

Exceptions require documented approval from the UI/UX Team and Project Management.

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