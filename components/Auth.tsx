import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

export default function Auth({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {  // Hàm đăng nhập bằng email và password
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      setLoading(false);
      return;
    }

    try {
      // Lấy thông tin session của người dùng
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const currentUser = session?.session?.user;
      if (!currentUser) {
        Alert.alert('Error', 'No user session found.');
        setLoading(false);
        return;
      }

      // Lấy thông tin role của người dùng
      const { data: profile, error: profileError } = await supabase
        .from('profiles') // Lấy dữ liệu từ bảng profiles trong database
        .select('role')
        .eq('id', currentUser.id) // Match user ID
        .single();

      if (profileError || !profile) {
        throw profileError || new Error('Profile not found.');
      }

      const { role } = profile;

      // Chuyển hướng dựa trên role của người dùng
      if (role === 'admin') {
        navigation.navigate('AdminScreen'); // Chuyển hướng đến AdminScreen dành cho admin
      } else {
        navigation.navigate('Home'); // Chuyển hướng đến Home dành cho người dùng user
      }
    } catch (fetchError) {
      console.error('Error fetching user role:', fetchError);
      Alert.alert('Error', 'Unable to fetch user role.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <Icon name="fast-food-outline" size={70} color="#ff8c00" />
        <Text style={styles.headerTitle}>Food App</Text>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          inputStyle={styles.inputText} // Set input text color
          containerStyle={styles.inputContainer} // Set input container background
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          inputStyle={styles.inputText} // Set input text color
          containerStyle={styles.inputContainer} // Set input container background
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button 
          title="Sign in" 
          buttonStyle={styles.button} 
          disabled={loading} 
          onPress={signInWithEmail} 
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Don't have an account? Sign up"
          type="outline"
          onPress={() => navigation.navigate('UserInfo')} // Chuyển hướng đến UserInfo
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    backgroundColor: '#fff',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff8c00', // Set title color to match the theme
    marginTop: 10,
  },
  button: {
    backgroundColor: '#ff8c00', // Set button color to match the theme
  },
  inputText: {
    color: '#000', // Set text color inside input fields to black
  },
  inputContainer: {
    backgroundColor: '#f8f8f8', // Set a light background for input fields
    borderRadius: 5,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
