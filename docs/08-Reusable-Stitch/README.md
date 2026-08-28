# Reusable Stitch

Version: 1.0.0  
Status: Draft  
Document Owner: UI/UX Team and Development Team

Category: Application Blueprint

---

# Purpose

The Reusable Stitch documentation defines the complete reusable interface blueprint for the Electronic Building Permit and Certificate of Occupancy (eBPCO) platform.

It connects the project's Brand Guidelines, Design System, Component Library, UX Standards, Mobile Guidelines, Web Guidelines, and AI Development Standards into one implementation-ready structure.

The Reusable Stitch serves as the primary reference for designing and generating consistent screens across the eBPCO web and mobile applications.

---

# Objectives

The Reusable Stitch should:

- Define the complete application screen structure.
- Map user roles to available features.
- Standardize reusable screen layouts.
- Define reusable page sections and UI patterns.
- Document navigation between screens.
- Maintain consistency across web and mobile platforms.
- Reduce duplicate UI implementation.
- Support AI-assisted UI generation.
- Provide implementation-ready screen specifications.
- Ensure alignment with the approved Design System.

---

# What Is a Reusable Stitch?

A Reusable Stitch is a structured collection of reusable:

- Screen templates
- Layout patterns
- Navigation structures
- User flows
- Form sections
- Dashboard sections
- Status states
- Role-based experiences
- Mobile and web adaptations

Instead of designing every screen independently, the project uses reusable screen patterns that can be adapted to multiple workflows.

For example, the same application form layout may be reused for:

- New business permit applications
- Permit renewals
- Permit amendments
- Clearance applications

Only the required fields, steps, and business rules change.

---

# Reusable Stitch Principles

## Reuse Before Creation

Existing layouts, components, and patterns shall be reused before new ones are introduced.

---

## Design System Alignment

All reusable stitches shall use the approved:

- Colors
- Typography
- Spacing
- Icons
- Components
- Status colors
- Accessibility rules

---

## Platform Consistency

Web and mobile interfaces should provide the same core functionality while adapting to the capabilities and constraints of each platform.

---

## Role-Based Design

Screens and actions shall be displayed according to the permissions and responsibilities of each user role.

---

## Responsive by Default

Every reusable stitch shall define its behavior for:

- Desktop
- Tablet
- Mobile

---

## State Completeness

Each reusable stitch shall define:

- Default state
- Loading state
- Empty state
- Success state
- Warning state
- Error state
- Disabled state
- Offline state where applicable

---

# Documentation Structure

```text
docs/
└── 08-Reusable-Stitch/
    ├── README.md
    ├── 01-Stitch-Principles.md
    ├── 02-User-Roles.md
    ├── 03-Application-Map.md
    ├── 04-Screen-Inventory.md
    ├── 05-Navigation-Stitch.md
    ├── 06-Authentication-Stitch.md
    ├── 07-Onboarding-Stitch.md
    ├── 08-Dashboard-Stitch.md
    ├── 09-Permit-Application-Stitch.md
    ├── 10-Permit-Renewal-Stitch.md
    ├── 11-Permit-Amendment-Stitch.md
    ├── 12-Document-Upload-Stitch.md
    ├── 13-Payment-Stitch.md
    ├── 14-Application-Tracking-Stitch.md
    ├── 15-Notification-Stitch.md
    ├── 16-Profile-and-Settings-Stitch.md
    ├── 17-Admin-Management-Stitch.md
    ├── 18-Review-and-Approval-Stitch.md
    ├── 19-Reports-Stitch.md
    ├── 20-Shared-State-Stitch.md
    ├── 21-Mobile-Web-Mapping.md
    ├── 22-Component-Mapping.md
    ├── 23-Permissions-Matrix.md
    ├── 24-Stitch-Prompt-Template.md
    └── 25-Implementation-Checklist.md
```

---

# Core Reusable Stitches

The eBPCO platform shall include reusable stitches for:

- Authentication
- User onboarding
- Dashboard layouts
- Business permit applications
- Permit renewals
- Permit amendments
- Document uploads
- Payment selection
- Payment receipt display
- Application tracking
- Notifications
- User profiles
- Administrative management
- Application review
- Permit approval
- Reports and analytics

---

# Standard Stitch Specification

Each reusable stitch document should define:

## Name

The official name of the stitch.

## Purpose

The user problem or workflow addressed by the stitch.

## Supported Roles

The users permitted to access the stitch.

## Platforms

The platforms where the stitch is available.

Examples:

- Web
- Mobile
- Both

## Entry Points

The screens, menus, links, or actions that open the stitch.

## Screen Structure

The major sections displayed within the screen.

## Components

The approved components used by the stitch.

## User Actions

The actions users can perform.

## Validation

The rules applied to user input and workflow progression.

## Navigation

The previous, next, cancel, and exit behavior.

## States

The expected loading, empty, success, warning, and error states.

## Permissions

The access restrictions applied to the stitch.

## Responsive Behavior

The behavior across desktop, tablet, and mobile layouts.

## Accessibility

The accessibility requirements for interaction and content.

## Reuse Rules

The situations where the stitch should be reused or extended.

---

# Supported User Roles

The Reusable Stitch documentation shall support role-based experiences for:

- Business Owner
- Business Representative
- Evaluator
- Inspector
- Payment Officer
- Approving Officer
- Administrator
- Super Administrator

Each role shall receive only the screens, actions, and information required for its responsibilities.

---

# Web and Mobile Alignment

The same business workflows shall be represented consistently across web and mobile applications.

## Shared Functionality

Both platforms should support:

- Authentication
- Permit application
- Permit renewal
- Permit amendment
- Document upload
- Payment method selection
- Application tracking
- Notifications
- Profile management

## Web-Specific Functionality

The web application may provide:

- Advanced data tables
- Bulk operations
- Administrative dashboards
- Detailed reports
- Complex review workflows

## Mobile-Specific Functionality

The mobile application may provide:

- Camera-based document capture
- Push notifications
- Mobile-friendly step forms
- Simplified application tracking
- Touch-optimized navigation

---

# Relationship to Other Documentation

The Reusable Stitch documentation shall follow and reference:

- `01-Brand-Guidelines`
- `02-Design-System`
- `03-Component-Library`
- `04-UX-Standards`
- `05-Mobile-Guidelines`
- `06-Web-Guidelines`
- `07-AI-Development`

The Reusable Stitch does not replace these standards. It translates them into application-specific screens, flows, and implementation patterns.

---

# AI-Assisted Usage

The Reusable Stitch may be used as structured context for AI tools such as:

- Claude Code
- ChatGPT
- Google Stitch
- GitHub Copilot
- Other approved AI development tools

AI-generated interfaces shall follow the documented stitch specifications and shall not introduce unapproved components, layouts, or workflows.

---

# Asset Usage

Only essential visual assets should be included.

Examples include:

- Official logo
- App icon
- Welcome screen reference
- Dashboard reference
- Permit application reference
- Architecture diagrams
- User flow diagrams

Reusable stitches should primarily be documented through text, component references, structured layouts, and flow descriptions.

---

# Governance

All reusable stitches shall be reviewed by the UI/UX Team, Development Team, and relevant business stakeholders before implementation.

Changes to reusable stitches shall be documented, version-controlled, and synchronized with the implemented application.

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platforms

- Responsive Web Application
- Flutter Mobile Application

Status

Draft

Version

1.0.0