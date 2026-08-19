import 'package:flutter/foundation.dart';

import '../models/building_permit_model.dart';

/// Holds the single in-progress Building Permit application draft for the
/// current app session (frontend-only: nothing here is persisted to disk
/// or a server). Lets the wizard resume from where the user left off if
/// they navigate away and reopen the Building Permit flow before
/// submitting.
class BuildingPermitProvider extends ChangeNotifier {
  BuildingPermitDraft? _draft;
  int _currentStep = 0;

  BuildingPermitDraft? get draft => _draft;
  int get currentStep => _currentStep;

  /// Whether there is an unsubmitted draft the wizard can resume into.
  bool get hasResumableDraft =>
      _draft != null && _draft!.status == BuildingPermitDraftStatus.draft;

  /// Returns the resumable draft if one exists, otherwise starts a fresh
  /// one (replacing any already-submitted draft from a prior session run).
  BuildingPermitDraft resumeOrStart() {
    if (hasResumableDraft) return _draft!;
    return startNew();
  }

  /// Does not call `notifyListeners()`: this is invoked from the wizard
  /// screen's own `initState()` (via [resumeOrStart]) when it first mounts,
  /// and Flutter forbids notifying an already-built ancestor `Provider`
  /// while a new route is still in the middle of its initial build. Nothing
  /// currently watches this provider — the wizard manages its own
  /// rebuilds via local `setState` — so no listener is missed.
  BuildingPermitDraft startNew() {
    final draft = BuildingPermitDraft();
    _draft = draft;
    _currentStep = 0;
    return draft;
  }

  void goToStep(int step) {
    if (_currentStep == step) return;
    _currentStep = step;
    notifyListeners();
  }

  void saveAsDraft() {
    final draft = _draft;
    if (draft == null) return;
    draft.status = BuildingPermitDraftStatus.draft;
    draft.lastSavedAt = DateTime.now();
    notifyListeners();
  }

  /// Marks the current draft as submitted (Step 9 → Application Submitted).
  /// The draft stays in memory so the confirmation screen can still read
  /// it, but [hasResumableDraft] will report false since its status is no
  /// longer `draft`, so reopening the wizard starts a fresh application.
  void submitApplication() {
    final draft = _draft;
    if (draft == null) return;
    draft.status = BuildingPermitDraftStatus.submitted;
    notifyListeners();
  }

  void discardDraft() {
    _draft = null;
    _currentStep = 0;
    notifyListeners();
  }
}
