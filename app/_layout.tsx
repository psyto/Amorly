import { useFonts } from '@expo-google-fonts/inter'; // Keep if used, otherwise remove
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { EventProvider } from '@/context/EventContext';
import { GoalProvider } from '@/context/GoalContext';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/ modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Lato_400Regular,
    Lato_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  // Force Refresh
  return (
    <ThemeProvider value={DefaultTheme}>
      <EventProvider>
        <GoalProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="add-event" options={{ presentation: 'modal' }} />
          </Stack>
        </GoalProvider>
      </EventProvider>
    </ThemeProvider>
  );
}
