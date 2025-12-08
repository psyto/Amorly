import Colors from '@/constants/Colors';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface EmotionInputProps {
    onGenerate: (energy: 'Chill' | 'Energetic', weather: 'Sunny' | 'Rainy') => void;
}

export default function EmotionInput({ onGenerate }: EmotionInputProps) {
    const [energy, setEnergy] = useState<'Chill' | 'Energetic'>('Chill');
    const [weather, setWeather] = useState<'Sunny' | 'Rainy'>('Sunny');

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Plan a Date ✨</Text>
            <Text style={styles.headerSubtitle}>Let AI handle the stress.</Text>

            {/* Context Selectors */}
            <View style={styles.selectorContainer}>
                <Text style={styles.label}>Energy Level</Text>
                <View style={styles.row}>
                    <Pressable
                        style={[styles.chip, energy === 'Chill' && styles.activeChip]}
                        onPress={() => setEnergy('Chill')}
                    >
                        <Text style={[styles.chipText, energy === 'Chill' && styles.activeChipText]}>😌 Chill</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.chip, energy === 'Energetic' && styles.activeChip]}
                        onPress={() => setEnergy('Energetic')}
                    >
                        <Text style={[styles.chipText, energy === 'Energetic' && styles.activeChipText]}>⚡️ Active</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.selectorContainer}>
                <Text style={styles.label}>Weather Forecast</Text>
                <View style={styles.row}>
                    <Pressable
                        style={[styles.chip, weather === 'Sunny' && styles.activeChip]}
                        onPress={() => setWeather('Sunny')}
                    >
                        <Text style={[styles.chipText, weather === 'Sunny' && styles.activeChipText]}>☀️ Sunny</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.chip, weather === 'Rainy' && styles.activeChip]}
                        onPress={() => setWeather('Rainy')}
                    >
                        <Text style={[styles.chipText, weather === 'Rainy' && styles.activeChipText]}>☔️ Rainy</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.spacer} />

            <Pressable style={styles.generateButton} onPress={() => onGenerate(energy, weather)}>
                <Text style={styles.generateButtonText}>✨ Generate Plan</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#4C0519',
        textAlign: 'center',
        marginBottom: 10,
    },
    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'Lato_400Regular',
        color: '#78716C',
        textAlign: 'center',
        marginBottom: 30,
    },
    selectorContainer: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Nunito_700Bold',
        color: '#A8A29E',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
    },
    activeChip: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    chipText: {
        fontFamily: 'Lato_700Bold',
        color: '#78716C',
    },
    activeChipText: {
        color: '#FFF',
    },
    spacer: {
        height: 10,
    },
    generateButton: {
        width: '100%',
        backgroundColor: Colors.light.tint,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 10
    },
    generateButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
    },
});
