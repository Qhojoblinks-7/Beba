/**
 * Beba Theme Configurations
 * BAsed on te Established Style and Color Plallete
 */

export const Palette = {
    //Brand Colors
    primary: '#00A63E',    //Foredt green (Sucess/Active)
    secondary: '#174E4F',   //Deep Teal (Brand Identity/Surface)
    accent: '#FCC800',      //Amber Gold (Grace Period/Warnings)
    danger: '#E7000B',     // Vibrant Red (Food Priority/ Late Fees)

    //Neutral Colors
    background: '#F5F5F5',  // Light Gray (App Background)
    surface: '#FFFFFF',     // Pure White (Cards/Modals)
    textPrimary: '#212121', // Dark Gray (Primary Text)
    textSecondary: '#757575', // Medium Gray (Secondary Text)
    disabled: '#BDBDBD',    // Light Gray (Disabled Elements)
    placeholder: '#9E9E9E', // Medium Gray (Input Placeholders)

    //Status Colors
    success: '#4CAF50',     // Green (Success Messages)
    warning: '#FFC107',     // Amber (Warnings/Alerts)
    error: '#F44336',       // Red (Error Messages)

    // Extended grayscale (Material Design scale)
    gray50: '#FFFFFF',
    gray100: '#FAFAFA',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',

    // Convenience colors
    black: '#000000',
    white: '#FFFFFF',
}

export const Typography = {
    // Heading Style
    h1:{
        fontSize: 32,
        FontWeight: '500', //Medium
        color: Palette.textPrimary,
    },
    // Subheading Style
    h2:{
        fontSize: 24,
        FontWeight: '500', // Medium
        color: Palette.textPrimary,
    },

    h3:{
        fontSize: 17,
        FontWeight: '600',
        color: Palette.textPrimary,
    },
    h4:{
        fontSize: 15,
        FontWeight: '600',
        color: Palette.textPrimary,
    },
    

    // Body Style
    body1:{
        fontSize: 16,
        FontWeight: '400',
        color: Palette.textSecondary,
    },
    body2:{
        fontSize: 14,
        FontWeight: '500',
        color: Palette.textSecondary,
    },
    body3:{
        fontSize: 12,
        FontWeight: '400',
        color: Palette.textSecondary,
    },
    body4:{
        fontSize: 13,
        FontWeight: '400',
        color: Palette.textSecondary,
    }
    
};

export const Spacing = {
    gutter: 24, // From the sides of the screen
    column: 75, // Between columns
    row: 16,    // Between rows
    card: 16,   // Inside cards
    modal: 24,  // Inside modals
    padding: 16, // General padding for components
    borderRadius: 24, // Standard border radius for buttons and cards
};

export default {
    Palette,
    Typography,
    Spacing,
};