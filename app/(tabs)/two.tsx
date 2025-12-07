import BackgroundGradient from '@/components/BackgroundGradient';
import MicroGoalCard from '@/components/MicroGoalCard';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useGoals } from '@/context/GoalContext';
import { Link } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet } from 'react-native';
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
  const { goals, toggleGoal } = useGoals();

  const scale = useSharedValue(1);

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
  }));

  return (
    <View style={styles.mainContainer}>
      <BackgroundGradient />

      <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
        <View style={styles.header} transparent>
          <Text style={styles.title}>Our Harmony</Text>
          <Text style={styles.subtitle}>Current Vibe</Text>
        </View>

        <View style={styles.vibeContainer} transparent>
          <Animated.View style={[styles.pulseBubble, animatedBubbleStyle]}>
            <View style={styles.coreBubble}>
              <Text style={styles.vibeText}>Synced 💖</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.goalsContainer} transparent>
          <Text style={styles.sectionTitle}>Shared Goals</Text>
          {goals.map((goal) => (
            <MicroGoalCard
              key={goal.id}
              title={goal.title}
              description={goal.description}
              isCompleted={goal.isCompleted}
              onPress={() => toggleGoal(goal.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Link href="/modal" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </Link>
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
});
