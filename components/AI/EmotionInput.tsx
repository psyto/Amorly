
import Colors from '@/constants/Colors';
import { InterestType, MoodType, PlannerContext } from '@/utils/aiPlanner';
import { Activity, Coffee, Gamepad2, Heart, Home, MapPin, Moon, Mountain, Music, Palette, Tent, Trees, Utensils, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const { width } = Dimensions.get('window');

interface EmotionInputProps {
    onGenerate: (context: PlannerContext) => void;
}

const MOODS: { label: MoodType; Icon: React.ElementType; color: string }[] = [
    { label: 'Energized', Icon: Zap, color: '#F59E0B' },
    { label: 'Relaxed', Icon: Coffee, color: '#10B981' },
    { label: 'Romantic', Icon: Heart, color: '#EC4899' },
    { label: 'Adventurous', Icon: Mountain, color: '#3B82F6' },
    { label: 'Playful', Icon: Gamepad2, color: '#8B5CF6' },
    { label: 'Cozy', Icon: Home, color: '#F97316' },
];

const INTERESTS: { label: InterestType; Icon: React.ElementType }[] = [
    { label: 'Food', Icon: Utensils },
    { label: 'Nature', Icon: Trees },
    { label: 'Art', Icon: Palette },
    { label: 'Active', Icon: Activity },
    { label: 'Music', Icon: Music },
    { label: 'Nightlife', Icon: Moon },
];

export default function EmotionInput({ onGenerate }: EmotionInputProps) {
    const [step, setStep] = useState(1);

    // State for inputs
    const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
    const [selectedInterests, setSelectedInterests] = useState<InterestType[]>([]);
    const [city, setCity] = useState('');
    const [environment, setEnvironment] = useState<'Indoor' | 'Outdoor' | 'Any'>('Any');

    const handleInterestToggle = (interest: InterestType) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(prev => prev.filter(i => i !== interest));
        } else {
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            // Finish
            onGenerate({
                mood: selectedMood,
                interests: selectedInterests,
                city: city || 'San Francisco', // デフォルト値を具体的な都市名に変更
                environment
            });
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const isNextDisabled = () => {
        if (step === 1) return !selectedMood;
        if (step === 2) return selectedInterests.length === 0;
        return false;
    };

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Step 1: Mood */}
                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>How are you feeling?</Text>
                        <Text style={styles.stepSubtitle}>Select your vibe for this month.</Text>

                        <View style={styles.grid}>
                            {MOODS.map((m) => (
                                <Pressable
                                    key={m.label}
                                    style={[
                                        styles.moodCard,
                                        selectedMood === m.label && styles.selectedMoodCard,
                                        selectedMood === m.label && { backgroundColor: m.color, borderColor: m.color }
                                    ]}
                                    onPress={() => setSelectedMood(m.label)}
                                >
                                    <View style={[styles.iconCircle, selectedMood === m.label && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <m.Icon size={24} color={selectedMood === m.label ? '#FFF' : m.color} />
                                    </View>
                                    <Text style={[styles.moodLabel, selectedMood === m.label && { color: '#FFF' }]}>{m.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Step 2: Interests */}
                {step === 2 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>What do you enjoy?</Text>
                        <Text style={styles.stepSubtitle}>Pick at least one interest.</Text>

                        <View style={styles.chipContainer}>
                            {INTERESTS.map((item) => {
                                const isSelected = selectedInterests.includes(item.label);
                                return (
                                    <Pressable
                                        key={item.label}
                                        style={[styles.chip, isSelected && styles.selectedChip]}
                                        onPress={() => handleInterestToggle(item.label)}
                                    >
                                        <item.Icon size={20} color={isSelected ? '#FFF' : '#78716C'} />
                                        <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>{item.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Step 3: Location */}
                {step === 3 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Where should we go?</Text>
                        <Text style={styles.stepSubtitle}>Customize your location preferences.</Text>

                        <Text style={styles.label}>City</Text>
                        <View style={styles.inputWrapper}>
                            <MapPin size={20} color="#A8A29E" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. San Francisco"
                                value={city}
                                onChangeText={setCity}
                                placeholderTextColor="#D6D3D1"
                            />
                        </View>

                        <Text style={styles.label}>Environment</Text>
                        <View style={styles.envRow}>
                            {(['Any', 'Indoor', 'Outdoor'] as const).map(opt => (
                                <Pressable
                                    key={opt}
                                    style={[styles.envOption, environment === opt && styles.selectedEnvOption]}
                                    onPress={() => setEnvironment(opt)}
                                >
                                    {opt === 'Indoor' && <Home size={18} color={environment === opt ? '#FFF' : '#78716C'} />}
                                    {opt === 'Outdoor' && <Tent size={18} color={environment === opt ? '#FFF' : '#78716C'} />}
                                    <Text style={[styles.envText, environment === opt && styles.selectedEnvText]}>{opt}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                {step > 1 ? (
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </Pressable>
                ) : <View style={{ width: 80 }} />}

                <Pressable
                    style={[styles.nextButton, isNextDisabled() && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={isNextDisabled()}
                >
                    <Text style={styles.nextButtonText}>{step === 3 ? 'Generate Plan ✨' : 'Continue'}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#FCFAF9',
    },
    progressContainer: {
        width: '100%',
        height: 4,
        backgroundColor: '#E7E5E4',
        marginBottom: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.light.tint,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    stepContainer: {
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 26,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#4C0519',
        textAlign: 'center',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        fontFamily: 'Lato_400Regular',
        color: '#78716C',
        textAlign: 'center',
        marginBottom: 30,
    },
    // Grid for Moods
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    moodCard: {
        width: (width - 60) / 2,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F5F5F4',
        marginBottom: 10,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedMoodCard: {
        transform: [{ scale: 1.02 }],
        borderColor: 'transparent',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F5F5F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    moodLabel: {
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
        color: '#57534E',
    },
    // Interests
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E7E5E4',
        gap: 8,
    },
    selectedChip: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    chipText: {
        fontSize: 16,
        fontFamily: 'Lato_700Bold',
        color: '#78716C',
    },
    selectedChipText: {
        color: '#FFF',
    },
    // Location Inputs
    label: {
        alignSelf: 'flex-start',
        fontSize: 14,
        fontFamily: 'Nunito_700Bold',
        color: '#A8A29E',
        marginBottom: 8,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Lato_400Regular',
        color: '#292524',
    },
    envRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    envOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
        borderRadius: 16,
        gap: 6,
    },
    selectedEnvOption: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    envText: {
        fontSize: 16,
        fontFamily: 'Lato_700Bold',
        color: '#78716C',
    },
    selectedEnvText: {
        color: '#FFF',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F4',
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
        color: '#78716C',
    },
    nextButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#E7E5E4',
        shadowOpacity: 0,
    },
    nextButtonText: {
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
        color: '#FFF',
    },
    disabledButtonText: {
        color: '#A8A29E',
    },
});
