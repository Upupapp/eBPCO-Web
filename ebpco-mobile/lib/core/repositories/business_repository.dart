import '../../mock/mock_businesses_data.dart';
import '../constants/app_constants.dart';
import '../models/business_model.dart';

/// Source of the user's registered businesses. Swap [MockBusinessRepository]
/// for a real HTTP-backed implementation once a backend exists.
abstract class BusinessRepository {
  Future<List<BusinessModel>> fetchAll();

  Future<BusinessModel> registerBusiness({
    required String name,
    required BusinessCategory category,
    required String street,
    required String barangay,
    required String city,
    required String province,
  });
}

class MockBusinessRepository implements BusinessRepository {
  final List<BusinessModel> _businesses = [buildSeedBusiness()];

  @override
  Future<List<BusinessModel>> fetchAll() async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    return List.unmodifiable(_businesses);
  }

  @override
  Future<BusinessModel> registerBusiness({
    required String name,
    required BusinessCategory category,
    required String street,
    required String barangay,
    required String city,
    required String province,
  }) async {
    await Future.delayed(AppConstants.mockNetworkDelay);
    final sequence = (_businesses.length + 1).toString().padLeft(6, '0');
    final business = BusinessModel(
      id: 'biz-${DateTime.now().microsecondsSinceEpoch}',
      name: name,
      category: category,
      street: street,
      barangay: barangay,
      city: city,
      province: province,
      registrationNumber: 'REG-${DateTime.now().year}-$sequence',
      dateRegistered: DateTime.now(),
    );
    _businesses.add(business);
    return business;
  }
}
