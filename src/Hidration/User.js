import React from 'react';
import GoalCard from '../Hidration/Componoment/GoalCard';

const User = ({ navigation }) => {
    const handleGoalClick = () => {
        navigation.navigate('GoalScreen');
    };

    return (
        <GoalCard handleGoalClick={handleGoalClick} />
    );
};

export default User;