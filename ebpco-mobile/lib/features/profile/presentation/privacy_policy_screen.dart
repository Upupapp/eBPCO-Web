import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import 'widgets/legal_document_section.dart';

const _sections = [
  (
    title: 'Overview',
    body:
        'This Privacy Policy explains how the Electronic Business Permit '
        'and Clearance Office (eBPCO) mobile application collects, uses, '
        'and protects your information when you apply for building permits '
        'and related clearances. It is written to comply with the Data '
        'Privacy Act of 2012 (Republic Act No. 10173) and its implementing '
        'rules.',
  ),
  (
    title: 'Information We Collect',
    body:
        'We collect the information you provide directly to us and the '
        'documents you choose to upload as part of an application.',
  ),
  (
    title: 'Personal Information',
    body:
        'Full name, contact number, email address, residential address, '
        'and, where applicable, information about an authorized '
        'representative or licensed professional acting on your behalf.',
  ),
  (
    title: 'Application Information',
    body:
        'Property location and title details, scope of work, project cost '
        'and schedule, occupancy classification, and other details required '
        'by the Unified Application Form for Building Permit and Fire '
        'Safety Evaluation Clearance.',
  ),
  (
    title: 'Uploaded Documents',
    body:
        'Identification documents, proof of property ownership, plans, '
        'permits, and other supporting requirements you upload during the '
        'application process.',
  ),
  (
    title: 'How Information Is Used',
    body:
        'Your information is used to process and evaluate your permit '
        'application, to communicate updates about its status, to compute '
        'applicable fees, and to comply with reporting obligations to '
        'relevant government agencies. We do not use your information for '
        'unrelated marketing purposes.',
  ),
  (
    title: 'Data Protection',
    body:
        'We apply reasonable organizational, physical, and technical '
        'safeguards appropriate to the sensitivity of the information '
        'collected, consistent with the standards set by the National '
        'Privacy Commission.',
  ),
  (
    title: 'Data Sharing',
    body:
        'Information may be shared with other government offices strictly '
        'for purposes directly related to evaluating and processing your '
        'application (for example, fire safety or zoning clearance). We do '
        'not sell your personal information to third parties.',
  ),
  (
    title: 'User Rights',
    body:
        'Under the Data Privacy Act of 2012, you have the right to be '
        'informed, to access your personal data, to correct inaccurate or '
        'outdated information, to object to certain uses of your data, and '
        'to file a complaint with the National Privacy Commission if you '
        'believe your rights have been violated.',
  ),
  (
    title: 'Cookies',
    body:
        'This mobile application does not use browser cookies. It may use '
        'local, on-device storage to keep you signed in and to remember '
        'your app preferences; this data stays on your device.',
  ),
  (
    title: 'Data Retention',
    body:
        'Application records are retained for as long as necessary to '
        'fulfill the purposes described in this Policy and to comply with '
        'applicable records-retention regulations for government permitting '
        'transactions.',
  ),
  (
    title: 'Security',
    body:
        'We restrict access to personal information to authorized '
        'personnel who need it to process your application. You also play '
        'a role in keeping your account secure by protecting your login '
        'credentials and reporting any suspected unauthorized access.',
  ),
  (
    title: 'Contact Information',
    body:
        'Questions about this Privacy Policy or requests to exercise your '
        'data privacy rights may be sent to the Business Permit and '
        'Licensing Office at support@ebpco.gov.ph, or by calling '
        '(02) 8988-4242 during office hours, Monday to Friday, '
        '8:00 AM to 5:00 PM.',
  ),
  (
    title: 'Data Privacy Act of 2012',
    body:
        'This Policy is issued in reference to Republic Act No. 10173, the '
        'Data Privacy Act of 2012, and its implementing rules and '
        'regulations, which govern the collection, processing, and '
        'protection of personal information in the Philippines.',
  ),
];

/// Static Privacy Policy content — original copy written for this
/// prototype, not copied from any external source.
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Policy')),
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
