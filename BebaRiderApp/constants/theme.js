/**
 * Beba Theme Configurations
 * Optimized for the high-fidelity card layout in the provided reference.
 */

export const Palette = {
    // Brand Colors (Refined from image_81c46c.png)
    secondary: '#00A63E',
    primary: '#174E4F',
    accent: '#FCC800',
    danger: '#E7000B',
    success: '#22c55e',

    // Neutral Palette (Extended with grays for UI elements)
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    background: '#F3F4F6',  // Light gray background
    surface: '#FFFFFF',     // Pure white for cards
    border: '#E5E7EB',      // Subtle borders
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
};

export const Typography = {
    // Main Headers (e.g., "Latest Exam Result")
    h1: {
        fontSize: 22,
        fontWeight: '700', 
        color: Palette.textPrimary,
        letterSpacing: -0.5,
    },
    // Section Headers (e.g., "Upcoming Exams")
    h2: {
        fontSize: 18,
        fontWeight: '600', 
        color: Palette.textPrimary,
    },
    // Sub-labels and Stats (e.g., "Average CGPA")
    h3: {
        fontSize: 15,
        fontWeight: '600',
        color: Palette.textSecondary,
    },
    // Highlighted Values (e.g., "4.65")
    h4: {
        fontSize: 24,
        fontWeight: '700',
        color: Palette.textPrimary,
    },

     // Body Text and Table Content
     body1: {
         fontSize: 14,
         fontWeight: '500', // Used for "Physics", "Math", etc.
         color: Palette.textPrimary,
     },
     body2: {
         fontSize: 13,
         fontWeight: '400', // Used for "10.00 am"
         color: Palette.textSecondary,
     },
     body3: {
         fontSize: 12,
         fontWeight: '500',
         color: Palette.textSecondary,
     },
     body4: {
         fontSize: 11,
         fontWeight: '400',
         color: Palette.textSecondary,
     },
     // Small Labels (e.g., "65 Students")
     caption: {
         fontSize: 12,
         fontWeight: '400',
         color: Palette.textTertiary,
     }
 };

export const Spacing = {
    padding: 16,
    margin: 16,
    gutter: 20,
    // Section/card vertical spacing
    row: 12,
    // Corner radii
    cardRadius: 24,
    buttonRadius: 12,
    inputRadius: 10,
    // Icon sizing
    iconSm: 16,
    iconMd: 24,
    iconLg: 32,
};

// Common Box Shadow for that "Floating Card" look
export const Shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    }
};

export default { Palette, Typography, Spacing, Shadows };



// Rider: Phone: 0555123456 / Password: demo123
// Customer: Phone: 0555987654 / Password: demo123