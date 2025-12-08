
import Colors from '@/constants/Colors';
import { DatePlan } from '@/utils/aiPlanner';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface DateProposalProps {
    plan: DatePlan;
    onAccept: () => void;
    onRetry: () => void;
}

export default function DateProposal({ plan, onAccept, onRetry }: DateProposalProps) {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerLabel}>AI PROPOSAL</Text>

            <View style={styles.card}>
                <View style={styles.tagsRow}>
                    {plan.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.title}>{plan.title}</Text>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Location</Text>
                    <Text style={styles.detailValue}>{plan.location}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Est. Cost</Text>
                    <Text style={styles.detailValue}>{plan.cost}</Text>
                </View>

                <View style={styles.descriptionBox}>
                    <Text style={styles.description}>{plan.description}</Text>
                </View>
            </View>

            <View style={styles.buttonsContainer}>
                <Pressable style={styles.acceptButton} onPress={onAccept}>
                    <Text style={styles.acceptButtonText}>Accept Plan 💖</Text>
                </Pressable>

                <Pressable style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryButtonText}>Try Again 🔄</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        paddingTop: 40,
    },
    headerLabel: {
        fontSize: 12,
        fontFamily: 'Lato_700Bold',
        letterSpacing: 2,
        color: '#A8A29E',
        marginBottom: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 40,
        alignItems: 'center',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    tag: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    tagText: {
        fontSize: 12,
        color: '#57534E',
        fontFamily: 'Nunito_700Bold',
    },
    title: {
        fontSize: 26,
        fontFamily: 'PlayfairDisplay_700Bold',
        color: '#1C1917',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 34,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#E7E5E4',
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 16,
        color: '#78716C',
        fontFamily: 'Lato_400Regular',
    },
    detailValue: {
        fontSize: 16,
        color: '#292524',
        fontFamily: 'Nunito_700Bold',
    },
    descriptionBox: {
        marginTop: 16,
        backgroundColor: '#FFF5F7',
        padding: 16,
        borderRadius: 16,
        width: '100%',
    },
    description: {
        fontSize: 14,
        color: '#881337', // Dark Rose
        fontFamily: 'Lato_400Regular',
        lineHeight: 22,
        textAlign: 'center',
    },
    buttonsContainer: {
        width: '100%',
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
