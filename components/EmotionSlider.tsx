import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Colors from '../constants/Colors';

const SLIDER_WIDTH = Dimensions.get('window').width - 48; // Increased margin
const THUMB_SIZE = 50; // Slightly smaller, cuter thumb
const TRACK_HEIGHT = 60; // Thinner track? No, keep chunkiness but lighter.

interface EmotionSliderProps {
    onValueChange?: (value: number) => void;
    partnerValue?: number | null; // 0-1, null = not yet responded
    disabled?: boolean;
}

export default function EmotionSlider({ onValueChange, partnerValue = null, disabled = false }: EmotionSliderProps) {
    // Emma Hart Palette: Pastels
    const theme = Colors.light;

    const offset = useSharedValue(0);
    const partnerOffset = useSharedValue(0); // Ghost thumb position
    const isDragging = useSharedValue(false);
    const [currentLabel, setCurrentLabel] = useState('Comfortable');

    useEffect(() => {
        if (partnerValue !== null) {
            partnerOffset.value = withTiming(partnerValue * (SLIDER_WIDTH - THUMB_SIZE), {
                duration: 1000,
                easing: Easing.out(Easing.exp),
            });
        }
    }, [partnerValue]);

    const updateLabel = (x: number) => {
        const progress = x / (SLIDER_WIDTH - THUMB_SIZE);
        if (progress < 0.25) setCurrentLabel('Casual ☕️');     // Was "Too Cheap"
        else if (progress < 0.75) setCurrentLabel('Spot On ✨'); // Was "Perfect"
        else setCurrentLabel('A Treat 🥂');                    // Was "Too Expensive"

        if (onValueChange) {
            onValueChange(Math.max(0, Math.min(1, progress)));
        }
    };

    const pan = Gesture.Pan()
        .enabled(!disabled) // Disable gesture if disabled
        .onBegin(() => {
            isDragging.value = true;
        })
        .onUpdate((e) => {
            offset.value = Math.max(0, Math.min(e.x - THUMB_SIZE / 2, SLIDER_WIDTH - THUMB_SIZE));
            runOnJS(updateLabel)(offset.value);
        })
        .onFinalize(() => {
            isDragging.value = false;
        });

    const animatedThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value },
                { scale: withSpring(isDragging.value ? 1.1 : 1) },
            ],
            zIndex: 2,
            backgroundColor: '#FFFFFF', // White thumb
        };
    });

    const animatedPartnerThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: partnerOffset.value },
                { scale: withSpring(partnerValue !== null ? 1 : 0) }, // Hide if null
            ],
            opacity: partnerValue !== null ? 0.6 : 0,
            zIndex: 1,
            backgroundColor: Colors.light.tint, // Coral Ghost
        };
    });

    const animatedTrackStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                offset.value,
                [0, (SLIDER_WIDTH - THUMB_SIZE) / 2, SLIDER_WIDTH - THUMB_SIZE],
                ['#BAE6FD', '#E9D5FF', '#FECDD3'] // Pastel Blue -> Purple -> Pink
            ),
        };
    });

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.text }]}>{currentLabel}</Text>
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.track, animatedTrackStyle]}>
                    <Animated.View style={[styles.thumb, animatedThumbStyle]} />
                    <Animated.View style={[styles.thumb, styles.partnerThumb, animatedPartnerThumbStyle]}>
                        <View style={styles.partnerLabel}>
                            <Text style={styles.partnerLabelText}>Partner</Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
            <View style={styles.labelsContainer}>
                <Text style={[styles.subLabel, { color: theme.text }]}>☕️</Text>
                <Text style={[styles.subLabel, { color: theme.text }]}>✨</Text>
                <Text style={[styles.subLabel, { color: theme.text }]}>🥂</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 30, // More breathing room
        alignItems: 'center',
        width: '100%',
    },
    label: {
        fontSize: 24,
        fontFamily: 'Nunito_700Bold',
        marginBottom: 20,
        color: '#292524',
    },
    track: {
        width: SLIDER_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        justifyContent: 'center',
        padding: 5,
        // Soft shadow for the track itself? Maybe faint.
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.05)',
        position: 'absolute', // Needed for overlapping thumbs
        left: 5, // Padding offset
    },
    partnerThumb: {
        elevation: 0,
        borderWidth: 0,
        backgroundColor: Colors.light.tint, // Make sure it's colored
        justifyContent: 'center',
        alignItems: 'center',
    },
    partnerLabel: {
        position: 'absolute',
        top: -25,
        backgroundColor: Colors.light.tint,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    partnerLabelText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Lato_700Bold',
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: SLIDER_WIDTH,
        marginTop: 10,
        paddingHorizontal: 15,
    },
    subLabel: {
        fontSize: 20,
    }
});
