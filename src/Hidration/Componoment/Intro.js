import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import logo from './logo.png';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


const Intro = () => {
    const navigation = useNavigation();
    const [stepsTaken, setStepsTaken] = useState(0);

    const steps = [
        {
            text: 'Welcome to Water Tracking App!',
            bgColor: '#FFD700', // Yellow background color for the first step
        },
        {
            text: 'Track your daily water intake with just a tap!',
            bgColor: '#32CD32', // Green background color for the second step
        },
        {
            text: 'Get notified to stay hydrated!',
            bgColor: '#1E90FF', // Blue background color for the third step
        },
    ];

    const handleSwiped = (direction) => {
        if (direction === 'right' && stepsTaken < 2) {
            // Increment stepsTaken when swiped right
            setStepsTaken((prevStepsTaken) => prevStepsTaken + 1);
        }
    };

    const renderRightActions = () => (
        <TouchableOpacity onPress={() => handleSwiped('right')}>
            <View style={styles.rightAction}></View>
        </TouchableOpacity>
    );
    const handleGetStarted = () => {
        navigation.navigate('User');

    };


    return (
        <View style={styles.container}>
            <Image source={logo} alt="Water Bottle" style={styles.logo} />
            <Text style={styles.title}>Track your daily water intake</Text>
            <Text style={styles.substitle}>Achieve your hydration goals with a simple tap!</Text>

            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={true}

            >
                {steps.map((step, index) => (
                    <View key={index} style={[styles.stepContainer, { backgroundColor: step.bgColor }]}>
                        <Text style={styles.stepText}>{step.text}</Text>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity onPress={handleGetStarted} style={styles.getStartedButton}>
                <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    logo: {
        marginTop: 100,
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    title: {
        fontSize: 25, // Adjust the font size as needed
        // Use the loaded font or fallback to a system font
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333', // Set the color to gray
    },
    substitle: {
        marginTop: 10,
        fontSize: 19,
        width: 250,
        textAlign: 'justify',
        fontWeight: 'regular',
        marginBottom: 10,
        color: 'gray', // Set the color to gray
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        height: 'auto',
        padding: 20,
        borderRadius: 10,

    },
    stepText: {
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center',
    },
    stepsTakenText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    getStartedButton: {
        backgroundColor: '#4A69D9',
        paddingVertical: 15,
        paddingHorizontal: 100,
        marginBottom: 30,// Adjust the left and right padding as needed
        borderRadius: 5,
        marginTop: 20,
    },
    getStartedText: {
        color: '#FFF',
        fontSize: 20,
    },
    rightAction: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flex: 1,
    },
    actionText: {
        color: '#4A69D9',
        fontSize: 20,
        padding: 10,
    },
    stepContainer: {
        width: window.width,
        height: 100,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        margin: 10,
    },
    stepText: {
        fontSize: 18,
        color: '#FFF',
    },
});

export default Intro;