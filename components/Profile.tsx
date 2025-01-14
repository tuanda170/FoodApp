import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { supabase } from '../../FoodOrdering7/lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useNavigation } from '@react-navigation/native';

const ExploreScreen = () => {
  const [user, setUser] = useState(null); // State to store the user session
  const [fullName, setFullName] = useState(''); // State to store the user's full name
  const navigation = useNavigation();

  // Lấy thông tin người dùng và hiển thị
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          Alert.alert('Error', sessionError.message);
          return;
        }

        const userSession = session?.session?.user;
        if (!userSession) {
          Alert.alert('Error', 'No user session found.');
          return;
        }

        setUser(userSession);

        // Lấy thông tin profile từ database
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userSession.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          Alert.alert('Error', error.message);
        } else if (data) {
          setFullName(data.full_name); // 
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        Alert.alert('Error', 'Something went wrong.');
      }
    };

    fetchUser();
  }, []);

  // Hàm đăng xuất
  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Bạn có chắc chắn đăng xuất khỏi tài khoản?",
      [
        { text: "Hủy bỏ", style: "Hủy bỏ" },
        {
          text: "Đồng ý",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error('Logout error:', error.message);
            } else {
              navigation.navigate('Auth'); // Chuyển hướng về trang Đăng nhập
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const navigateToHistory = () => {
    if (user) {
      navigation.navigate('History', { userId: user.id });
    }
  };

  const navigateToAccount = () => {
    navigation.navigate('UpdateAccount', { userId: user?.id });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="person-circle-outline" style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      {/* Display user profile info */}
      {user && (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: user?.user_metadata?.avatar_url || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <ThemedText style={styles.profileText}>Email: {user.email}</ThemedText>
          <ThemedText style={styles.profileText}>Full Name: {fullName || 'Unknown'}</ThemedText>
        </View>
      )}

      <Collapsible title="Android (Đừng bấm vào đây)">
        <ThemedText>chưa có gì ...{' '}</ThemedText>
      </Collapsible>

      <TouchableOpacity onPress={navigateToHistory} style={styles.historyButton}>
        <Text style={styles.historyButtonText}>View Purchase History</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToAccount} style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update Information</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  profileText: {
    fontSize: 18,
    marginBottom: 10,
  },
  historyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  historyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff8c00',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ExploreScreen;
