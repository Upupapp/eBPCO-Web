# Mobile Layouts

Version: 1.0.0
Status: Approved
Document Owner: UI/UX Team

Category: Mobile Guidelines

---

# Purpose

Mobile Layouts define the structural standards for arranging content within the Electronic Building Permit and Certificate of Occupancy (eBPCO) mobile application.

Consistent layouts improve usability, readability, and navigation while ensuring that users can efficiently complete government services across a wide range of mobile devices.

This specification applies to the Flutter Mobile Application.

---

# Objectives

Mobile layouts should:

- Prioritize important content.
- Support one-handed interaction.
- Maintain visual consistency.
- Adapt gracefully to different screen sizes.
- Improve readability.
- Reduce cognitive load.
- Preserve accessibility.

---

# Layout Principles

## Content First

The most important information should appear first.

Users should immediately see:

- Current task
- Primary action
- Important status
- Critical notifications

Secondary information should follow.

---

## Vertical Scrolling

Vertical scrolling is the preferred navigation pattern.

Avoid:

- Horizontal scrolling
- Nested scrolling
- Multi-directional scrolling

Users naturally expect vertical movement on mobile devices.

---

## Single Primary Focus

Each screen should have one primary objective.

Examples

- Apply for Permit
- View Application
- Upload Documents
- Make Payment

Avoid combining unrelated tasks on a single screen.

---

## Progressive Disclosure

Large amounts of information should be divided into manageable sections.

Example

Business Permit Application

↓

Business Information

↓

Owner Information

↓

Business Address

↓

Supporting Documents

↓

Review & Submit

Breaking information into steps improves completion rates.

---

# Layout Structure

A standard mobile screen should contain:

1. App Bar
2. Screen Title
3. Main Content
4. Primary Action
5. Optional Bottom Navigation

Content should follow a logical top-to-bottom hierarchy.

---

# Safe Areas

All layouts shall respect device safe areas.

Content must avoid:

- Display cutouts (notches)
- Camera holes
- Rounded corners
- System gesture areas
- Home indicator areas

No interactive element should be obstructed.

---

# Grid System

Layouts should use a consistent spacing grid.

Recommended base spacing:

8 px

Common spacing values:

- 8 px
- 16 px
- 24 px
- 32 px
- 48 px

Spacing should follow the Design System.

---

# Margins

Recommended horizontal margins:

Small Phones

16 px

Large Phones

20–24 px

Tablets

24–32 px

Margins should provide comfortable reading width.

---

# Content Width

Content should expand appropriately while maintaining readability.

Avoid:

- Extremely wide text blocks
- Full-width paragraphs on tablets
- Excessively narrow layouts

Readable line lengths improve comprehension.

---

# Cards

Cards should group related information.

Examples

Dashboard

- Permit Status
- Payment Status
- Notifications

Application Details

- Business Information
- Uploaded Documents
- Payment Summary

Cards should maintain consistent spacing and elevation.

---

# Lists

Lists should be used for:

- Applications
- Notifications
- Businesses
- Payments
- Documents

Each list item should contain:

- Primary information
- Secondary information
- Status
- Optional action

---

# Forms

Forms should use:

- Single-column layouts
- Full-width inputs
- Logical grouping
- Comfortable spacing

Multi-column forms should generally be avoided on mobile.

---

# Action Placement

Primary actions should remain easy to reach.

Examples

- Submit
- Continue
- Save Draft
- Pay Now

Primary actions should appear near the bottom of the content or as a sticky bottom action bar where appropriate.

Secondary actions should never compete visually with the primary action.

---

# Empty Space

Whitespace should be used intentionally to:

- Separate sections
- Improve readability
- Reduce visual clutter
- Highlight important information

Avoid overcrowded interfaces.

---

# Orientation

Portrait orientation is the primary design target.

Landscape mode should remain functional but should not introduce new workflows or alter navigation hierarchy.

---

# Accessibility

Layouts shall:

- Meet WCAG 2.1 AA.
- Maintain readable typography.
- Preserve logical reading order.
- Avoid overlapping elements.
- Support screen magnification.
- Ensure adequate spacing between interactive controls.

Layouts should remain usable at larger accessibility text sizes.

---

# Responsive Behavior

Small Phones

- Single-column layout
- Compact spacing
- Full-width controls

Large Phones

- Increased spacing
- Larger content areas
- Comfortable thumb reach

Tablets

- Expanded layouts
- Optional two-column sections where appropriate
- Increased whitespace

Responsive changes should preserve workflow consistency.

---

# Relationship to Other Standards

Mobile Layouts support:

- Mobile Design Principles
- Navigation Patterns
- Mobile Forms
- Responsive Behavior
- Design System
- UX Standards

---

# AI Development Guidelines

AI-generated mobile layouts must:

- Follow the approved spacing system.
- Prioritize essential content.
- Use single-column layouts by default.
- Preserve safe areas.
- Maintain accessibility.
- Optimize layouts for touch interaction.
- Reuse approved Design System components.

AI should prioritize clarity and usability over visual complexity.

---

# Governance

All mobile layouts within the eBPCO ecosystem shall comply with this specification.

Changes to layout structures, spacing standards, or content hierarchy require approval from the UI/UX Team before implementation.

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