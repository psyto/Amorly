
import EmotionInput from '@/components/AI/EmotionInput';
import Colors from '@/constants/Colors';
import { useEvent } from '@/context/EventContext';
import { useGoals } from '@/context/GoalContext';
import { DatePlan, generateMonthlyPlan, PlannerContext } from '@/utils/aiPlanner';
import { getPriceLevelSymbol } from '@/utils/restaurantAPI';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Activity, Check, Heart, MapPin, Moon, Music, Palette, Star, Trees, Utensils } from 'lucide-react-native';
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

    const handleSelectPlace = (planIndex: number, placeIndex: number) => {
        const updatedPlans = [...plans];
        const plan = updatedPlans[planIndex];
        const places = plan.placeOptions || plan.restaurantOptions;
        if (places && places[placeIndex]) {
            updatedPlans[planIndex].selectedPlace = places[placeIndex];
            updatedPlans[planIndex].selectedRestaurant = places[placeIndex]; // 後方互換性
        }
        setPlans(updatedPlans);
    };

    const handleAcceptAll = () => {
        plans.forEach(plan => {
            // 場所が選択されている場合は、場所名をタイトルに追加
            let eventTitle = plan.title;
            const selectedPlace = plan.selectedPlace || plan.selectedRestaurant;
            if (selectedPlace) {
                eventTitle = `${plan.title} at ${selectedPlace.name}`;
            }
            addEvent(eventTitle, plan.cost.replace(/[^0-9.]/g, '') || '0', 'Upcoming', 'scheduled');
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

                        {plans.map((plan, planIndex) => (
                            <View key={planIndex} style={styles.miniCard}>
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

                                {/* 場所推薦セクション（全カテゴリ対応） */}
                                {(plan.placeOptions || plan.restaurantOptions) && (plan.placeOptions || plan.restaurantOptions)!.length > 0 && (
                                    <View style={styles.restaurantSection}>
                                        <>
                                            <Text style={styles.restaurantHeader}>
                                                {plan.category === 'Food' && 'Recommended Restaurants 🍽️'}
                                                {plan.category === 'Nature' && 'Recommended Places 🌲'}
                                                {plan.category === 'Art' && 'Recommended Venues 🎨'}
                                                {plan.category === 'Active' && 'Recommended Activities 🏃'}
                                                {plan.category === 'Music' && 'Recommended Venues 🎵'}
                                                {plan.category === 'Nightlife' && 'Recommended Spots 🍸'}
                                            </Text>
                                            {(plan.placeOptions || plan.restaurantOptions)!.slice(0, 3).map((place, placeIndex) => {
                                            const isSelected = (plan.selectedPlace || plan.selectedRestaurant)?.placeId === place.placeId;
                                            return (
                                                <Pressable
                                                    key={restaurant.placeId}
                                                    style={[
                                                        styles.restaurantCard,
                                                        isSelected && styles.restaurantCardSelected
                                                    ]}
                                                    onPress={() => handleSelectPlace(planIndex, placeIndex)}
                                                >
                                                    <View style={styles.restaurantInfo}>
                                                        <View style={styles.restaurantHeaderRow}>
                                                            <Text style={styles.restaurantName}>{place.name}</Text>
                                                            {isSelected && (
                                                                <View style={styles.selectedBadge}>
                                                                    <Check size={14} color="#FFF" />
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View style={styles.restaurantMeta}>
                                                            <View style={styles.ratingRow}>
                                                                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                                                                <Text style={styles.restaurantRating}>
                                                                    {place.rating.toFixed(1)} ({place.userRatingsTotal} reviews)
                                                                </Text>
                                                            </View>
                                                            {plan.category === 'Food' && (
                                                                <Text style={styles.restaurantPrice}>
                                                                    {getPriceLevelSymbol(place.priceLevel)} • 
                                                                    ${place.estimatedCost.toFixed(0)} for two
                                                                </Text>
                                                            )}
                                                            {plan.category !== 'Food' && place.estimatedCost > 0 && (
                                                                <Text style={styles.restaurantPrice}>
                                                                    ${place.estimatedCost.toFixed(0)} for two
                                                                </Text>
                                                            )}
                                                            {plan.category !== 'Food' && place.estimatedCost === 0 && (
                                                                <Text style={styles.restaurantPrice}>Free</Text>
                                                            )}
                                                        </View>
                                                        {place.cuisine && (
                                                            <Text style={styles.restaurantCuisine}>{place.cuisine}</Text>
                                                        )}
                                                        <View style={styles.restaurantAddressRow}>
                                                            <MapPin size={12} color="#78716C" />
                                                            <Text style={styles.restaurantAddress} numberOfLines={1}>
                                                                {place.address}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </Pressable>
                                            );
                                        })}
                                            </>
                                    </View>
                                )}
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
    restaurantSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F4',
    },
    restaurantHeader: {
        fontSize: 14,
        fontFamily: 'Nunito_700Bold',
        color: '#57534E',
        marginBottom: 12,
    },
    restaurantCard: {
        backgroundColor: '#FAFAF9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E7E5E4',
    },
    restaurantCardSelected: {
        backgroundColor: '#FFF5F7',
        borderColor: Colors.light.tint,
        borderWidth: 2,
    },
    restaurantInfo: {
        width: '100%',
    },
    restaurantHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    restaurantName: {
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
        color: '#292524',
        flex: 1,
    },
    selectedBadge: {
        backgroundColor: Colors.light.tint,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    restaurantMeta: {
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    restaurantRating: {
        fontSize: 12,
        fontFamily: 'Lato_400Regular',
        color: '#57534E',
    },
    restaurantPrice: {
        fontSize: 12,
        fontFamily: 'Lato_700Bold',
        color: '#78716C',
    },
    restaurantCuisine: {
        fontSize: 11,
        fontFamily: 'Lato_400Regular',
        color: Colors.light.tint,
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    restaurantAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    restaurantAddress: {
        fontSize: 11,
        fontFamily: 'Lato_400Regular',
        color: '#78716C',
        flex: 1,
    },
    restaurantLoadingText: {
        fontSize: 13,
        fontFamily: 'Lato_400Regular',
        color: '#A8A29E',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 8,
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
