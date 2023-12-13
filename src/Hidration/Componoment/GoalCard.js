import React, { useState, useEffect, useCallback } from 'react';
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
import { GiftedChat } from 'react-native-gifted-chat';




const GoalCard = ({ deviceName }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goal, setGoal] = useState('');
  const [reminderTime, setReminderTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [goals, setGoals] = useState([]);
  const [isChatbotModalVisible, setIsChatbotModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageIdCounter, setMessageIdCounter] = useState(1);
  const [hasBotSaidHello, setHasBotSaidHello] = useState(false);



  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };


  const handleAddGoal = async () => {
    const newGoal = { id: new Date().getTime(), goal: goal, time: currentTime };

    try {
      const formattedDate = format(new Date(currentTime), 'yyyy-MM-dd HH:mm:ss');
      const updatedGoal = { ...newGoal, time: formattedDate };

      // Save the goal
      await AsyncStorage.setItem(`@goal:${newGoal.id}`, JSON.stringify(updatedGoal));

      // Update the goals state
      setGoals((prevGoals) => [...prevGoals, updatedGoal]);
    } catch (error) {
      console.log('Error saving data:', error);
    }

    toggleModal();
  };
  const handleGoalQuestion = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const goalKeys = keys.filter((key) => key.startsWith('@goal:'));

      console.log(goalKeys);

      if (goalKeys.length > 0) {
        const lastGoalKey = goalKeys[goalKeys.length - 1];
        const lastGoalString = await AsyncStorage.getItem(lastGoalKey);
        const lastGoal = JSON.parse(lastGoalString); // Parse the correct string

        const userQuestion = {
          _id: new Date().getTime(),
          text: 'What was my last goal?',
          createdAt: new Date(),
          user: {
            _id: messageIdCounter,
            name: 'User',
          },
        };

        const chatbotResponse = {
          _id: new Date().getTime() + 1,
          text: `Your last goal was: ${lastGoal.goal}`,
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'ChatBot',
          },
        };

        setMessages((prevMessages) => [...prevMessages, userQuestion, chatbotResponse]);
      } else {
        const chatbotResponse = {
          _id: new Date().getTime(),
          text: 'You don\'t have any goals yet. Set a goal using the "Add Your Goal" button.',
          createdAt: new Date(),
          user: {
            name: 'ChatBot',
          },
        };

        setMessages((prevMessages) => [...prevMessages, chatbotResponse]);
      }
    } catch (error) {
      console.error('Error handling goal question:', error);
    }
  };

  const handleRemindButton = () => {
    const notificationContent = {
      title: 'Reminder',
      body: 'It\'s time to update your goal!',
    };

    const notificationTrigger = {
      seconds: 0,
    };

    Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: notificationTrigger,
      channelId: 'GoalReminder',
    });
  };

  const getData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const goalKeys = keys.filter((key) => key.startsWith('@goal:'));

      if (goalKeys.length > 0) {
        // Sort the keys by date in descending order
        const sortedKeys = goalKeys.sort((a, b) => {
          const dateA = parseInt(a.split(':')[2]);
          const dateB = parseInt(b.split(':')[2]);
          return dateB - dateA;
        });

        // Retrieve and set all goals in sorted order
        const allGoals = await Promise.all(
          sortedKeys.map(async (key) => {
            const goalString = await AsyncStorage.getItem(key);
            return JSON.parse(goalString);
          })
        );

        setGoals(allGoals);
        console.log(allGoals);
      } else {
        setGoals([]); // No goals found
      }
    } catch (error) {
      console.log('Error retrieving data:', error);
    }
  };

  useEffect(() => {


    getData();
    const notificationListener = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data;
      const actualDeviceName = notificationData.deviceName;
      console.log('Actual Device Name:', actualDeviceName);
    });



    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
      Notifications.removeNotificationSubscription(notificationListener);

    }
  }, [reminderTime]);
  const onSend = useCallback((messages = []) => {
    setMessages((prevMessages) =>
      GiftedChat.append(
        prevMessages,
        messages.map((message) => ({
          ...message,
          _id: `${messageIdCounter}-${new Date().getTime()}`
        }))
      )
    );
    setMessageIdCounter((prevCounter) => prevCounter + 1);
  }, []);

  const renderChatbotModalContent = () => (
    <View style={styles.chatbotModalContent}>
      <TouchableOpacity style={styles.closeButton} onPress={closeChatbotModal}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle}>Chat with the Bot:</Text>
      <View style={styles.chatbotMessagesContainer}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{ _id: 1 }}
          typingIndicatorTextStyle={{ color: '#888', fontSize: 12 }}
          renderChatFooter={() => (
            <Text style={{ alignSelf: 'center', color: '#888', fontSize: 12 }}>
              ChatBot is typing...
            </Text>
          )}
        />
      </View>
      <Button title="Ask about Goal" onPress={handleGoalQuestion} />
    </View>
  );


  const toggleChatbotModal = () => {
    setIsChatbotModalVisible(true);

    if (!hasBotSaidHello) {
      const responseDelay = 5000;
      chatbotResponseTimer = setTimeout(() => {
        const chatbotResponse = {
          _id: new Date().getTime(),
          text: 'Im Your virtual assistant how could i help you?',
          createdAt: new Date(),
          user: {
            _id: messageIdCounter,
            name: 'ChatBot',
          },
        };
        setMessages((prevMessages) => [...prevMessages, chatbotResponse]);
        setMessageIdCounter((prevCounter) => prevCounter + 1);

        setHasBotSaidHello(true);
      }, responseDelay);
    }
  };



  const closeChatbotModal = () => {
    setIsChatbotModalVisible(false);
  };



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
    <View>
      <View style={styles.card}>
        <Text style={styles.title}>{deviceName ? `Hello Special User, ${deviceName}` : 'Good Morning'}</Text>
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
          <View style={styles.buttonContainer}>
            <Button title="Remind Me" onPress={handleRemindButton} />
          </View>
        </View>
        <Modal animationType="fade" transparent={true} visible={isModalVisible}>
          {renderModalContent()}
        </Modal>
      </View>


      <View style={styles.container}>
        <View style={styles.cardContainer}>

        </View>

        <TouchableOpacity style={styles.fixedButton} onPress={toggleChatbotModal}>
          <Text style={styles.fixedButtonText}>Chat</Text>
        </TouchableOpacity>

        <Modal animationType="fade" transparent={true} visible={isChatbotModalVisible}>
          {renderChatbotModalContent()}
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginHorizontal: 10,
    flex: 1,
    borderRadius: 8,
  },
  cardFooter: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  chatbotModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    flex: 1, // Ensure that the modal content takes the full height
  },
  chatbotMessagesContainer: {
    flex: 1,
    marginBottom: 20,
  },


  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  fixedButton: {
    position: 'absolute',
    bottom: -300,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  fixedButtonText: {
    color: '#fff',
    fontSize: 18,
  },

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

});

export default GoalCard;