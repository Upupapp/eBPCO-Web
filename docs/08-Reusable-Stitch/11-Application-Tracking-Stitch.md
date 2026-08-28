# 11 – Application Tracking Stitch

## Overview

The Application Tracking Stitch defines the standardized workflow for monitoring the progress of permit applications submitted through the Electronic Building Permit and Certificate of Occupancy (eBPCO).

This module provides applicants with real-time visibility into their application status, processing stages, remarks, and history, reducing uncertainty and minimizing unnecessary office visits.

---

# Objectives

The Application Tracking module shall:

- Display the current application status.
- Show the complete application timeline.
- Allow users to monitor processing progress.
- Display remarks from reviewing personnel.
- Notify applicants of status changes.
- Prepare tracking data for backend synchronization.

---

# Tracking Flow

```text
Application Submitted
        │
        ▼
Application Received
        │
        ▼
Under Initial Review
        │
        ▼
Document Verification
        │
        ▼
Payment Verification
        │
        ▼
Final Evaluation
        │
        ▼
Approved / Rejected
        │
        ▼
Permit Ready for Release
```

---

# Tracking Dashboard

Each tracked application displays:

- Application Reference Number
- Permit Type
- Submission Date
- Current Status
- Estimated Processing Time
- Assigned Office (Future)

---

# Status Timeline

Every application should display a vertical timeline.

Example

```text
✓ Submitted

✓ Documents Received

✓ Under Review

● Payment Verification

○ Final Evaluation

○ Permit Ready
```

Completed stages should be visually distinguished from pending stages.

---

# Standard Statuses

Available statuses include:

- Draft
- Submitted
- Received
- Under Review
- Additional Requirements Requested
- Payment Required
- Payment Verification
- Approved
- Rejected
- Ready for Release
- Completed

Status names should remain consistent throughout the application.

---

# Status Details

Selecting an application displays:

- Current Status
- Processing Stage
- Date Updated
- Officer Remarks
- Submitted Documents
- Payment Status
- Processing History

---

# Processing History

The application history records every significant event.

Example

| Date | Activity |
|------|----------|
| July 20 | Application Submitted |
| July 21 | Documents Verified |
| July 22 | Payment Requested |

Future enhancement:

- Officer name
- Office location
- Estimated completion updates

---

# Officer Remarks

Authorized personnel may provide remarks such as:

```
Please upload a clearer copy of your Barangay Clearance.
```

or

```
Your application is now undergoing final evaluation.
```

Remarks should always include:

- Date
- Status
- Message

---

# Search Tracking

Users should be able to search applications using:

- Tracking Number
- Permit Type
- Business Name

Future enhancement:

- QR Code search

---

# Filter Options

Available filters:

- All
- Pending
- Under Review
- Approved
- Rejected
- Completed

Sorting options:

- Newest First
- Oldest First
- Recently Updated

---

# Notifications

Whenever the application status changes, the user should receive a notification.

Examples:

```
Your application is now Under Review.
```

```
Payment has been verified.
```

```
Your permit is ready for release.
```

---

# Empty State

If no applications exist:

```
No applications found.

Apply for a permit to start tracking.
```

---

# Loading State

Display:

- Skeleton cards
- Timeline placeholders
- Progress indicators

Avoid blank screens.

---

# Error State

If tracking information cannot be loaded:

```
Unable to retrieve application status.

Please try again later.
```

---

# Security Requirements

Tracking information shall:

- Only be accessible to authenticated users.
- Display only the owner's applications.
- Securely synchronize with backend services.
- Prevent unauthorized access.

---

# UI Components

Reusable components

- EBPCOTrackingCard
- EBPCOStatusChip
- EBPCOProgressTimeline
- EBPCOHistoryCard
- EBPCORemarkCard
- EBPCOSearchBar
- EBPCOFilterChip
- EBPCOLoadingSkeleton
- EBPCOEmptyState

---

# Dependencies

This stitch interacts with:

- Authentication Stitch
- Permit Application Stitch
- Payment Stitch
- Notification Stitch
- Document Upload Stitch
- Backend Tracking Service

---

# Acceptance Criteria

- Users can view all submitted applications.
- Application status is displayed accurately.
- Timeline displays processing stages.
- Processing history is available.
- Officer remarks are displayed.
- Search and filtering are supported.
- Loading, empty, and error states are documented.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- Real-time status updates.
- QR code application lookup.
- Interactive progress timeline.
- Estimated completion countdown.
- Live chat with permit personnel.
- Officer assignment visibility.
- Push notification deep linking.
- Analytics for processing duration.