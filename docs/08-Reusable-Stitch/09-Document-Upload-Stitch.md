# 09 – Document Upload Stitch

## Overview

The Document Upload Stitch defines the standardized process for uploading, managing, validating, and reviewing supporting documents required for permit applications in the Electronic Business Permit and Clearance Office (eBPCO).

This stitch ensures all document-related interactions are consistent throughout the application while preparing the system for secure backend storage and document verification.

---

# Objectives

The Document Upload module shall:

- Allow users to upload required supporting documents.
- Validate uploaded files before submission.
- Display uploaded documents clearly.
- Allow users to replace or remove uploaded files.
- Prepare uploaded documents for backend storage.
- Maintain a consistent upload experience across the application.

---

# Supported File Types

Current Version

- PDF (.pdf)
- JPG (.jpg)
- JPEG (.jpeg)
- PNG (.png)

Future Versions

- HEIC
- DOCX
- ZIP (Supporting Documents)

---

# Maximum File Size

Current Limit

- 10 MB per file

Future Enhancement

- Dynamic file size limits based on document type.

---

# Upload Flow

```text
Application Form
        │
        ▼
Select Upload Section
        │
        ▼
Choose File
        │
        ▼
Validate File
        │
        ▼
Upload Successful
        │
        ▼
Preview Uploaded File
```

---

# Required Documents

Examples

- DTI Certificate
- SEC Registration
- Barangay Clearance
- Valid Government ID
- Tax Identification Documents
- Occupancy Permit
- Fire Safety Certificate

Document requirements may vary depending on the selected permit type.

---

# Upload Methods

Users may upload documents using:

- Device Gallery
- File Manager
- Camera (Future)

Future versions may support cloud storage integration.

---

# File Validation

The system shall validate:

- Supported file format
- File size
- Corrupted files
- Empty files

If validation fails, the upload must be rejected.

---

# Upload Status

Each uploaded document shall display its current status.

Possible statuses:

- Uploading
- Uploaded
- Failed
- Replaced
- Removed

---

# Document Preview

Users should be able to:

- Preview uploaded files.
- View file name.
- View upload date.
- View file size.

Future Enhancement

- Zoom document preview.
- Multi-page PDF viewer.

---

# Replace Document

Users may replace an uploaded document.

Flow

```text
Uploaded Document
        │
        ▼
Replace File
        │
        ▼
Choose New File
        │
        ▼
Validation
        │
        ▼
Upload Complete
```

---

# Remove Document

Users may remove uploaded documents before application submission.

Flow

```text
Uploaded Document
        │
        ▼
Remove File
        │
        ▼
Confirmation Dialog
        │
        ▼
Document Removed
```

---

# Validation Rules

Accepted File Types

- PDF
- JPG
- JPEG
- PNG

File Size

- Maximum 10 MB

Required Documents

- Cannot be skipped.

Duplicate Files

- Allowed only if required by another document category.

---

# Error States

Unsupported File Type

```
This file format is not supported.
```

---

File Too Large

```
File exceeds the maximum upload size.
```

---

Upload Failed

```
Unable to upload document.

Please try again.
```

---

No Internet Connection

```
Upload failed.

Please check your internet connection.
```

---

# Success State

Display

```
Document Uploaded Successfully
```

Show

- File Name
- Upload Date
- File Size

---

# Security Requirements

Uploaded files shall:

- Be scanned before processing (backend).
- Use secure transmission.
- Prevent executable file uploads.
- Prevent unsupported file formats.
- Protect sensitive user information.

---

# UI Components

Reusable components

- EBPCOFileUploader
- EBPCODocumentCard
- EBPCOUploadProgress
- EBPCOPreviewDialog
- EBPCOConfirmationDialog
- EBPCOPrimaryButton
- EBPCOSecondaryButton
- EBPCOEmptyState

---

# Dependencies

This stitch interacts with:

- Permit Application Stitch
- Authentication Stitch
- Tracking Stitch
- Notification Stitch
- Backend File Storage Service

---

# Acceptance Criteria

- Users can upload documents.
- Supported file types are validated.
- File size validation is enforced.
- Uploaded documents can be previewed.
- Documents can be replaced.
- Documents can be removed.
- Upload status is displayed.
- Error handling is standardized.
- Security requirements are documented.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- Drag-and-drop upload.
- Camera document scanning.
- OCR document recognition.
- Automatic image enhancement.
- AI document verification.
- Cloud storage synchronization.
- Batch document upload.
- Digital document signatures.