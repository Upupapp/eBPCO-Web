import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ebpco_user_app/core/models/saved_document_model.dart';
import 'package:ebpco_user_app/core/providers/documents_provider.dart';
import 'package:ebpco_user_app/core/services/document_storage_service.dart';
import 'package:ebpco_user_app/features/documents/presentation/my_documents_screen.dart';

/// `DocumentStorageService.deleteFile` performs a real dart:io
/// `File.exists()`/`delete()` call. Widget tests run their whole body
/// inside a single `FakeAsync` zone that never yields back to the real
/// event loop mid-test, so a real OS-level I/O completion has no chance to
/// fire before the test ends. Tests that exercise `DocumentsProvider.remove`
/// use this no-op fake instead, matching the fakes already used in
/// `documents_provider_test.dart`.
class _FakeDocumentStorageService extends DocumentStorageService {
  @override
  Future<void> deleteFile(String path) async {}
}

Widget _wrap({DocumentsProvider? provider}) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<DocumentsProvider>(
        create: (_) => provider ?? DocumentsProvider(),
      ),
    ],
    child: const MaterialApp(home: MyDocumentsScreen()),
  );
}

Future<void> _seedDocuments(List<SavedDocumentModel> documents) async {
  final encoded = jsonEncode(documents.map((d) => d.toJson()).toList());
  SharedPreferences.setMockInitialValues({'myDocuments': encoded});
}

SavedDocumentModel _document({
  String id = 'doc-1',
  String originalFileName = 'valid_id.jpg',
  SavedDocumentFileType fileType = SavedDocumentFileType.jpg,
  SavedDocumentCategory category = SavedDocumentCategory.uncategorized,
}) {
  return SavedDocumentModel(
    id: id,
    originalFileName: originalFileName,
    localPath: '/fake/path/$originalFileName',
    fileType: fileType,
    fileSizeBytes: 204800,
    dateImported: DateTime(2026, 1, 10),
    category: category,
  );
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('shows the empty state and Import Document button when there are no documents', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap());
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    expect(find.text('No Documents Yet'), findsOneWidget);
    expect(
      find.textContaining('making them easier to reuse'),
      findsWidgets,
    );
    expect(find.widgetWithText(ElevatedButton, 'Import Document'), findsWidgets);
  });

  testWidgets('renders a document card for each saved document', (tester) async {
    await _seedDocuments([
      _document(
        id: 'doc-1',
        originalFileName: 'valid_id.jpg',
        category: SavedDocumentCategory.validGovernmentId,
      ),
    ]);
    await tester.pumpWidget(_wrap());
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    expect(find.text('valid_id.jpg'), findsOneWidget);
    expect(find.text('Valid Government ID'), findsOneWidget);
    expect(find.text('No Documents Yet'), findsNothing);
  });

  testWidgets('search narrows the visible list by name', (tester) async {
    await _seedDocuments([
      _document(id: 'doc-1', originalFileName: 'barangay_clearance.pdf'),
      _document(id: 'doc-2', originalFileName: 'valid_id.jpg'),
    ]);
    await tester.pumpWidget(_wrap());
    await tester.pumpAndSettle();

    expect(find.text('barangay_clearance.pdf'), findsOneWidget);
    expect(find.text('valid_id.jpg'), findsOneWidget);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Search documents'),
      'barangay',
    );
    await tester.pumpAndSettle();

    expect(find.text('barangay_clearance.pdf'), findsOneWidget);
    expect(find.text('valid_id.jpg'), findsNothing);
  });

  testWidgets(
    'removing a document shows a confirmation dialog and removes it after confirming',
    (tester) async {
      await _seedDocuments([_document(id: 'doc-1')]);
      await tester.pumpWidget(
        _wrap(
          provider: DocumentsProvider(
            storageService: _FakeDocumentStorageService(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byIcon(Icons.more_vert));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Remove from My Documents'));
      await tester.pumpAndSettle();

      expect(find.text('Remove Document?'), findsOneWidget);
      expect(
        find.textContaining('Existing submitted applications'),
        findsOneWidget,
      );

      await tester.tap(find.widgetWithText(TextButton, 'Remove'));
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(find.text('Document removed successfully.'), findsOneWidget);

      await tester.pumpAndSettle();
      expect(find.text('No Documents Yet'), findsOneWidget);
    },
  );

  testWidgets('cancelling the remove confirmation keeps the document', (
    tester,
  ) async {
    await _seedDocuments([_document(id: 'doc-1')]);
    await tester.pumpWidget(_wrap());
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Remove from My Documents'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(TextButton, 'Cancel'));
    await tester.pumpAndSettle();

    expect(find.text('valid_id.jpg'), findsOneWidget);
  });

  testWidgets('renaming a document updates its displayed name', (
    tester,
  ) async {
    await _seedDocuments([_document(id: 'doc-1')]);
    await tester.pumpWidget(_wrap());
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Rename'));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.widgetWithText(TextFormField, 'valid_id.jpg'),
      'My Government ID',
    );
    await tester.tap(find.widgetWithText(TextButton, 'Save'));
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.text('My Government ID'), findsOneWidget);
    expect(find.text('valid_id.jpg'), findsNothing);
  });

  testWidgets(
    'selectionMode pops the selected document instead of opening preview',
    (tester) async {
      await _seedDocuments([_document(id: 'doc-1')]);
      SavedDocumentModel? poppedResult;

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider<DocumentsProvider>(
              create: (_) => DocumentsProvider(),
            ),
          ],
          child: MaterialApp(
            home: Builder(
              builder: (context) => Scaffold(
                body: Center(
                  child: TextButton(
                    onPressed: () async {
                      poppedResult = await Navigator.of(context)
                          .push<SavedDocumentModel>(
                            MaterialPageRoute(
                              builder: (_) => const MyDocumentsScreen(
                                selectionMode: true,
                              ),
                            ),
                          );
                    },
                    child: const Text('Open Picker'),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Open Picker'));
      await tester.pumpAndSettle();
      expect(find.text('Choose a Document'), findsOneWidget);

      await tester.tap(find.text('valid_id.jpg'));
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(poppedResult, isNotNull);
      expect(poppedResult!.originalFileName, 'valid_id.jpg');
      expect(
        poppedResult!.lastUsedDate,
        isNotNull,
        reason: 'selecting a document from a permit upload marks it used',
      );
    },
  );
}
