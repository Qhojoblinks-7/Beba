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

    // Neutral Palette (Matches the clean "Testora" look)
    white: '#FFFFFF',
    background: '#F3F4F6',  // Light gray background seen behind cards
    surface: '#FFFFFF',     // Pure white for the card bodies
    border: '#E5E7EB',      // Subtle borders for search bars and inputs
    
    // Text Hierarchy
    textPrimary: '#000000', 
    textSecondary: '#6A7282',
    textTertiary: '#99A1AF',
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
    // The reference uses very round corners for buttons but tighter ones for cards
    cardRadius: 24, 
    buttonRadius: 12,
    inputRadius: 10,
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