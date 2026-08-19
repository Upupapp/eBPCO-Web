import 'package:flutter/foundation.dart';

import '../models/plumbing_permit_model.dart';

/// Holds the single in-progress Plumbing Permit application draft for the
/// current app session (frontend-only: nothing here is persisted to disk
/// or a server). Mirrors the other nine permit providers' shape exactly,
/// but is a fully separate provider/class so this draft can never be
/// overwritten by, or overwrite, any other permit's draft — including the
/// combined Sanitary / Plumbing Permit's draft.
class PlumbingPermitProvider extends ChangeNotifier {
  PlumbingPermitDraft? _draft;
  int _currentStep = 0;

  PlumbingPermitDraft? get draft => _draft;
  int get currentStep => _currentStep;

  /// Whether there is an unsubmitted draft the wizard can resume into.
  bool get hasResumableDraft =>
      _draft != null && _draft!.status == PlumbingPermitDraftStatus.draft;

  /// Returns the resumable draft if one exists, otherwise starts a fresh
  /// one (replacing any already-submitted draft from a prior session run).
  PlumbingPermitDraft resumeOrStart() {
    if (hasResumableDraft) return _draft!;
    return startNew();
  }

  /// Does not call `notifyListeners()`: this is invoked from the wizard
  /// screen's own `initState()` (via [resumeOrStart]) when it first
  /// mounts, and Flutter forbids notifying an already-built ancestor
  /// `Provider` while a new route is still in the middle of its initial
  /// build. Nothing currently watches this provider — the wizard manages
  /// its own rebuilds via local `setState` — so no listener is missed.
  PlumbingPermitDraft startNew() {
    final draft = PlumbingPermitDraft();
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
    draft.status = PlumbingPermitDraftStatus.draft;
    draft.lastSavedAt = DateTime.now();
    notifyListeners();
  }

  /// Marks the current draft as submitted (Step 9 → Application
  /// Submitted). The draft stays in memory so the confirmation screen can
  /// still read it, but [hasResumableDraft] will report false since its
  /// status is no longer `draft`, so reopening the wizard starts a fresh
  /// application.
  void submitApplication() {
    final draft = _draft;
    if (draft == null) return;
    draft.status = PlumbingPermitDraftStatus.submitted;
    notifyListeners();
  }

  void discardDraft() {
    _draft = null;
    _currentStep = 0;
    notifyListeners();
  }
}
