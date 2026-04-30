import React from 'react'; // Fixed casing
import { Text } from 'react-native'; // Removed StyleSheet since it's unused here
import { Typography } from '../../constants/theme';

const BebaText = ({
    children,
    category = 'body1',
    color,
    center = false,
    style,
    ...props
}) => {

    // Removed the "() =>" so this is a variable, not a function
    const combinedStyle = [
        Typography[category],
        color && { color },
        center && { textAlign: 'center' },
        style,
    ];

    return (
        // Pass the array directly to the style prop
        <Text style={combinedStyle} {...props}>
            {children}
        </Text>
    );
}

export default BebaText; // Don't forget to export!