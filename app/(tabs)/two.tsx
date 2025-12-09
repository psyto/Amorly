import BackgroundGradient from '@/components/BackgroundGradient';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useEvent } from '@/context/EventContext';
import { useGoals } from '@/context/GoalContext';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HarmonyScreen() {
  // Emma Hart Design: Soft Pulse, like a heartbeat.
  const theme = Colors.light;
  const { goals, toggleGoal, dateSettings, updateDateSettings } = useGoals();
  const { events } = useEvent();

  const scale = useSharedValue(1);

  // Calculate Monthly Vibe
  const completedEvents = events.filter(e => e.status === 'completed' && e.rating !== undefined);
  const scheduledEvents = events.filter(e => e.status === 'scheduled');
  const totalPlannedDates = scheduledEvents.length + completedEvents.length;
  
  const monthlyVibe = useMemo(() => {
    if (completedEvents.length === 0) return { text: "No Data Yet 🌱", color: "#A8A29E" };

    const avgRating = completedEvents.reduce((acc, curr) => acc + (curr.rating || 0), 0) / completedEvents.length;

    if (avgRating > 0.8) return { text: "Soulmates 💖", color: "#E11D48" };
    if (avgRating > 0.6) return { text: "In Sync ✨", color: "#DB2777" };
    if (avgRating > 0.4) return { text: "Growing 🌱", color: "#65A30D" };
    return { text: "Needs Love ☕️", color: "#D97706" };
  }, [events, completedEvents]);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowColor: monthlyVibe.color,
  }));

  return (
    <View style={styles.mainContainer}>
      <BackgroundGradient />

      <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
        <View style={styles.header} transparent>
          <Text style={styles.title}>Our Harmony</Text>
          <Text style={styles.subtitle}>Current Vibe ({completedEvents.length} dates)</Text>
        </View>

        <View style={styles.vibeContainer} transparent>
          <Animated.View style={[styles.pulseBubble, animatedBubbleStyle, { shadowColor: monthlyVibe.color }]}>
            <View style={styles.coreBubble}>
              <Text style={[styles.vibeText, { color: monthlyVibe.color }]}>{monthlyVibe.text}</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Monthly Goal Progress</Text>
            <Text style={styles.progressCount}>{totalPlannedDates} / {dateSettings.datesPerMonth || 4} Dates</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { 
                  width: `${Math.min(100, (totalPlannedDates / Math.max(1, parseInt(dateSettings.datesPerMonth) || 4)) * 100)}%` 
                }
              ]}
            />
          </View>
          {totalPlannedDates >= parseInt(dateSettings.datesPerMonth || '4') && (
            <Text style={styles.progressSuccessText}>Goal Met! Great job aligning values! 🎉</Text>
          )}
        </View>

        <View style={styles.goalsContainer} transparent>
          <Text style={styles.sectionTitle}>Monthly Settings 🗓️</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Monthly Budget</Text>
              <View style={styles.settingInputContainer}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.settingInput}
                  value={dateSettings.monthlyBudget}
                  keyboardType="numeric"
                  onChangeText={(val) => updateDateSettings({ ...dateSettings, monthlyBudget: val })}
                />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dates Per Month</Text>
              <TextInput
                style={[styles.settingInput, { textAlign: 'center', width: 60 }]}
                value={dateSettings.datesPerMonth}
                keyboardType="numeric"
                onChangeText={(val) => updateDateSettings({ ...dateSettings, datesPerMonth: val })}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Preferences & Constraints</Text>
              <Text style={styles.settingSubLabel}>Select what matters to you both:</Text>

              <View style={styles.tagsContainer}>
                {['Outdoors 🌲', 'Art & Culture 🎨', 'Foodie 🍔', 'Relaxing 🧖', 'Active 🏃', 'Nightlife 🍸', 'Cheap & Cheerful 💸', 'Luxury 💎'].map((tag) => {
                  const isSelected = dateSettings.userPreferences.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      style={[styles.tag, isSelected && styles.tagSelected]}
                      onPress={() => {
                        const newPrefs = isSelected
                          ? dateSettings.userPreferences.filter(t => t !== tag)
                          : [...(dateSettings.userPreferences || []), tag];
                        updateDateSettings({ ...dateSettings, userPreferences: newPrefs });
                      }}
                    >
                      <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint, // Soft Coral
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFF',
    marginTop: -4, // Center visually
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 5,
    color: '#292524',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    color: '#78716C',
    letterSpacing: 1,
  },
  vibeContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  pulseBubble: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFE4E6', // Very soft pink
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#FB7185",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  coreBubble: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  vibeText: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#E11D48', // Darker pink/red text
  },
  goalsContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 15,
    alignSelf: 'flex-start',
    marginLeft: 4,
    color: '#292524',
  },
  settingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginHorizontal: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    color: '#57534E',
  },
  settingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  currencyPrefix: {
    fontSize: 16,
    color: '#A8A29E',
    marginRight: 5,
    fontFamily: 'Nunito_700Bold',
  },
  settingInput: {
    color: '#292524',
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  progressContainer: {
  width: '100%',
  backgroundColor: '#FFF',
  padding: 20,
  borderRadius: 20,
  marginBottom: 30,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  marginHorizontal: 4,
},
  progressHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 10,
  alignItems: 'center',
},
  progressTitle: {
  fontFamily: 'Nunito_700Bold',
  fontSize: 16,
  color: '#292524',
},
  progressCount: {
  fontFamily: 'Lato_700Bold',
  fontSize: 14,
  color: '#E11D48',
},
  progressBarBackground: {
  height: 10,
  backgroundColor: '#F5F5F4',
  borderRadius: 5,
  overflow: 'hidden',
},
  progressBarFill: {
  height: '100%',
  backgroundColor: '#E11D48',
  borderRadius: 5,
},
  progressSuccessText: {
  marginTop: 10,
  fontFamily: 'Nunito_700Bold',
  fontSize: 14,
  color: '#15803D',
  textAlign: 'center',
},
  divider: {
  height: 1,
  backgroundColor: '#F5F5F4',
  marginVertical: 10,
},
  settingColumn: {
  paddingVertical: 10,
},
  settingSubLabel: {
  fontSize: 12,
  fontFamily: 'Lato_400Regular',
  color: '#A8A29E',
  marginBottom: 8,
},
  tagsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 10,
},
  tag: {
  backgroundColor: '#F5F5F4',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#E7E5E4',
},
  tagSelected: {
  backgroundColor: Colors.light.tint,
  borderColor: Colors.light.tint,
},
  tagText: {
  fontSize: 14,
  fontFamily: 'Nunito_700Bold',
  color: '#57534E',
},
  tagTextSelected: {
  color: '#FFF',
},
});
