# 10 – Payment Stitch

## Overview

The Payment Stitch defines the standardized payment workflow for the Electronic Building Permit and Certificate of Occupancy (eBPCO) mobile application.

This module allows applicants to pay permit-related fees through supported payment methods while providing transparent payment tracking and verification. It also accommodates users who prefer traditional over-the-counter transactions.

---

# Objectives

The Payment module shall:

- Display payment details.
- Support multiple payment methods.
- Record payment transactions.
- Allow users to upload proof of payment when applicable.
- Display payment status.
- Prepare payment information for backend verification.

---

# Supported Payment Methods

## Current Version

- Onsite Payment
- Bank Transfer

## Future Versions

- GCash
- Maya
- Credit/Debit Card
- LandBank Link.Biz
- eGov Payment Gateway

---

# Payment Flow

```text
Application Approved
        │
        ▼
Payment Required
        │
        ▼
Choose Payment Method
        │
        ▼
Complete Payment
        │
        ▼
Payment Verification
        │
        ▼
Payment Confirmed
        │
        ▼
Permit Processing
```

---

# Payment Information

Before payment, display:

- Application Reference Number
- Permit Type
- Applicant Name
- Total Amount Due
- Payment Deadline
- Payment Status

---

# Payment Method Selection

Users may choose between:

### Onsite Payment

Users visit the Business Permit Office to settle payment.

Display:

- Office Address
- Office Hours
- Payment Instructions

---

### Bank Transfer

Display:

- Bank Name
- Account Name
- Account Number
- Reference Number
- Payment Instructions

Users may upload proof of payment after completing the transaction.

---

# Payment Status

Available payment statuses:

- Pending Payment
- Payment Submitted
- Under Verification
- Verified
- Rejected

Each status should use standardized status chips throughout the application.

---

# Proof of Payment

When using Bank Transfer, users can upload:

- Payment Receipt
- Deposit Slip
- Transfer Confirmation

Supported Formats

- PDF
- JPG
- JPEG
- PNG

---

# Payment Verification

The payment verification process is performed by authorized personnel.

Possible outcomes:

- Approved
- Rejected
- Requires Additional Information

If rejected, the applicant should receive the reason for rejection.

---

# Payment Receipt

Once payment has been verified, display:

- Official Receipt Number
- Payment Date
- Amount Paid
- Payment Method
- Transaction Reference

Future Enhancement

- Downloadable PDF receipt.

---

# Validation Rules

Payment Method

- Required

Proof of Payment

- Required only for Bank Transfer.

Receipt Format

- Must use supported file formats.

---

# Error States

Payment Failed

```
Payment could not be processed.
```

---

Invalid Proof of Payment

```
Uploaded receipt is invalid.
```

---

Verification Failed

```
Payment verification was unsuccessful.
```

---

Network Error

```
Unable to connect to the payment service.
```

---

# Success States

Payment Submitted

```
Payment submitted successfully.
```

---

Payment Verified

```
Payment has been verified.
```

Permit processing will continue.

---

# Security Requirements

The system shall:

- Secure payment information.
- Encrypt sensitive transaction data.
- Prevent duplicate payment submissions.
- Maintain transaction history.
- Protect uploaded payment receipts.

---

# UI Components

Reusable components

- EBPCOPaymentCard
- EBPCOPaymentMethodCard
- EBPCOPaymentStatusChip
- EBPCOReceiptUploader
- EBPCOReceiptCard
- EBPCOPrimaryButton
- EBPCOSecondaryButton
- EBPCOConfirmationDialog

---

# Dependencies

This stitch interacts with:

- Permit Application Stitch
- Document Upload Stitch
- Tracking Stitch
- Notification Stitch
- Authentication Stitch
- Backend Payment Service

---

# Acceptance Criteria

- Users can select a payment method.
- Payment details are displayed correctly.
- Bank transfer supports receipt uploads.
- Onsite payment instructions are available.
- Payment statuses are standardized.
- Verification workflow is documented.
- Error and success states are defined.
- Security requirements are documented.
- Reusable components are identified.
- Ready for backend integration.

---

# Future Improvements

- GCash integration.
- Maya integration.
- Online card payments.
- QR code payments.
- Automatic payment verification.
- Digital official receipts.
- Installment payment options.
- Real-time payment confirmation.