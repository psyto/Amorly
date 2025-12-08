
import EmotionInput from '@/components/AI/EmotionInput';
import Colors from '@/constants/Colors';
import { useEvent } from '@/context/EventContext';
import { useGoals } from '@/context/GoalContext';
import { DatePlan, generateMonthlyPlan } from '@/utils/aiPlanner';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Step = 'input' | 'loading' | 'proposal';

export default function AIPlannerScreen() {
    const [step, setStep] = useState<Step>('input');
    const [plans, setPlans] = useState<DatePlan[]>([]);
    const { addEvent, events } = useEvent();
    const { dateSettings } = useGoals(); // Use settings from context

    const processGenerate = async (energy: 'Chill' | 'Energetic', weather: 'Sunny' | 'Rainy') => {
        setStep('loading');
        try {
            const budget = parseFloat(dateSettings.monthlyBudget) || 200;
            const count = parseInt(dateSettings.datesPerMonth) || 4;

            // Map preferredVibe to compositeMood
            let compositeMood = 0.5;
            if (dateSettings.preferredVibe === 'Adventure') compositeMood = 0.8;
            else if (dateSettings.preferredVibe === 'Comfort') compositeMood = 0.2;
            else compositeMood = 0.5;

            const results = await generateMonthlyPlan(budget, count, compositeMood, {
                energy,
                weather,
                pastEvents: events
            });
            setPlans(results);
            setStep('proposal');
        } catch (error) {
            console.error("Failed to generate plan", error);
            setStep('input');
        }
    };

    const handleAcceptAll = () => {
        plans.forEach(plan => {
            addEvent(plan.title, plan.cost.replace(/[^0-9.]/g, '') || '0', 'Upcoming');
        });
        router.back();
    };

    const handleRetry = () => {
        setPlans([]);
        setStep('input');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Monthly Planner 🗓️',
                headerTransparent: false,
                headerTintColor: '#4C0519',
                headerStyle: { backgroundColor: '#FAFAF9' }
            }} />

            <View style={styles.content}>
                {step === 'input' && (
                    <>
                        <View style={styles.infoBanner}>
                            <Text style={styles.infoText}>
                                Planning {dateSettings.datesPerMonth} dates for ${dateSettings.monthlyBudget}/mo
                            </Text>
                        </View>
                        <EmotionInput
                            onGenerate={processGenerate}
                        />
                    </>
                )}

                {step === 'loading' && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.light.tint} />
                        <Text style={styles.loadingText}>Planning your month... 💘</Text>
                    </View>
                )}

                {step === 'proposal' && (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.headerLabel}>YOUR MONTHLY PLAN</Text>
                        {plans.map((plan, index) => (
                            <View key={index} style={styles.miniCard}>
                                <Text style={styles.miniTitle}>{plan.title}</Text>
                                <Text style={styles.miniCost}>{plan.cost}</Text>
                                <Text style={styles.miniDesc}>{plan.description}</Text>
                            </View>
                        ))}

                        <View style={styles.buttonsContainer}>
                            <Pressable style={styles.acceptButton} onPress={handleAcceptAll}>
                                <Text style={styles.acceptButtonText}>Accept All ({dateSettings.datesPerMonth} Dates) 💖</Text>
                            </Pressable>

                            <Pressable style={styles.retryButton} onPress={handleRetry}>
                                <Text style={styles.retryButtonText}>Try Again 🔄</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                )}
            </View>

            <StatusBar style="dark" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAF9',
    },
    content: {
        flex: 1,
    },
    infoBanner: {
        backgroundColor: '#E7E5E4',
        padding: 10,
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'Lato_700Bold',
        color: '#57534E',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
        color: '#57534E',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    headerLabel: {
        fontSize: 12,
        fontFamily: 'Lato_700Bold',
        letterSpacing: 2,
        color: '#A8A29E',
        marginBottom: 20,
        marginTop: 10,
    },
    miniCard: {
        width: '100%',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    miniTitle: {
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
        color: '#292524',
        marginBottom: 4,
    },
    miniCost: {
        fontSize: 14,
        fontFamily: 'Lato_700Bold',
        color: Colors.light.tint,
        marginBottom: 8,
    },
    miniDesc: {
        fontSize: 14,
        fontFamily: 'Lato_400Regular',
        color: '#78716C',
    },
    buttonsContainer: {
        width: '100%',
        marginTop: 20,
        gap: 16,
    },
    acceptButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    acceptButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
    },
    retryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#78716C',
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
    }
});
