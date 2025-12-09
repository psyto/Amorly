import BackgroundGradient from '@/components/BackgroundGradient';
import EmotionSlider from '@/components/EmotionSlider';
import { Text, View } from '@/components/Themed';
import { useEvent } from '@/context/EventContext';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function TabOneScreen() {
  // Emma Hart Design: Clean, Minimal, Warm.
  const { getPendingReviewEvent, getNextScheduledEvent, rateEvent, saveDraftRating, startReview, events } = useEvent();
  const [partnerValue, setPartnerValue] = useState<number | null>(null);
  const [statusText, setStatusText] = useState("Was it worth it?");
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Logic: Show Pending Review first. If none, show Next Scheduled info.
  // Recalculate when events change to ensure reactivity
  const activeEvent = getPendingReviewEvent();
  const nextEvent = getNextScheduledEvent();
  const displayEvent = activeEvent || nextEvent;
  
  // Debug: Log events for troubleshooting
  useEffect(() => {
    console.log('Events in Home screen:', {
      total: events.length,
      pendingReview: events.filter(e => e.status === 'pending_review').length,
      scheduled: events.filter(e => e.status === 'scheduled').length,
      completed: events.filter(e => e.status === 'completed').length,
      activeEventId: activeEvent?.id,
      nextEventId: nextEvent?.id
    });
  }, [events, activeEvent?.id, nextEvent?.id]);

  // Debugging: Reset state when activeEvent changes (e.g. user toggles between events or finishes one)
  // This ensures the slider is re-enabled for the new event.
  // Using useEffect to avoid render-loop issues
  useEffect(() => {
    setIsResultVisible(false);
    setPartnerValue(null);
    setStatusText("Was it worth it?");
    setUserRating(0);
  }, [activeEvent?.id]); // Only run when the ID changes (or becomes undefined)

  const handleUserSlide = (val: number) => {
    // Only allow sliding if we are reviewing and not already showing result
    if (!activeEvent || isResultVisible) return;

    // Reset if user is sliding again
    setPartnerValue(null);
    setStatusText("Waiting for partner...");

    if (timerRef.current) clearTimeout(timerRef.current);

    // Simulation: Partner responds after 1.5 seconds
    timerRef.current = setTimeout(() => {
      // Logic: Partner determines if they are synced (60%) or have a gap (40%)
      const isSynced = Math.random() > 0.4;
      let simulatedResp;

      if (!isSynced) {
        // Create a GAP
        // If user is high, go low. If user is low, go high.
        if (val > 0.6) {
          simulatedResp = Math.max(0, val - (0.3 + Math.random() * 0.3)); // Drop significantly
        } else {
          simulatedResp = Math.min(1, val + (0.3 + Math.random() * 0.3)); // Increase significantly
        }
      } else {
        // SYNCED
        // Very close to user value (+/- 0.05)
        simulatedResp = Math.max(0, Math.min(1, val + (Math.random() * 0.1 - 0.05)));
      }

      setPartnerValue(simulatedResp);
      setUserRating(val);
      setIsResultVisible(true);

      // Calc difference
      const diff = Math.abs(val - simulatedResp);
      let newStatusText = "";
      if (diff < 0.15) newStatusText = "Spot On ✨";
      else if (diff < 0.4) newStatusText = "Difference 👀";
      else newStatusText = "Discuss ☕️";

      setStatusText(newStatusText);

      // Save Draft Rating instantly so it reflects in Calendar
      if (activeEvent) {
        saveDraftRating(activeEvent.id, val, newStatusText);
      }

    }, 1500);
  };

  const handleCollectMemory = () => {
    if (!activeEvent) return;
    
    // Save the rating and mark as completed
    rateEvent(activeEvent.id, userRating, statusText);
    
    // Find the next scheduled event BEFORE state update
    // We need to get it from the current events array, not the function
    const currentScheduledEvents = events.filter(e => e.status === 'scheduled');
    const nextScheduledEvent = currentScheduledEvents[0]; // Get the first scheduled event
    
    // Automatically start review for the next scheduled event
    if (nextScheduledEvent) {
      console.log('Auto-starting review for next event:', nextScheduledEvent.id);
      // Use setTimeout to ensure rateEvent state update completes first
      setTimeout(() => {
        startReview(nextScheduledEvent.id);
      }, 50);
    }

    // Reset State
    setIsResultVisible(false);
    setPartnerValue(null);
    setStatusText("Was it worth it?");
    setUserRating(0);
  };

  return (
    <View style={styles.mainContainer}>
      <BackgroundGradient />

      <View style={styles.container} transparent>
        <View style={styles.header} transparent>
          <Text style={styles.title}>Amorly</Text>
          <Text style={styles.subtitle}>align your values</Text>
        </View>

        <View style={styles.content} transparent>
          {/* Context Card: Active (Rate) or Next (Info) */}
          {displayEvent ? (
            <View style={styles.eventCard}>
              <Text style={styles.eventLabel}>
                {isResultVisible ? "MATCHING RESULT 💖" : (activeEvent ? `RATE: ${displayEvent.date}` : `UPCOMING: ${displayEvent.date}`)}
              </Text>
              <Text style={styles.eventTitle}>{displayEvent.title}</Text>
              <Text style={styles.eventPrice}>${displayEvent.price}</Text>

              {/* Only show badge if we have a price to compare AND result is NOT visible? Or keep it? */}
              {/* User said 'Event's Ready to Rate! to matching evaluation'. 
                  'Ready to Rate' text isn't here, it's 'RATE: ...'. 
                  So I'm updating that label. 
                  Also, let's substitute the GoalBadge with the Result text if avail? 
              */}
              {!isResultVisible ? (
                <GoalAlignmentBadge eventPrice={displayEvent.price} />
              ) : (
                <View style={[styles.goalBadge, { backgroundColor: '#FFF5F7', borderColor: '#E11D48' }]}>
                  <Text style={[styles.goalBadgeText, { color: '#E11D48' }]}>
                    Result: {statusText}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.eventCard}>
              <Text style={styles.eventLabel}>NOTHING PLANNED</Text>
              <Text style={styles.eventTitle}>Relaxing Day</Text>
              <Link href="/calendar" asChild>
                <Pressable style={styles.logButton}>
                  <Text style={styles.logButtonText}>Plan a Date</Text>
                </Pressable>
              </Link>
            </View>
          )}

          {activeEvent ? (
            <>
              <Text style={styles.question}>{statusText}</Text>
              <EmotionSlider
                onValueChange={handleUserSlide}
                partnerValue={partnerValue}
                disabled={isResultVisible}
                value={userRating}
              />

              {isResultVisible && (
                <Pressable style={styles.collectButton} onPress={handleCollectMemory}>
                  <Text style={styles.collectButtonText}>Collect Memory ✨</Text>
                </Pressable>
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.question}>
                {nextEvent ? "Have you completed this date?" : "Plan a date to start alignment."}
              </Text>
              {nextEvent && (
                <Pressable style={styles.collectButton} onPress={() => startReview(nextEvent.id)}>
                  <Text style={styles.collectButtonText}>Rate This Date 💖</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    marginTop: 40,
    fontFamily: 'PlayfairDisplay_700Bold', // Elegant Serif
    color: '#4C0519', // Deep Wine
  },
  subtitle: {
    fontSize: 18,
    color: '#E11D48', // Rose Red
    fontFamily: 'PlayfairDisplay_400Regular', // Italic-like vibe
    fontStyle: 'italic',
    marginBottom: 40,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#E11D48", // Rose shadow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFE4E6', // Soft Rose Border
  },
  eventLabel: {
    fontSize: 12,
    fontFamily: 'Lato_700Bold',
    color: '#FDA4AF', // Light Rose
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#4C0519', // Deep Wine
    textAlign: 'center',
    marginBottom: 4,
  },
  eventPrice: {
    fontSize: 20,
    fontFamily: 'Lato_400Regular',
    color: '#9F1239', // Medium Rose
    marginBottom: 16,
  },
  logButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F4', // Stone 100
  },
  logButtonText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#78716C',
  },
  question: {
    fontSize: 18,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 40,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 26,
    minHeight: 30,
  },
  goalBadge: {
    marginTop: 20,
    backgroundColor: '#F0FDF4', // Green 50 (default)
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  goalBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#15803D', // Green 700
  },
  collectButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 30,
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectButtonText: {
    color: '#FFF',
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
  }
});

import Colors from '@/constants/Colors'; // Ensure Colors is imported for styles usage above!
import { useGoals } from '@/context/GoalContext';

function GoalAlignmentBadge({ eventPrice }: { eventPrice: string }) {
  const { goals } = useGoals();
  // Default to the first goal if none are specifically "active" (context didn't track active, so we pick first)
  // Real logic: In a real app, users select which goal this applies to.
  const activeGoal = goals.find(g => g.isCompleted) || goals[0];

  if (!activeGoal) return null;

  const price = parseFloat(eventPrice) || 0;
  const goalTarget = parseFloat(activeGoal.amount) || 1; // avoid divide by zero

  const percentage = (price / goalTarget) * 100;

  let status = "On Track ✅";
  let styleColor = { bg: '#F0FDF4', border: '#DCFCE7', text: '#15803D' }; // Green

  if (percentage > 15) {
    status = "Splurge 🥂";
    styleColor = { bg: '#FFF1F2', border: '#FFE4E6', text: '#BE123C' }; // Red/Pink
  } else if (percentage > 5) {
    status = "Balanced ⚖️";
    styleColor = { bg: '#FEFCE8', border: '#FEF9C3', text: '#A16207' }; // Yellow
  }

  return (
    <View style={[styles.goalBadge, { backgroundColor: styleColor.bg, borderColor: styleColor.border }]}>
      <Text style={[styles.goalBadgeText, { color: styleColor.text }]}>
        Goal: {status}
      </Text>
    </View>
  );
}
