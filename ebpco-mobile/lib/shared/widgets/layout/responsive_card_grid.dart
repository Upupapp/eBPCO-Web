import 'package:flutter/material.dart';

/// Lays out [children] in a fixed-column grid whose row heights are
/// determined by their own content, instead of `GridView`'s
/// `childAspectRatio` (which forces every cell to an exact
/// width ÷ ratio height regardless of what's actually inside it). That
/// fixed-ratio approach is what caused the dashboard's stat/quick-action
/// cards to throw "Bottom overflowed by N pixels" on real Android
/// devices — a slightly larger system font size or a narrower phone than
/// whatever the ratio was tuned against needs a few more pixels of
/// height than the ratio provides, and there is nowhere for that content
/// to go.
///
/// Each row is wrapped in [IntrinsicHeight] so every card in that row
/// stretches to match the tallest sibling (equal card heights), and
/// height is otherwise fully driven by content — so it never overflows
/// and scales correctly at any text-scale factor or screen width.
class ResponsiveCardGrid extends StatelessWidget {
  final List<Widget> children;
  final int crossAxisCount;
  final double mainAxisSpacing;
  final double crossAxisSpacing;

  const ResponsiveCardGrid({
    super.key,
    required this.children,
    this.crossAxisCount = 2,
    this.mainAxisSpacing = 12,
    this.crossAxisSpacing = 12,
  });

  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i += crossAxisCount) {
      if (rows.isNotEmpty) {
        rows.add(SizedBox(height: mainAxisSpacing));
      }

      final rowChildren = <Widget>[];
      for (var col = 0; col < crossAxisCount; col++) {
        final index = i + col;
        if (col > 0) {
          rowChildren.add(SizedBox(width: crossAxisSpacing));
        }
        rowChildren.add(
          Expanded(
            child: index < children.length
                ? children[index]
                : const SizedBox.shrink(),
          ),
        );
      }

      rows.add(
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: rowChildren,
          ),
        ),
      );
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rows);
  }
}
