import 'package:flutter/material.dart';

/// Mock model describing an in-app notification.
class NotificationModel {
  final String id;
  final String title;
  final String message;
  final DateTime createdAt;
  final IconData icon;
  bool isRead;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.createdAt,
    required this.icon,
    this.isRead = false,
  });
}
