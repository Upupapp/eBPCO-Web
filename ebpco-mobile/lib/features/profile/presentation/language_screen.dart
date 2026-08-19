import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_languages.dart';
import '../../../core/providers/settings_provider.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/alerts/app_alert.dart';
import '../../../shared/widgets/search/app_search_field.dart';

/// Display-only language picker. Selecting an option only moves the radio
/// selection — it never changes the app's actual display language.
class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();
    final query = _query.trim().toLowerCase();
    final languages = query.isEmpty
        ? supportedLanguages
        : supportedLanguages
              .where((language) => language.toLowerCase().contains(query))
              .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Language')),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppConstants.screenPaddingHorizontal,
                AppSpacing.md,
                AppConstants.screenPaddingHorizontal,
                AppSpacing.sm,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const AppAlert(
                    variant: AppAlertVariant.info,
                    message:
                        'Language selection is currently available for '
                        'demonstration purposes only.',
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppSearchField(
                    hint: 'Search languages',
                    onChanged: (value) => setState(() => _query = value),
                  ),
                ],
              ),
            ),
            Expanded(
              child: languages.isEmpty
                  ? const Center(child: Text('No matching languages'))
                  : RadioGroup<String>(
                      groupValue: settings.selectedLanguage,
                      onChanged: (value) {
                        if (value != null) settings.setLanguage(value);
                      },
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppConstants.screenPaddingHorizontal,
                        ),
                        itemCount: languages.length,
                        separatorBuilder: (context, index) =>
                            const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final language = languages[index];
                          return RadioListTile<String>(
                            value: language,
                            activeColor: AppColors.primary,
                            contentPadding: EdgeInsets.zero,
                            title: Text(language),
                          );
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
