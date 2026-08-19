import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import 'widgets/legal_document_section.dart';

const _sections = [
  (
    title: '1. Introduction',
    body:
        'These Terms and Conditions govern your access to and use of the '
        'Electronic Business Permit and Clearance Office (eBPCO) mobile '
        'application. By creating an account or using any part of the app, '
        'you agree to be bound by these Terms. If you do not agree, please '
        'do not use the app.',
  ),
  (
    title: '2. Eligibility',
    body:
        'The app is intended for property owners, business owners, '
        'authorized representatives, and licensed professionals who need to '
        'file, track, or manage building permit and business clearance '
        'applications with the Office of the Building Official. You must '
        'provide accurate and truthful information when creating an account '
        'or filing an application.',
  ),
  (
    title: '3. Account Responsibility',
    body:
        'You are responsible for maintaining the confidentiality of your '
        'login credentials and for all activity that occurs under your '
        'account. Notify us immediately if you suspect unauthorized access '
        'to your account. eBPCO is not liable for losses arising from your '
        'failure to safeguard your credentials.',
  ),
  (
    title: '4. Building Permit Applications',
    body:
        'Applications submitted through the app follow the process defined '
        'under the Unified Application Form for Building Permit and Fire '
        'Safety Evaluation Clearance (DILG-DPWH-DICT-DTI Joint Memorandum '
        'Circular 2018-01). Submitting an application does not guarantee '
        'approval. All applications remain subject to evaluation, '
        'assessment, and inspection by the Office of the Building Official '
        'and other relevant agencies.',
  ),
  (
    title: '5. User Responsibilities',
    body:
        'You agree to use the app only for lawful purposes, to provide '
        'complete and accurate application details, and to keep your '
        'submitted documents current. You must not attempt to interfere '
        'with the app\'s normal operation or access accounts other than '
        'your own.',
  ),
  (
    title: '6. Document Submission',
    body:
        'Documents you upload (plans, clearances, identification, and other '
        'requirements) must be legitimate, current, and, where applicable, '
        'signed and sealed by the appropriate licensed professional. '
        'Submitting falsified or altered documents may result in the '
        'rejection of your application and, where applicable, referral to '
        'the appropriate authorities.',
  ),
  (
    title: '7. Payments',
    body:
        'Assessment fees are determined by the Office of the Building '
        'Official after your application and documents have been evaluated. '
        'The app may display estimated or pending assessments; these are '
        'not final until confirmed by the office. Payment methods and '
        'instructions shown in the app are provided for your convenience '
        'and do not constitute a guarantee of processing time.',
  ),
  (
    title: '8. Privacy',
    body:
        'Your use of the app is also governed by our Privacy Policy, which '
        'explains what information we collect, how it is used, and your '
        'rights under the Data Privacy Act of 2012. Please review the '
        'Privacy Policy alongside these Terms.',
  ),
  (
    title: '9. Intellectual Property',
    body:
        'The eBPCO name, logo, interface designs, and app content are the '
        'property of the Office of the Building Official and its '
        'developers. You may not copy, modify, distribute, or create '
        'derivative works from the app without prior written permission.',
  ),
  (
    title: '10. Prohibited Activities',
    body:
        'You must not use the app to submit fraudulent information, '
        'impersonate another person or entity, attempt to gain '
        'unauthorized access to other accounts or systems, or interfere '
        'with the app\'s security features. Violation of this section may '
        'result in suspension or termination of your account.',
  ),
  (
    title: '11. Disclaimer',
    body:
        'The app is provided "as is" without warranties of any kind, '
        'whether express or implied. While we aim to keep information '
        'accurate and the app available at all times, we do not guarantee '
        'uninterrupted access or that the app will always be free of '
        'errors.',
  ),
  (
    title: '12. Limitation of Liability',
    body:
        'To the extent permitted by law, eBPCO and its developers are not '
        'liable for indirect, incidental, or consequential damages arising '
        'from your use of, or inability to use, the app, including delays '
        'in application processing that are outside the office\'s control.',
  ),
  (
    title: '13. Changes to Terms',
    body:
        'We may update these Terms from time to time to reflect changes in '
        'our services or applicable regulations. Continued use of the app '
        'after an update constitutes acceptance of the revised Terms. '
        'Material changes will be indicated within the app.',
  ),
  (
    title: '14. Contact Information',
    body:
        'Questions about these Terms may be sent to the Business Permit and '
        'Licensing Office at support@ebpco.gov.ph, or by calling '
        '(02) 8988-4242 during office hours, Monday to Friday, '
        '8:00 AM to 5:00 PM.',
  ),
];

/// Static Terms and Conditions content — original copy written for this
/// prototype, not sourced from any external document.
class TermsConditionsScreen extends StatelessWidget {
  const TermsConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Terms and Conditions')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppConstants.screenPaddingHorizontal),
          children: [
            Text('Last updated: January 2026', style: AppTypography.caption),
            const SizedBox(height: AppSpacing.lg),
            for (final section in _sections)
              LegalSection(title: section.title, body: section.body),
          ],
        ),
      ),
    );
  }
}
