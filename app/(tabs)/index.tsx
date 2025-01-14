import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Auth from '../../components/Auth';
import FoodMenu from '../../components/FoodMenu';
import Profile from '../../components/Profile';
import PaymentScreen from '../../components/Payment';
import HistoryScreen from '../../components/History';
import AdminScreen from '../../components/Admin/AdminScreen';
import UserInfo from '../../components/UserInfo';
import AdminProfile from '../../components/Admin/AdminProfile';
import UpdateAccount from '../../components/UpdateAccount';
import TrackSale from '../../components/Admin/TrackSale';
import AdminEditUser from '../../components/Admin/AdminEditUser';
import ReviewScreen from '../../components/OrderDetails/ReviewScreen';
import CookingScreen from '../../components/OrderDetails/CookingScreen';
import DeliveryScreen from '../../components/OrderDetails/DeliveryScreen';
import OrderDetails from '../../components/OrderDetails/OrderDetails';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Hàm tạo Bottom Tab Navigator
function HomeTabs() { 
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
       
          let iconName: 'restaurant' | 'person' = 'restaurant'; // Xác định biểu tượng dựa trên tên route

          if (route.name === 'FoodMenu') {
            iconName = 'restaurant';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          // Trả về biểu tượng phù hợp
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >   
      <Tab.Screen name="FoodMenu" component={FoodMenu} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}


// Component chính của ứng dụng
export default function App() {
  return (
    <Stack.Navigator initialRouteName="Auth">
      
      <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserInfo" component={UserInfo} />
      <Stack.Screen name="AdminProfile" component={AdminProfile} />
      <Stack.Screen name="UpdateAccount" component={UpdateAccount} />
      <Stack.Screen name="TrackSale" component={TrackSale} />
      <Stack.Screen name="AdminEditUser" component={AdminEditUser} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
      <Stack.Screen name="CookingScreen" component={CookingScreen} />
      <Stack.Screen name="DeliveryScreen" component={DeliveryScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />

    </Stack.Navigator>


  );
}