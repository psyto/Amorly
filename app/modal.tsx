import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useGoals } from '@/context/GoalContext';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput } from 'react-native';

export default function ModalScreen() {
  const { addGoal } = useGoals();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAddGoal = () => {
    addGoal(title, amount, description);
    router.back();
  };

  // Emma Hart Design: Clean, Paper Form.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a Shared Goal 🌿</Text>
      <Text style={styles.subtitle}>What do you want to achieve together?</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Weekend Getaway"
            placeholderTextColor="#A8A29E"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="$0.00"
            placeholderTextColor="#A8A29E"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Why is this important?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Because we deserve a break..."
            placeholderTextColor="#A8A29E"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Pressable style={styles.button} onPress={handleAddGoal}>
          <Text style={styles.buttonText}>Let's do this! 🚀</Text>
        </Pressable>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#FAFAF9', // Cream
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    color: '#292524',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    color: '#78716C',
    marginBottom: 30,
  },
  form: {
    width: '90%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#57534E',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    color: '#292524',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.light.tint, // Soft Coral
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: "#FB7185",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  }
});
