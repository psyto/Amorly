import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Event, useEvent } from '@/context/EventContext';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export default function CalendarScreen() {
    const { events, markAsDone } = useEvent();

    // Simple sort: Pending/Scheduled first
    const upcomingEvents = events.filter(e => e.status !== 'completed');
    const pastEvents = events.filter(e => e.status === 'completed');

    const getRatingLabel = (rating?: number) => {
        if (rating === undefined) return '';
        if (rating < 0.25) return 'Result: Casual ☕️';
        if (rating < 0.75) return 'Result: Spot On ✨';
        return 'Result: A Treat 🥂';
    };

    const renderEventCard = (event: Event) => (
        <Link key={event.id} href="/(tabs)" asChild disabled={event.status !== 'pending_review'}>
            <Pressable style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>{event.date}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventPrice}>${event.price}</Text>
                        {event.status === 'pending_review' && (
                            event.matchResult ? (
                                <Text style={styles.ratingText}>Result: {event.matchResult}</Text>
                            ) : (
                                <Text style={styles.statusText}>Ready to Rate! (Tap to Rate)</Text>
                            )
                        )}
                        {event.status === 'completed' && (
                            <Text style={styles.ratingText}>Result: {event.matchResult || getRatingLabel(event.rating)}</Text>
                        )}
                    </View>
                </View>

                {event.status === 'scheduled' && (
                    <Pressable style={styles.actionButton} onPress={() => markAsDone(event.id)}>
                        <Text style={styles.actionButtonText}>Mark Done</Text>
                    </Pressable>
                )}
            </Pressable>
        </Link>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calendar 🗓️</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>UPCOMING</Text>
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(renderEventCard)
                ) : (
                    <Text style={styles.emptyText}>No upcoming dates. Plan one?</Text>
                )}

                {pastEvents.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>MEMORIES</Text>
                        {pastEvents.map(renderEventCard)}
                    </>
                )}
            </ScrollView>

            {/* FAB to Add Event (Now used for AI Planner) */}
            <Link href="/ai-planner" asChild>
                <Pressable style={styles.fab}>
                    <Text style={styles.fabIcon}>✨</Text>
                </Pressable>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F7', // Rose Water
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFF5F7',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#FFE4E6', // Soft Rose
    },
    headerTitle: {
        fontSize: 24, // Bigger
        fontFamily: 'PlayfairDisplay_700Bold', // Serif
        color: '#4C0519', // Wine
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Lato_700Bold',
        color: '#A8A29E',
        letterSpacing: 1.5,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Lato_400Regular',
        color: '#A8A29E',
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dateBadge: {
        backgroundColor: '#F5F5F4',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginRight: 15,
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'Lato_700Bold',
        color: '#57534E',
    },
    info: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 18,
        fontFamily: 'Nunito_700Bold',
        color: '#292524',
    },
    eventPrice: {
        fontSize: 14,
        fontFamily: 'Lato_400Regular',
        color: '#78716C',
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Nunito_700Bold',
        color: Colors.light.tint,
        marginTop: 2,
    },
    actionButton: {
        backgroundColor: '#FEF2F2',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginLeft: 10,
    },
    actionButtonText: {
        fontSize: 12,
        fontFamily: 'Nunito_700Bold',
        color: '#EF4444',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.light.tint,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFF',
    },
    ratingText: {
        fontSize: 14,
        fontFamily: 'Nunito_700Bold',
        color: '#57534E',
        marginTop: 4,
    }
});
