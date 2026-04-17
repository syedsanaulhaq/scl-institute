# SCL Institute Moodle Theme

A modern, professional Moodle theme designed to match the SCL institutional branding and website design system.

## Features

- **SCL Purple Design System**: Custom color palette based on SCL React frontend
  - Primary: #6B46C1 (SCL Purple)
  - Secondary: #553399 (SCL Dark)
  - Accent: #8B5CF6 (SCL Light)
  - Background: #F7F9FC (Professional Light)

- **Modern UI Components**
  - Gradient navbar with smooth navigation
  - Professional card layouts with hover effects
  - Custom sidebar navigation with active states
  - Beautiful forms and buttons
  - Responsive design for all devices

- **Professional Styling**
  - Consistent typography using system fonts
  - Box shadows and rounded corners for depth
  - Smooth transitions and animations
  - Accessibility-first approach

- **Based on Boost**: Inherits from Moodle's Boost theme for maximum compatibility

## Installation

1. Extract this folder to `/var/www/moodle/theme/scltheme/`
2. Log in to Moodle as administrator
3. Go to Site administration > Appearance > Themes > Theme selector
4. Select "SCL Institute Theme" and save

## Customization

All styling is controlled in `scss/custom.scss`. Key sections:
- Color palette definitions at top
- Navbar styling
- Sidebar navigation
- Cards and content blocks
- Buttons and forms
- Responsive behavior

## Color Palette

```
$scl-purple:    #6B46C1   - Primary brand color
$scl-dark:      #553399   - Dark variant for gradients
$scl-light:     #8B5CF6   - Light accent color
$scl-lighter:   #E9D5FF   - Very light backgrounds
$scl-bg:        #F7F9FC   - Page background
$scl-text:      #1F2937   - Default text color
$scl-white:     #FFFFFF   - White
$scl-error:     #EF4444   - Error/danger
$scl-success:   #10B981   - Success
$scl-warning:   #F59E0B   - Warning
$scl-info:      #3B82F6   - Info
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Version

- Theme: 1.0.0
- Moodle: 4.5+
- Release: April 2026

## License

This theme is released under the GNU General Public License v3. See LICENSE file for details.
