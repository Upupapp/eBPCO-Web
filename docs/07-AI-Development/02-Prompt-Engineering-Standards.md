# Prompt Engineering Standards

Version: 1.0.0
Status: Approved
Document Owner: Development Team

Category: AI Development

---

# Purpose

The Prompt Engineering Standards establish a consistent methodology for creating prompts used with Artificial Intelligence (AI) systems during the development of the Electronic Building Permit and Certificate of Occupancy (eBPCO) platform.

Well-structured prompts improve output quality, reduce ambiguity, minimize hallucinations, and ensure AI-generated artifacts align with project standards.

These standards apply to every AI interaction used during software development, documentation, testing, design, planning, and maintenance.

---

# Objectives

Prompt engineering should:

- Produce accurate outputs.
- Minimize ambiguity.
- Improve consistency.
- Reduce unnecessary revisions.
- Encourage reusable prompts.
- Preserve project standards.
- Improve development efficiency.
- Maintain human oversight.

---

# Prompt Engineering Principles

## Clarity

Prompts shall communicate the request using precise and unambiguous language.

A prompt should clearly specify:

- Objective
- Expected output
- Constraints
- Context
- Audience

Avoid vague instructions.

Poor Example

Create a login page.

Improved Example

Create an Angular standalone login page using Angular Material, responsive design, WCAG 2.1 AA compliance, and the approved eBPCO Design System.

---

## Context

Every prompt should provide sufficient project context.

Context may include:

- Platform
- Framework
- Target users
- Existing architecture
- Design standards
- Business rules
- Technology stack

AI should never be expected to infer critical project requirements.

---

## Specificity

Prompts should define measurable expectations.

Examples include:

- Programming language
- Framework
- File structure
- Component architecture
- Naming conventions
- Documentation format
- Performance expectations

Greater specificity generally results in higher-quality outputs.

---

## Constraints

Every prompt should identify applicable constraints.

Examples

Technology

- Angular
- Flutter
- Node.js

Design

- Material Design
- eBPCO Design System

Accessibility

- WCAG 2.1 Level AA

Coding

- TypeScript
- SOLID principles
- Clean Architecture

Constraints reduce inconsistent outputs.

---

## Reusability

Frequently used prompts should be designed as reusable templates.

Reusable prompts improve:

- Team consistency
- Documentation quality
- Development speed
- AI reliability

Templates should be maintained alongside project documentation.

---

# Standard Prompt Structure

A standard development prompt should contain:

1. Objective
2. Background
3. Project Context
4. Technical Requirements
5. Constraints
6. Expected Output
7. Acceptance Criteria

Using a consistent structure improves AI response quality.

---

# Project Context

Prompts should identify relevant project information.

Examples

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Frontend

Angular

Mobile

Flutter

Backend

REST API

Design

Angular Material

Documentation

Enterprise Markdown

Including project context reduces incorrect assumptions.

---

# Output Requirements

Prompts should explicitly define the desired output.

Examples

- Source code
- Documentation
- Architecture diagrams
- Unit tests
- UI wireframes
- SQL scripts
- API specifications

The required output format should always be stated.

---

# Coding Prompts

Coding prompts should specify:

- Programming language
- Framework
- Folder structure
- Coding standards
- Error handling
- Documentation expectations
- Testing requirements

Example

Generate an Angular standalone component using Angular Material, reactive forms, TypeScript strict mode, and project coding standards.

---

# UI Generation Prompts

UI prompts should define:

- Target platform
- Layout
- Components
- Accessibility
- Responsiveness
- Branding
- User roles

Generated interfaces shall follow the approved Design System.

---

# Documentation Prompts

Documentation prompts should specify:

- Document type
- Markdown format
- Required sections
- Intended audience
- Enterprise writing style
- Version information

Documentation should remain consistent throughout the project.

---

# Testing Prompts

Testing prompts should identify:

- Test framework
- Coverage expectations
- Edge cases
- Accessibility validation
- Performance considerations

Generated tests should reflect real business workflows.

---

# Refactoring Prompts

Refactoring prompts should identify:

- Existing limitations
- Desired improvements
- Backward compatibility
- Coding standards
- Performance goals

Refactoring should preserve existing functionality unless otherwise specified.

---

# Review Prompts

Code review prompts should request evaluation of:

- Correctness
- Security
- Accessibility
- Maintainability
- Performance
- Documentation
- Best practices

AI reviews supplement but do not replace human code reviews.

---

# Prompt Validation

Before using a prompt, developers should verify:

- Clear objective
- Sufficient context
- Explicit constraints
- Defined output
- Acceptance criteria
- Relevant project standards

Incomplete prompts increase the likelihood of inaccurate results.

---

# Prompt Management

The project should maintain a repository of approved prompt templates.

Templates should be:

- Version controlled
- Reviewed regularly
- Shared across the development team
- Updated as project standards evolve

Prompt reuse promotes consistency and efficiency.

---

# Relationship to Other Standards

Prompt Engineering Standards support:

- AI Development Principles
- AI Coding Standards
- AI Documentation Standards
- AI Testing Guidelines
- Design System
- UX Standards
- Mobile Guidelines
- Web Guidelines

---

# Governance

All prompts used for AI-assisted development within the eBPCO platform shall follow these standards.

Approved prompt templates shall be maintained by the Development Team and reviewed periodically to ensure alignment with evolving AI capabilities and project requirements.

---

# Approval

Project

Electronic Building Permit and Certificate of Occupancy (eBPCO)

Platform

- Responsive Web Application
- Flutter Mobile Application
- Backend Services

Status

Approved

Version

1.0.0