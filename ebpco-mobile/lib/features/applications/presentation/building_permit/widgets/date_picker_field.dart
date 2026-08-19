import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../core/constants/app_constants.dart';
import '../../../../../core/theme/app_typography.dart';

/// Tappable date field that opens the platform date picker, wired as a
/// [FormField] so it participates in the wizard step's `Form.validate()`
/// like any other field. Handles a cancelled picker (returns null) and a
/// never-selected date safely — no unsafe null assertions.
class DatePickerField extends FormField<DateTime> {
  DatePickerField({
    super.key,
    required String label,
    DateTime? value,
    required ValueChanged<DateTime?> onChanged,
    DateTime? firstDate,
    DateTime? lastDate,
    super.validator,
    String? hint,
  }) : super(
         initialValue: value,
         autovalidateMode: AutovalidateMode.onUserInteraction,
         builder: (state) {
           final format = DateFormat('MMM d, yyyy');
           final now = DateTime.now();
           return InkWell(
             borderRadius: BorderRadius.circular(
               AppConstants.borderRadiusSmall,
             ),
             onTap: () async {
               final picked = await showDatePicker(
                 context: state.context,
                 initialDate: state.value ?? now,
                 firstDate: firstDate ?? DateTime(now.year - 20),
                 lastDate: lastDate ?? DateTime(now.year + 20),
               );
               // The field (or the whole wizard step) may have been
               // unmounted while the picker dialog was open — calling
               // setState on a disposed FormFieldState throws.
               if (!state.mounted) return;
               // showDatePicker returns null when the user cancels or
               // dismisses the dialog — leave the field's value untouched.
               if (picked != null) {
                 state.didChange(picked);
                 onChanged(picked);
               }
             },
             child: InputDecorator(
               decoration: InputDecoration(
                 labelText: label,
                 hintText: hint,
                 suffixIcon: const Icon(
                   Icons.calendar_today_outlined,
                   size: 20,
                 ),
                 errorText: state.errorText,
               ),
               child: Text(
                 state.value != null ? format.format(state.value!) : 'Select a date',
                 style: state.value != null
                     ? AppTypography.body
                     : AppTypography.helper,
               ),
             ),
           );
         },
       );
}
