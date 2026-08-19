# 08 – Permit Application Stitch

## Overview

The Permit Application Stitch defines the complete workflow for submitting a new business permit application within the Electronic Business Permit and Clearance Office (eBPCO) mobile application.

This stitch standardizes the user experience from selecting a permit type to submitting the application for evaluation. It ensures a consistent process that is easy to follow while preparing the application for future backend integration.

---

# Objectives

The Permit Application module shall:

- Allow users to apply for different permit types.
- Guide users through a structured application process.
- Collect all required business information.
- Validate user inputs before submission.
- Allow users to review their application.
- Prepare submitted data for backend processing.

---

# Supported Permit Types

Current Version

- New Business Permit
- Business Permit Renewal
- Business Amendment

Future Versions

- Temporary Permit
- Special Permit
- Barangay Clearance
- Occupancy Permit
- Fire Safety Clearance

---

# User Flow

```text
Dashboard
      │
      ▼
Apply for Permit
      │
      ▼
Select Permit Type
      │
      ▼
Business Information
      │
      ▼
Business Address
      │
      ▼
Owner Information
      │
      ▼
Document Upload
      │
      ▼
Review Application
      │
      ▼
Submit Application
      │
      ▼
Application Successfully Submitted
```

---

# Step 1 — Permit Selection

The user selects the permit they wish to apply for.

Each permit card should display:

- Permit Name
- Short Description
- Icon
- Estimated Processing Time

---

# Step 2 — Business Information

Collect the business details.

Required Fields

- Business Name
- Business Type
- Nature of Business
- DTI / SEC Registration Number
- TIN Number (Future)
- Business Contact Number
- Business Email

---

# Step 3 — Business Address

Required Fields

- Region
- Province
- Municipality / City
- Barangay
- Street Address
- ZIP Code

Future Enhancement

- GPS Location
- Interactive Map

---

# Step 4 — Owner Information

Collect owner details.

Required Fields

- First Name
- Middle Name (Optional)
- Last Name
- Mobile Number
- Email Address

Future Fields

- Government ID
- Emergency Contact

---

# Step 5 — Document Upload

Users upload supporting documents.

Examples

- DTI Certificate
- SEC Registration
- Barangay Clearance
- Valid Government ID
- Tax Documents
- Other Supporting Files

Users should be able to:

- Upload documents
- Replace uploaded files
- Remove uploaded files
- Preview uploaded files

---

# Step 6 — Review Application

Before submission, users review all entered information.

Display:

- Permit Type
- Business Information
- Owner Information
- Address
- Uploaded Documents

Provide an Edit button for each section.

---

# Step 7 — Submit Application

Upon submission:

- Validate all required fields.
- Validate uploaded documents.
- Generate an application reference number.
- Save the application.
- Redirect the user to the submission confirmation screen.

---

# Validation Rules

Business Name

- Required
- Maximum character limit

Business Email

- Valid email format

Contact Number

- Valid Philippine mobile number

Required Fields

- Cannot be empty

Documents

- Required documents must be uploaded.

---

# Error States

Missing Information

```
Please complete all required fields.
```

Missing Documents

```
Please upload the required documents.
```

Invalid File

```
Unsupported file format.
```

Submission Failed

```
Unable to submit your application.

Please try again later.
```

---

# Success State

Display

```
Application Submitted Successfully
```

Show

- Reference Number
- Submission Date
- Estimated Processing Time

Provide buttons for:

- View Application
- Return to Dashboard

---

# Draft Support

Users should be able to:

- Save Draft
- Continue Later
- Delete Draft

Future enhancement:

- Automatic draft saving.

---

# UI Components

Reusable components

- EBPCOPermitCard
- EBPCOStepIndicator
- EBPCOTextField
- EBPCODropdown
- EBPCODatePicker
- EBPCOFileUploader
- EBPCOReviewCard
- EBPCOPrimaryButton
- EBPCOSecondaryButton
- EBPCOConfirmationDialog

---

# Dependencies

This stitch interacts with:

- Dashboard Stitch
- Authentication Stitch
- Document Upload Stitch
- Tracking Stitch
- Notification Stitch
- Payment Stitch

---

# Acceptance Criteria

- Permit selection is available.
- Business information is collected.
- Address information is validated.
- Owner information is collected.
- Document upload is supported.
- Review page displays all entered data.
- Submission process is documented.
- Validation rules are complete.
- Error and success states are defined.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- Auto-fill business information.
- QR code application reference.
- AI-assisted form validation.
- Auto-save every field.
- Smart document verification.
- Digital signature support.
- Offline draft mode.
- Integration with DTI, SEC, and BIR services.