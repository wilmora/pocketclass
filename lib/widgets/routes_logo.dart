import 'package:flutter/material.dart';

class RoutesLogo extends StatelessWidget {
  final double size;
  final bool showText;
  final Color? color;
  final bool isHorizontal;

  const RoutesLogo({
    Key? key,
    this.size = 48.0,
    this.showText = true,
    this.color,
    this.isHorizontal = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final logoColor = color ?? Theme.of(context).colorScheme.primary;
    
    if (isHorizontal && showText) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildIcon(logoColor),
          const SizedBox(width: 8),
          _buildText(context, logoColor),
        ],
      );
    } else if (showText) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildIcon(logoColor),
          const SizedBox(height: 4),
          _buildText(context, logoColor),
        ],
      );
    } else {
      return _buildIcon(logoColor);
    }
  }

  Widget _buildIcon(Color logoColor) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: logoColor,
        borderRadius: BorderRadius.circular(size * 0.2),
        boxShadow: [
          BoxShadow(
            color: logoColor.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Route lines (representing roads/paths)
          Center(
            child: CustomPaint(
              size: Size(size * 0.7, size * 0.7),
              painter: RouteLinesPainter(Colors.white),
            ),
          ),
          // Car icon
          Center(
            child: Icon(
              Icons.directions_car_rounded,
              color: Colors.white,
              size: size * 0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildText(BuildContext context, Color logoColor) {
    return Text(
      'ROUTES',
      style: TextStyle(
        fontSize: size * 0.35,
        fontWeight: FontWeight.bold,
        color: logoColor,
        letterSpacing: 1.2,
      ),
    );
  }
}

// Custom painter for route lines
class RouteLinesPainter extends CustomPainter {
  final Color color;
  
  RouteLinesPainter(this.color);
  
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    // Draw intersecting route lines
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.3;
    
    // Horizontal line
    canvas.drawLine(
      Offset(center.dx - radius, center.dy),
      Offset(center.dx + radius, center.dy),
      paint,
    );
    
    // Vertical line
    canvas.drawLine(
      Offset(center.dx, center.dy - radius),
      Offset(center.dx, center.dy + radius),
      paint,
    );
    
    // Diagonal lines
    canvas.drawLine(
      Offset(center.dx - radius * 0.7, center.dy - radius * 0.7),
      Offset(center.dx + radius * 0.7, center.dy + radius * 0.7),
      paint,
    );
    
    canvas.drawLine(
      Offset(center.dx + radius * 0.7, center.dy - radius * 0.7),
      Offset(center.dx - radius * 0.7, center.dy + radius * 0.7),
      paint,
    );
  }
  
  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

// Animated logo for splash screens or loading states
class AnimatedRoutesLogo extends StatefulWidget {
  final double size;
  final bool showText;
  final Color? color;

  const AnimatedRoutesLogo({
    Key? key,
    this.size = 80.0,
    this.showText = true,
    this.color,
  }) : super(key: key);

  @override
  State<AnimatedRoutesLogo> createState() => _AnimatedRoutesLogoState();
}

class _AnimatedRoutesLogoState extends State<AnimatedRoutesLogo>
    with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _scaleController;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();
    
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_rotationController, _scaleController]),
      builder: (context, child) {
        return Transform.scale(
          scale: 1.0 + (_scaleController.value * 0.1),
          child: Transform.rotate(
            angle: _rotationController.value * 2 * 3.14159,
            child: RoutesLogo(
              size: widget.size,
              showText: widget.showText,
              color: widget.color,
              isHorizontal: false,
            ),
          ),
        );
      },
    );
  }
}