import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import DashboardScreen from '@/screens/main/DashboardScreen';
import GoalsScreen from '@/screens/main/GoalsScreen';
import CreateGoalScreen from '@/screens/main/CreateGoalScreen';
import SprintsScreen from '@/screens/main/SprintsScreen';
import CreateSprintScreen from '@/screens/main/CreateSprintScreen';
import TasksScreen from '@/screens/main/TasksScreen';
import CreateTaskScreen from '@/screens/main/CreateTaskScreen';
import AIChatScreen from '@/screens/main/AIChatScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Goals Stack Navigator
const GoalsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GoalsList" component={GoalsScreen} />
    <Stack.Screen name="CreateGoal" component={CreateGoalScreen} />
  </Stack.Navigator>
);

// Sprints Stack Navigator
const SprintsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SprintsList" component={SprintsScreen} />
    <Stack.Screen name="CreateSprint" component={CreateSprintScreen} />
  </Stack.Navigator>
);

// Tasks Stack Navigator
const TasksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TasksList" component={TasksScreen} />
    <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
  </Stack.Navigator>
);

const MainNavigator = (): React.JSX.Element => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsStack}
        options={{ title: 'Hedefler' }}
      />
      <Tab.Screen 
        name="Sprints" 
        component={SprintsStack}
        options={{ title: 'Sprintler' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksStack}
        options={{ title: 'Görevler' }}
      />
      <Tab.Screen 
        name="AIChat" 
        component={AIChatScreen}
        options={{ title: 'AI Asistan' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator; 