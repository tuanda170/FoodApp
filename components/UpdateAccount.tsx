import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';

interface Profile { // Interface để định nghĩa kiểu dữ liệu của profile
  id: string;
  email: string;
  full_name: string;
  phoneNumber: string;
  address: string;
  username: string;
}

export default function UpdateAccount({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [username, setUsername] = useState<string>(''); // New username state
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // State to hold the user data

  // Lấy thông tin người dùng từ database
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      // Nếu có lỗi khi lấy session thì hiển thị thông báo lỗi
      if (sessionError) {
        console.error('Session error:', sessionError);
        Alert.alert('Error', sessionError.message);
        setLoading(false);
        return;
      }

      // Lấy thông tin người dùng từ session 
      const user = session?.session?.user;
      if (!user) {
        console.error('No user session found.');
        Alert.alert('Error', 'No user session found.');
        setLoading(false);
        return;
      }

      // Set thông tin người dùng vào state
      setUser(user);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        Alert.alert('Error', profileError.message);
        setLoading(false);
        return;
      }

      setEmail(profile.email); // setEmail để hiển thị email người dùng
      setFullName(profile.full_name);
      setPhoneNumber(profile.phoneNumber);
      setAddress(profile.address);
      setUsername(profile.username); // Set the username state
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Hàm cập nhật thông tin người dùng
  const handleUpdateProfile = async () => {
    setLoading(true);
    const updates = {
      id: user.id,
      email,
      full_name: fullName,
      phoneNumber,
      address,
      username, 
      updated_at: new Date(),
    };

    // Cập nhật thông tin người dùng
    const { error } = await supabase.from('profiles').upsert(updates); 

    if (error) {
      Alert.alert('Error updating profile', error.message);
    } else {
      Alert.alert('Profile updated successfully');
    }
    setLoading(false);
  };

  return ( // Trả về giao diện cập nhật thông tin người dùng
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Cập nhật thông tin</Text>

          <Input
            label="Email"
            leftIcon={{ type: 'font-awesome', name: 'envelope' }}
            onChangeText={setEmail}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
            inputStyle={styles.input}
            labelStyle={styles.label}
          />
          <Input
            label="Full Name"
            leftIcon={{ type: 'font-awesome', name: 'user' }}
            onChangeText={setFullName}
            value={fullName}
            placeholder="Full Name"
            inputStyle={styles.input}
            labelStyle={styles.label}
          />
          <Input
            label="Phone Number"
            leftIcon={{ type: 'font-awesome', name: 'phone' }}
            onChangeText={setPhoneNumber}
            value={phoneNumber}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            inputStyle={styles.input}
            labelStyle={styles.label}
          />
          <Input
            label="Address"
            leftIcon={{ type: 'font-awesome', name: 'home' }}
            onChangeText={setAddress}
            value={address}
            placeholder="Address"
            inputStyle={styles.input}
            labelStyle={styles.label}
          />
          <Input
            label="Username"
            leftIcon={{ type: 'font-awesome', name: 'user' }}
            onChangeText={setUsername}
            value={username}
            placeholder="Username"
            inputStyle={styles.input}
            labelStyle={styles.label}
          />

          <Button
            title="Update Profile"
            loading={loading}
            onPress={handleUpdateProfile}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    color: '#333',
  },
  label: {
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default UpdateAccount;