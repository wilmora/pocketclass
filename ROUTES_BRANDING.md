# Routes App - Branding Guidelines

## Brand Identity

**App Name:** Routes - Ride Together  
**Tagline:** "Connect. Share. Travel."  
**Primary Color:** Green (#2E7D32)  
**Theme:** Eco-friendly, community-focused ride-sharing

## Visual Identity

### Logo Design
The Routes logo features a modern design with:
- **Route Lines**: Intersecting paths representing different routes and connections
- **Car Icon**: Central car symbol showing transportation focus
- **Color Scheme**: Professional green theme
- **Typography**: Bold, clean "ROUTES" text with increased letter spacing

### Logo Variations
1. **Full Logo**: Icon + "ROUTES" text (horizontal and vertical layouts)
2. **Icon Only**: Just the route lines and car symbol
3. **Animated Version**: Rotating logo for loading states

## Usage Guidelines

### File Structure
- Logo widget: `lib/widgets/routes_logo.dart`
- Main classes: `RoutesLogo` and `AnimatedRoutesLogo`

### Implementation
```dart
// Standard logo
RoutesLogo(
  size: 48.0,
  showText: true,
  color: Theme.of(context).colorScheme.primary,
)

// Animated version
AnimatedRoutesLogo(
  size: 80.0,
  showText: true,
)
```

### App Integration
- **Home Screen**: Large animated logo with brand name
- **App Bars**: Small logo with text in navigation headers  
- **Loading States**: Animated logo for visual feedback
- **Color Theme**: Consistent green color scheme throughout

## Brand Messaging

**Mission**: Connecting communities through shared transportation  
**Values**: Sustainability, Community, Convenience, Safety  
**Voice**: Friendly, Professional, Reliable

## Technical Implementation

### Color Palette
- **Primary Green**: `Color(0xFF2E7D32)`
- **Light Green**: `Color(0xFF4CAF50)` (gradients)
- **White**: Text and icons on colored backgrounds
- **System Colors**: Material Design 3 adaptive colors

### Typography
- **Logo Text**: Bold, uppercase, letter-spaced
- **App Title**: "Routes - Ride Together"
- **Headers**: Material Design 3 typography scale

This rebrand transforms the app from "Hoopin" to "Routes", emphasizing the core functionality of route-sharing while maintaining a professional, eco-friendly aesthetic.