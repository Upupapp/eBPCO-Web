# 04 Typography

Version: 1.0.0  
Status: Approved  
Document Owner: UI/UX Team

---

# Purpose

Typography is one of the primary elements of the eBPCO visual identity. It establishes readability, hierarchy, consistency, and professionalism across all interfaces.

The typography system must be applied consistently throughout both the Angular Web Administration Portal and the Flutter Mobile Application.

No page or component should introduce a custom typography style outside of this specification.

---

# Typography Principles

The typography system is designed to achieve the following goals:

- Excellent readability
- Clear visual hierarchy
- Professional government appearance
- Cross-platform consistency
- Accessibility compliance
- Responsive scaling

---

# Font Family

The official font family shall be the font used by the approved eBPCO interface.

If future changes are required, they must be documented and approved before implementation.

Fallback order:

```
Primary Font
System UI
Arial
Helvetica
Sans-serif
```

---

# Font Weights

| Weight | Usage |
|---------|------|
| Light (300) | Rarely used |
| Regular (400) | Body text |
| Medium (500) | Labels |
| SemiBold (600) | Section titles |
| Bold (700) | Main headings |

Extra Bold should be avoided except for marketing materials.

---

# Typography Scale

## Display

Purpose

Landing pages

Marketing

Large dashboard titles

Desktop

48px

Tablet

42px

Mobile

36px

Weight

700

---

## Heading 1

Purpose

Main page titles

Desktop

32px

Tablet

30px

Mobile

28px

Weight

700

---

## Heading 2

Purpose

Section titles

Desktop

28px

Tablet

26px

Mobile

24px

Weight

600

---

## Heading 3

Purpose

Cards

Forms

Dashboard widgets

Desktop

24px

Tablet

22px

Mobile

20px

Weight

600

---

## Heading 4

Purpose

Cards

Tables

Panels

Desktop

20px

Tablet

20px

Mobile

18px

Weight

600

---

## Heading 5

Desktop

18px

Tablet

18px

Mobile

16px

Weight

600

---

## Heading 6

Desktop

16px

Tablet

16px

Mobile

16px

Weight

600

---

## Body Large

Desktop

16px

Tablet

16px

Mobile

16px

Weight

400

Usage

Primary reading content

---

## Body

Desktop

14px

Tablet

14px

Mobile

14px

Weight

400

Usage

Forms

Tables

Descriptions

General content

---

## Small Text

Desktop

12px

Tablet

12px

Mobile

12px

Usage

Supporting information

Helper text

Metadata

---

## Caption

Desktop

11px

Tablet

11px

Mobile

11px

Usage

Image captions

Footnotes

System information

---

# Button Typography

Buttons should use:

Weight

600

Desktop

14px

Mobile

14px

Text should use sentence case.

Examples:

```
Submit Application
```

Not:

```
SUBMIT APPLICATION
```

---

# Form Typography

Labels

14px

Weight

500

Placeholder

14px

Weight

400

Helper Text

12px

Weight

400

Validation Messages

12px

Weight

500

---

# Table Typography

Header

14px

Weight

600

Body

14px

Weight

400

Footer

12px

Weight

400

---

# Navigation Typography

Sidebar

14px

Weight

500

Top Navigation

14px

Weight

500

Breadcrumb

13px

Weight

400

---

# Card Typography

Statistic Number

32px

Weight

700

Statistic Label

14px

Weight

500

Description

12px

Weight

400

---

# Line Height

Recommended:

120%

Large headings

140%

Body text

150%

Long paragraphs

---

# Letter Spacing

Default

0

Headings

0

Body

0

Buttons

0.2px

Do not introduce decorative spacing.

---

# Text Alignment

Default

Left

Numbers

Right (within tables)

Statistics

Center or Left depending on layout

Avoid justified text.

---

# Accessibility

Minimum body text:

14px

Minimum contrast:

WCAG AA compliant

Avoid:

- Extremely thin fonts
- Decorative fonts
- Low contrast text
- Excessive uppercase text

---

# Responsive Behaviour

Typography should scale proportionally between desktop, tablet, and mobile while maintaining hierarchy.

Never reduce body text below 14px for standard reading content.

---

# Developer Guidelines

Angular

Typography values should be implemented through shared SCSS variables or design tokens.

Flutter

Typography should be defined in ThemeData using centralized TextTheme definitions.

Developers must not hardcode typography values within individual components.

---

# Governance

Any typography change requires:

1. Design review
2. Documentation update
3. Approval
4. Component update
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