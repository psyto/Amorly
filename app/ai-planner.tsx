
import EmotionInput from '@/components/AI/EmotionInput';
import Colors from '@/constants/Colors';
import { useEvent } from '@/context/EventContext';
import { useGoals } from '@/context/GoalContext';
import { DatePlan, generateMonthlyPlan, PlannerContext } from '@/utils/aiPlanner';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Activity, Heart, Moon, Music, Palette, Trees, Utensils } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Step = 'input' | 'loading' | 'proposal';

export default function AIPlannerScreen() {
    const [step, setStep] = useState<Step>('input');
    const [plans, setPlans] = useState<DatePlan[]>([]);
    const { addEvent, events } = useEvent();
    const { dateSettings } = useGoals();

    const processGenerate = async (context: PlannerContext) => {
        setStep('loading');
        try {
            const budget = parseFloat(dateSettings.monthlyBudget) || 200;
            const count = parseInt(dateSettings.datesPerMonth) || 4;

            // Legacy compositeMood (still passed but mostly ignored by new logic)
            let compositeMood = 0.5;

            const results = await generateMonthlyPlan(budget, count, compositeMood, {
                ...context,
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
            addEvent(plan.title, plan.cost.replace(/[^0-9.]/g, '') || '0', 'Upcoming', 'scheduled');
        });
        router.back();
    };

    const handleRetry = () => {
        setPlans([]);
        setStep('input');
    };

    // Helper to get icon for category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Food': return <Utensils size={16} color={Colors.light.tint} />;
            case 'Nature': return <Trees size={16} color={Colors.light.tint} />;
            case 'Art': return <Palette size={16} color={Colors.light.tint} />;
            case 'Active': return <Activity size={16} color={Colors.light.tint} />;
            case 'Music': return <Music size={16} color={Colors.light.tint} />;
            case 'Nightlife': return <Moon size={16} color={Colors.light.tint} />;
            default: return <Heart size={16} color={Colors.light.tint} />;
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'AI Planner 🪄',
                headerTransparent: false,
                headerTintColor: '#4C0519',
                headerStyle: { backgroundColor: '#FAFAF9' },
                headerShadowVisible: false,
            }} />

            <View style={styles.content}>
                {step === 'input' && (
                    <EmotionInput onGenerate={processGenerate} />
                )}

                {step === 'loading' && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.light.tint} />
                        <Text style={styles.loadingText}>Crafting your perfect month... 💘</Text>
                    </View>
                )}

                {step === 'proposal' && (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.headerLabel}>YOUR PERSONALIZED PLAN</Text>

                        {plans.map((plan, index) => (
                            <View key={index} style={styles.miniCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.categoryTag}>
                                        {getCategoryIcon(plan.category)}
                                        <Text style={styles.categoryText}>{plan.category}</Text>
                                    </View>
                                    <Text style={styles.miniCost}>{plan.cost}</Text>
                                </View>

                                <Text style={styles.miniTitle}>{plan.title}</Text>
                                <Text style={styles.miniDesc}>{plan.description}</Text>

                                <View style={styles.tagsRow}>
                                    {plan.tags.slice(0, 3).map(tag => (
                                        <Text key={tag} style={styles.tag}>#{tag}</Text>
                                    ))}
                                </View>
                            </View>
                        ))}

                        <View style={styles.buttonsContainer}>
                            <Pressable style={styles.acceptButton} onPress={handleAcceptAll}>
                                <Text style={styles.acceptButtonText}>Accept All ({plans.length} Dates) 💖</Text>
                            </Pressable>

                            <Pressable style={styles.retryButton} onPress={handleRetry}>
                                <Text style={styles.retryButtonText}>Start Over 🔄</Text>
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
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F5F5F4',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F2',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        gap: 6,
    },
    categoryText: {
        fontSize: 12,
        fontFamily: 'Lato_700Bold',
        color: Colors.light.tint,
        textTransform: 'uppercase',
    },
    miniTitle: {
        fontSize: 20,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#292524',
        marginBottom: 8,
    },
    miniCost: {
        fontSize: 16,
        fontFamily: 'Lato_700Bold',
        color: '#57534E',
    },
    miniDesc: {
        fontSize: 15,
        fontFamily: 'Lato_400Regular',
        color: '#78716C',
        lineHeight: 22,
        marginBottom: 12,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        fontSize: 12,
        fontFamily: 'Nunito_700Bold',
        color: '#A8A29E',
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
