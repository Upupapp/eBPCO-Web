import '../core/models/business_model.dart';

/// Seed data for [MockBusinessRepository] — one pre-existing business so
/// the demo doesn't start completely empty.
BusinessModel buildSeedBusiness() {
  return BusinessModel(
    id: 'biz-seed-1',
    name: "Juan's General Merchandise",
    category: BusinessCategory.retail,
    street: '123 Rizal Street',
    barangay: 'Poblacion',
    city: 'Quezon City',
    province: 'Metro Manila',
    registrationNumber: 'REG-2026-000001',
    dateRegistered: DateTime.now().subtract(const Duration(days: 40)),
  );
}
