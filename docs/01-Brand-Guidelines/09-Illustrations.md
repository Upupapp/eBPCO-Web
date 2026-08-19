# 09 Illustrations

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

---

# Purpose

Illustrations enhance communication by visually representing application states, guidance, and feedback.

Within eBPCO, illustrations are used to support user understanding rather than decoration. They should reinforce the system's professional identity while making interactions more approachable.

Illustrations must never distract users from completing their tasks.

---

# Design Principles

All illustrations shall be:

- Minimal
- Professional
- Friendly
- Government appropriate
- Consistent
- Accessible

Avoid cartoon-like or overly playful illustrations.

---

# Illustration Style

Approved style:

- Flat design
- Soft color palette
- Simple geometric shapes
- Rounded edges
- Minimal details

Avoid:

- 3D artwork
- Comic illustrations
- Anime styles
- Heavy gradients
- Photorealistic artwork

---

# Illustration Categories

## Empty States

Used when no content exists.

Examples:

- No Applications
- No Notifications
- No Search Results
- No Documents
- No Reports

Each empty state should include:

- Illustration
- Title
- Description
- Primary action (if applicable)

---

## Success States

Used after successful actions.

Examples:

- Application Submitted
- Payment Successful
- Profile Updated
- Document Uploaded

Illustrations should communicate completion without overwhelming the interface.

---

## Error States

Used when an operation cannot be completed.

Examples:

- Network Error
- Upload Failed
- Page Not Found
- Server Error

Illustrations should reassure users and provide clear recovery guidance.

---

## Loading States

Loading illustrations should remain subtle.

Preferred methods:

- Skeleton screens
- Progress indicators
- Simple animated illustrations

Avoid long looping animations that distract users.

---

## Maintenance States

Displayed during scheduled maintenance or temporary downtime.

Include:

- Illustration
- Estimated availability (if known)
- Contact information (optional)

---

## Permission States

Used when users lack sufficient permissions.

Examples:

- Access Denied
- Restricted Module
- Administrator Only

Illustrations should remain neutral and informative.

---

# Color Usage

Illustrations must use only approved colors from the eBPCO Color Palette.

Avoid introducing unofficial colors.

---

# Size Guidelines

| Usage | Recommended Width |
|--------|------------------:|
| Empty State | 240–320px |
| Success State | 180–240px |
| Error State | 180–240px |
| Loading | 80–120px |
| Onboarding | 280–360px |

---

# Placement

Illustrations should appear:

- Centered horizontally
- Above supporting text
- Before the primary action button

Maintain generous whitespace around the illustration.

---

# Content Structure

Every illustration should be accompanied by:

1. Title
2. Supporting description
3. Primary action (optional)
4. Secondary action (optional)

Never display an illustration without explanatory text.

---

# Accessibility

Illustrations must:

- Include descriptive alternative text where applicable.
- Never be the sole means of conveying information.
- Maintain sufficient contrast.
- Support screen readers when used as meaningful content.

---

# Responsive Behaviour

Illustrations should scale proportionally across:

- Desktop
- Tablet
- Mobile

On smaller devices, prioritize content over artwork.

---

# Angular Implementation Notes

- Store illustrations as reusable assets.
- Use optimized SVG formats where possible.
- Reference illustrations through centralized asset paths.

---

# Flutter Implementation Notes

- Store illustrations in the application's asset directory.
- Use SVG assets when appropriate.
- Maintain consistent scaling across screen sizes.

---

# AI Generation Notes

When generating UI:

- Use illustrations only for approved scenarios.
- Never insert decorative artwork.
- Pair every illustration with meaningful text.
- Follow the approved illustration style.

---

# Governance

Any new illustration requires:

1. Design review
2. Documentation update
3. Approval
4. Asset registration
5. Implementation

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