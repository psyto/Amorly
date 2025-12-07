import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Colors from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

interface MicroGoalProps {
    title: string;
    description: string;
    isCompleted?: boolean;
    onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MicroGoalCard({ title, description, isCompleted = false, onPress }: MicroGoalProps) {
    const colorScheme = useColorScheme();
    const theme = Colors.light; // Force light theme
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        if (onPress) onPress();
    };

    return (
        <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.wrapper, animatedStyle]}>
            <View style={[styles.container, { borderColor: isCompleted ? theme.success : 'transparent' }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    {isCompleted && <Text style={styles.badge}>✔️</Text>}
                </View>
                <Text style={[styles.description, { color: theme.text }]}>{description}</Text>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    container: {
        padding: 24,
        borderRadius: 16, // Softer rounding
        backgroundColor: '#FFFFFF', // Paper white
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Nunito_700Bold', // Friendly font
        marginBottom: 4,
        letterSpacing: 0,
    },
    description: {
        fontSize: 16,
        fontFamily: 'Lato_400Regular', // Clean body font
        opacity: 0.8,
        lineHeight: 24,
    },
    badge: {
        fontSize: 16,
    }
});
