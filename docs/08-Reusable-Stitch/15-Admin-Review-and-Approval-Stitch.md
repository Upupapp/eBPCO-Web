# 15 – Admin Review and Approval Stitch

## Overview

The Admin Review and Approval Stitch defines the standardized workflow for evaluating business permit applications submitted through the Electronic Business Permit and Clearance Office (eBPCO).

This stitch documents how authorized personnel review applications, verify submitted information, communicate with applicants, and approve or reject permit requests. It establishes a consistent review process that promotes transparency, accountability, and efficiency.

---

# Objectives

The Admin Review module shall:

- Display all submitted applications.
- Allow authorized personnel to review applications.
- Verify applicant information and supporting documents.
- Approve or reject applications.
- Request additional requirements when necessary.
- Record all review activities.
- Prepare the workflow for backend implementation.

---

# User Roles

Authorized users:

- Administrator
- Permit Evaluator
- Reviewing Officer
- Department Head (Future)

Applicants have read-only access to the review status.

---

# Review Workflow

```text
Application Submitted
        │
        ▼
Application Received
        │
        ▼
Document Verification
        │
        ▼
Application Evaluation
        │
        ▼
Decision
   ┌───────────────┐
   ▼               ▼
Approved      Needs Revision
   │               │
   ▼               ▼
Payment      Applicant Updates
Verification      │
   │              ▼
   ▼        Resubmission
Approved           │
   │               │
   └───────┬───────┘
           ▼
     Final Approval
```

---

# Application Queue

The review dashboard displays:

- Reference Number
- Applicant Name
- Business Name
- Permit Type
- Submission Date
- Current Status
- Priority Level (Future)

Applications should be sortable and searchable.

---

# Review Information

Each application displays:

- Applicant Information
- Business Information
- Uploaded Documents
- Payment Information
- Previous Remarks
- Review History

---

# Document Verification

Reviewers can verify each uploaded document individually.

Possible results:

- Verified
- Needs Replacement
- Invalid Document

Each verification should include remarks.

---

# Review Actions

Available actions:

- Approve
- Reject
- Request Additional Requirements
- Return for Revision
- Save Review Progress

---

# Remarks

Every review action requires remarks.

Example

```
Please upload a clearer copy of your Business Permit.
```

Remarks should include:

- Date
- Reviewing Officer
- Action Taken
- Comment

---

# Approval

If an application meets all requirements:

- Approve Application
- Update Status
- Notify Applicant
- Continue to Permit Processing

---

# Rejection

Rejected applications shall include:

- Rejection Reason
- Review Date
- Reviewing Officer

Applicants should be able to view the rejection reason.

---

# Revision Request

If additional requirements are needed:

Display

```
Additional documents are required before your application can proceed.
```

Applicants may upload the requested documents and resubmit.

---

# Review History

Every review activity should be recorded.

Example

| Date | Officer | Action |
|------|---------|--------|
| July 21 | Maria Santos | Documents Verified |
| July 22 | Juan Reyes | Additional Requirements Requested |
| July 24 | Maria Santos | Application Approved |

---

# Search & Filters

Search by:

- Reference Number
- Applicant Name
- Business Name
- Permit Type

Filter by:

- Submitted
- Under Review
- Needs Revision
- Approved
- Rejected

Sort by:

- Newest
- Oldest
- Recently Updated

---

# Notifications

Applicants should automatically receive notifications when:

- Review begins
- Additional requirements are requested
- Application is approved
- Application is rejected

---

# Loading State

Display:

- Skeleton tables
- Loading cards
- Progress indicators

---

# Empty State

```
No applications available for review.
```

---

# Error State

```
Unable to load application data.

Please try again later.
```

---

# Security Requirements

The review module shall:

- Restrict access to authorized personnel.
- Record every review activity.
- Prevent unauthorized approval.
- Maintain complete audit logs.
- Protect applicant information.

---

# UI Components

Reusable components

- EBPCOApplicationTable
- EBPCOReviewCard
- EBPCODocumentViewer
- EBPCORemarksCard
- EBPCOStatusChip
- EBPCOApprovalDialog
- EBPCOConfirmationDialog
- EBPCOLoadingSkeleton

---

# Dependencies

This stitch interacts with:

- Authentication Stitch
- Permit Application Stitch
- Document Upload Stitch
- Payment Stitch
- Notification Stitch
- Application Tracking Stitch
- Backend Review Service

---

# Acceptance Criteria

- Applications are listed for review.
- Documents can be verified.
- Review remarks are recorded.
- Applications can be approved or rejected.
- Revision requests are supported.
- Review history is maintained.
- Search and filtering are available.
- Notifications are generated.
- Security requirements are documented.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- AI-assisted document verification.
- Automated compliance checking.
- Reviewer workload balancing.
- Digital signatures for approvals.
- Multi-level approval workflows.
- SLA monitoring and alerts.
- Analytics dashboard for processing performance.
- Bulk application review tools.