import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
  DateTimePicker,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import * as Notifications from 'expo-notifications';




const GoalCard = ({ deviceName }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goal, setGoal] = useState('');
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [goals, setGoals] = useState([]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };


  const handleAddGoal = async () => {
    const newGoal = { id: goals.length + 1, goal: goal, time: currentTime };

    setGoals((prevGoals) => {
      return [...prevGoals, newGoal];
    });

    setGoal('');
    toggleModal();

    try {
      const formattedDate = format(new Date(currentTime), 'yyyy-MM-dd');
      const formattedTime = format(new Date(currentTime), 'HH:mm');

      const updatedGoal = { ...newGoal, time: `${formattedDate} ${formattedTime}` };

      // Use a unique key for each goal based on its id
      await AsyncStorage.setItem(`@goal:${newGoal.id}`, JSON.stringify(updatedGoal));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const handleRemindButton = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder',
        body: 'It\'s time to update your goal!',
      },
      trigger: {
        seconds: 0,
      },
      channelId: 'GoalReminder', // Make sure this matches the channel ID used when setting the channel
    });
  };


  useEffect(() => {


    const notificationListener = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data;
      const actualDeviceName = notificationData.deviceName;
      console.log('Actual Device Name:', actualDeviceName);
    });
    const getData = async () => {
      try {
        // Retrieve all keys that match the pattern '@goal:*'
        const keys = await AsyncStorage.getAllKeys();
        const goalKeys = keys.filter((key) => key.startsWith('@goal:'));

        // Retrieve data for each goal key
        const values = await AsyncStorage.multiGet(goalKeys);
        const parsedGoals = values.map(([key, value]) => JSON.parse(value));

        setGoals(parsedGoals);
      } catch (error) {
        console.log('Error retrieving data:', error);
      }
    };

    getData();


    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
      Notifications.removeNotificationSubscription(notificationListener);

    }
  }, [reminderTime]);

  const renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Set Your Goal:</Text>
      <TextInput
        style={styles.modalInput}
        onChangeText={setGoal}
        value={goal}
        placeholder="Enter your goal here"
      />

      <Text style={styles.modalText}>Current Time: {currentTime.toLocaleTimeString()}</Text>
      <View style={styles.modalButtons}>
        <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddGoal}>
          <Text style={styles.buttonText}>Add Goal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={toggleModal}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.card}>
      <Text style={styles.title}>{deviceName ? `Good Morning, ${deviceName}` : 'Good Morning'}</Text>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>Your Goal</Text>
        {goals.length > 0 && (
          <View>
            <Text style={styles.cardText}>Goal: {goals[goals.length - 1].goal}</Text>
            <Text style={styles.cardText}>Saved Hour: {goals[goals.length - 1].time.toLocaleString()}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardFooter}>
        <Button title="Add Your Goal" onPress={toggleModal} />
        <Button title="Remind Me" onPress={handleRemindButton} />
      </View>
      <Modal animationType="fade" transparent={true} visible={isModalVisible}>
        {renderModalContent()}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({

  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  modalDateTimePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDatePickerText: {
    fontSize: 14,
    color: '#888',
  },
  modalDatePickerButton: {
    fontSize: 14,
    color: '#007bff',
  },
  modalText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardBody: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardFooter: {},
});

export default GoalCard;